const { formatDate, getDayStart, getDayEnd } = require('./date');
const { calculateNextRunAt } = require('./reminder');
const { canAutoSyncReminderToDaily } = require('./membership');
const { initPetGrowthFields, addPetExp, checkAndUnlockBadges } = require('./petLevel');
const { applyCreatorOverride, isCreator } = require('./permission');
const { DEFAULT_THEME_ID, getThemeById } = require('./themes');
const { DEFAULT_CUSTOM_THEME, getThemeSnapshot } = require('./themeManager');

const CLOUD_TIMEOUT = 2500;

function db() {
  return wx.cloud.database();
}

function now() {
  return db().serverDate();
}

function defaultUser() {
  return {
    _id: '',
    role: 'user',
    plan: 'free',
    planExpireAt: null,
    currentThemeId: DEFAULT_THEME_ID,
    customTheme: DEFAULT_CUSTOM_THEME,
    unlockedTemplates: []
  };
}

function omitViewFields(data = {}) {
  const {
    _id,
    _openid,
    typeIcon,
    typeLabel,
    repeatLabel,
    nextRunText,
    timeText,
    statusText,
    statusClass,
    healthTip,
    isToday,
    ...payload
  } = data;
  return payload;
}

function fail(message, error) {
  if (error) console.warn('[cloud] operation failed', error);
  return { ok: false, message };
}

function isCollectionMissing(error) {
  const message = `${error && (error.errMsg || error.message || error)}`;
  return message.indexOf('DATABASE_COLLECTION_NOT_EXIST') > -1 ||
    message.indexOf('collection not exists') > -1 ||
    message.indexOf('collection not exist') > -1;
}

function normalizeErrorMessage(error, collectionName, action = '操作') {
  if (isCollectionMissing(error)) {
    return `${action}失败，请确认已创建 ${collectionName} 集合，并检查数据库权限。`;
  }
  const message = error && (error.errMsg || error.message);
  if (message && message.indexOf('timeout') > -1) {
    return `${action}超时，请检查云开发环境、网络和 ${collectionName} 集合权限。`;
  }
  return `${action}失败，请检查云开发配置和 ${collectionName} 集合权限。`;
}

function withTimeout(promise, ms = CLOUD_TIMEOUT, fallback, label = 'cloud request') {
  let timer = null;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[cloud] ${label} timeout after ${ms}ms`);
      resolve(typeof fallback === 'function' ? fallback(new Error('timeout')) : fallback);
    }, ms);
  });

  const guarded = Promise.resolve(promise)
    .then((value) => {
      clearTimeout(timer);
      return value;
    })
    .catch((error) => {
      clearTimeout(timer);
      if (isCollectionMissing(error)) console.warn(`[cloud] ${label} collection missing`, error);
      else console.warn(`[cloud] ${label} failed`, error);
      return typeof fallback === 'function' ? fallback(error) : fallback;
    });

  return Promise.race([guarded, timeout]);
}

function showCollectionTip(name) {
  wx.showToast({ title: `请先创建 ${name} 集合`, icon: 'none' });
}

async function safeGetList(collectionName, buildQuery) {
  const request = (async () => {
    const database = db();
    const base = database.collection(collectionName);
    const query = buildQuery ? buildQuery(base, database.command) : base;
    const result = await query.get();
    return result.data || [];
  })();

  return withTimeout(request, CLOUD_TIMEOUT, [], collectionName);
}

async function ensureUser() {
  const request = (async () => {
    const database = db();
    const result = await database.collection('users').limit(1).get();
    if (result.data.length) {
      const existing = result.data[0];
      const normalized = applyCreatorOverride({
        currentThemeId: DEFAULT_THEME_ID,
        customTheme: DEFAULT_CUSTOM_THEME,
        ...existing
      });
      const roleChanged = normalized.role !== existing.role;
      const planChanged = normalized.plan !== existing.plan;
      const themeMissing = !existing.currentThemeId;
      const normalizedThemeId = getThemeById(normalized.currentThemeId).id;
      const themeChanged = existing.currentThemeId !== normalizedThemeId;
      const customThemeMissing = !existing.customTheme;
      if (existing._id && (roleChanged || planChanged || themeMissing || themeChanged || customThemeMissing)) {
        await database.collection('users').doc(existing._id).update({
          data: {
            role: normalized.role,
            plan: normalized.plan,
            currentThemeId: normalizedThemeId,
            customTheme: normalized.customTheme,
            updatedAt: now()
          }
        });
      }
      if (isCreator(normalized)) {
        console.log('[权限] 当前用户为创作者，已解锁全部模板');
      }
      return normalized;
    }

    const user = {
      role: 'user',
      plan: 'free',
      planExpireAt: null,
      currentThemeId: DEFAULT_THEME_ID,
      customTheme: DEFAULT_CUSTOM_THEME,
      unlockedTemplates: [],
      createdAt: now(),
      updatedAt: now()
    };
    const added = await database.collection('users').add({ data: user });
    let created = { _id: added._id, ...user };
    try {
      const createdDoc = await database.collection('users').doc(added._id).get();
      created = { ...created, ...(createdDoc.data || {}) };
    } catch (error) {
      console.warn('[cloud] read created user failed', error);
    }
    const normalized = applyCreatorOverride(created);
    if (isCreator(normalized)) {
      await database.collection('users').doc(added._id).update({
        data: {
          role: normalized.role,
          plan: normalized.plan,
          updatedAt: now()
        }
      });
      console.log('[权限] 当前用户为创作者，已解锁全部模板');
    }
    return normalized;
  })();

  return withTimeout(request, CLOUD_TIMEOUT, defaultUser(), 'users');
}

async function getPets() {
  const pets = await safeGetList('pets', (collection) => collection.orderBy('createdAt', 'desc'));
  return pets.map(initPetGrowthFields);
}

function growthDefaults() {
  return {
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    realm: '初灵觉醒',
    title: '刚入门的小灵宠',
    streakDays: 0,
    totalRecordDays: 0,
    lastRecordDate: '',
    todayExp: 0,
    todayExpDate: '',
    badges: []
  };
}

async function addPet(data) {
  const request = db().collection('pets').add({
    data: {
      ...growthDefaults(),
      ...data,
      createdAt: now(),
      updatedAt: now()
    }
  });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'pets', '保存'), error), 'add pets');
}

async function updatePet(id, data) {
  const request = db().collection('pets').doc(id).update({
    data: {
      ...data,
      updatedAt: now()
    }
  });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'pets', '保存'), error), 'update pets');
}

async function deletePet(id) {
  const request = db().collection('pets').doc(id).remove();
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'pets', '删除'), error), 'delete pets');
}

async function getDailyCards(filter = {}) {
  return safeGetList('daily_cards', (collection) => {
    let query = collection;
    if (filter.petId) query = query.where({ petId: filter.petId });
    return query.orderBy('createdAt', 'desc');
  });
}

async function getCardsByPetId(petId) {
  return getDailyCards({ petId });
}

async function getTodayDailyCards() {
  return safeGetList('daily_cards', (collection, _) => collection.where({
    createdAt: _.gte(getDayStart()).and(_.lte(getDayEnd()))
  }));
}

async function addDailyCard(data) {
  const theme = data.customThemeSnapshot ? {
    id: data.themeId || 'custom_theme',
    name: data.themeName || '我的主题',
    type: 'custom',
    cardStyle: data.cardStyle || 'custom',
    cardClass: data.cardClass || 'card-custom',
    customTheme: data.customThemeSnapshot
  } : getThemeById(data.themeId || data.templateId || data.selectedTemplateId);
  const snapshot = getThemeSnapshot(theme);
  const payload = {
    ...data,
    themeId: snapshot.themeId,
    themeName: snapshot.themeName,
    themeType: snapshot.themeType,
    cardStyle: snapshot.cardStyle,
    cardClass: snapshot.cardClass,
    customThemeSnapshot: snapshot.customThemeSnapshot,
    templateId: snapshot.themeId,
    recordDate: data.recordDate || formatDate(),
    careRecords: data.careRecords || [],
    createdAt: now()
  };
  const request = db().collection('daily_cards').add({ data: payload });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'daily_cards', '保存日报'), error), 'add daily card');
}

async function getReminders(filter = {}) {
  return safeGetList('reminders', (collection) => {
    let query = collection;
    if (filter.petId) query = query.where({ petId: filter.petId });
    return query.orderBy('nextRunAt', 'asc');
  });
}

async function getTodayReminders() {
  return safeGetList('reminders', (collection, _) => collection.where({
    nextRunAt: _.gte(getDayStart()).and(_.lte(getDayEnd()))
  }).orderBy('nextRunAt', 'asc'));
}

async function addReminder(data) {
  return addLocalReminder(data);
}

async function updateReminder(id, data) {
  const payload = {
    ...omitViewFields(data),
    nextRunAt: calculateNextRunAt(data),
    updatedAt: now()
  };
  const request = db().collection('reminders').doc(id).update({ data: payload });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'reminders', '保存提醒'), error), 'update reminders');
}

async function deleteReminder(id) {
  const request = db().collection('reminders').doc(id).remove();
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'reminders', '删除提醒'), error), 'delete reminders');
}

async function addLocalReminder(data) {
  const request = db().collection('reminders').add({
    data: {
      ...data,
      nextRunAt: calculateNextRunAt(data),
      createdAt: now(),
      updatedAt: now()
    }
  });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'reminders', '保存提醒'), error), 'add reminders');
}

async function writeReminderLog(reminder, careRecord) {
  const payload = {
    petId: reminder.petId || '',
    reminderId: reminder._id || '',
    type: reminder.type || 'custom',
    title: reminder.title || careRecord.title || '养护提醒',
    scheduledAt: reminder.nextRunAt || new Date(),
    completedAt: new Date(),
    status: 'completed',
    createdAt: now()
  };
  const request = db().collection('reminder_logs').add({ data: payload });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'reminder_logs', '记录完成'), error), 'add reminder log');
}

async function syncCareRecordToTodayCard(reminder, careRecord) {
  const database = db();
  const today = formatDate();
  const findRequest = database.collection('daily_cards').where({
    petId: reminder.petId || '',
    recordDate: today
  }).limit(1).get();

  const cards = await withTimeout(findRequest, CLOUD_TIMEOUT, [], 'find today daily card');
  if (cards && cards.data && cards.data.length) {
    const card = cards.data[0];
    const updateRequest = database.collection('daily_cards').doc(card._id).update({
      data: {
        careRecords: database.command.push(careRecord)
      }
    });
    return withTimeout(updateRequest, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'daily_cards', '同步日报'), error), 'sync daily care records');
  }

  const addRequest = database.collection('daily_cards').add({
    data: {
      petId: reminder.petId || '',
      petName: reminder.petName || '',
      petType: reminder.petType || '',
      images: [],
      careRecords: [careRecord],
      dailyNote: '今天也是认真陪伴毛孩子的一天。',
      themeId: DEFAULT_THEME_ID,
      themeName: '奶油日常',
      themeType: 'preset',
      cardStyle: 'cute_daily',
      templateId: DEFAULT_THEME_ID,
      recordDate: today,
      isDraft: true,
      createdAt: now()
    }
  });
  return withTimeout(addRequest, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'daily_cards', '同步日报'), error), 'create daily care draft');
}

async function completeReminder(reminderId, options = {}) {
  const database = db();
  const reminderResult = await withTimeout(
    database.collection('reminders').doc(reminderId).get(),
    CLOUD_TIMEOUT,
    null,
    'get reminder before complete'
  );

  if (!reminderResult || !reminderResult.data) {
    return {
      result: fail('记录完成失败，请确认已创建 reminders 集合，并检查数据库权限。')
    };
  }

  const reminder = reminderResult.data;
  const careRecord = {
    type: reminder.type || 'custom',
    title: reminder.title || '养护提醒',
    completedAt: new Date()
  };
  const logResult = await writeReminderLog(reminder, careRecord);
  if (logResult && logResult.ok === false) {
    return { result: logResult };
  }

  const updateRequest = database.collection('reminders').doc(reminderId).update({
    data: {
      completedAt: new Date(),
      status: 'completed',
      updatedAt: now()
    }
  });
  await withTimeout(updateRequest, CLOUD_TIMEOUT, null, 'mark reminder completed');

  let expResult = null;
  if (reminder.petId && logResult && logResult._id) {
    try {
      expResult = await addPetExp({
        petId: reminder.petId,
        type: 'complete_reminder',
        exp: 10,
        title: '养护完成',
        description: '完成一次养护提醒，灵气 +10',
        sourceId: `complete_reminder:${logResult._id}`
      });
      await checkAndUnlockBadges(reminder.petId);
    } catch (error) {
      console.warn('[cloud] reminder exp failed', error);
    }
  }

  const user = await ensureUser();
  const autoSynced = !!(options.autoSync !== false && canAutoSyncReminderToDaily(user));
  if (autoSynced) {
    const syncResult = await syncCareRecordToTodayCard(reminder, careRecord);
    if (syncResult && syncResult.ok === false) {
      return {
        result: {
          ok: false,
          message: syncResult.message,
          careRecord,
          expResult,
          autoSynced: false,
          path: '/pages/create-card/create-card'
        }
      };
    }
  }

  return {
    result: {
      ok: true,
      careRecord,
      expResult,
      autoSynced,
      reminderLogId: logResult && logResult._id,
      path: '/pages/create-card/create-card'
    }
  };
}

async function updateUser(data) {
  const user = await ensureUser();
  if (!user._id) {
    showCollectionTip('users');
    return { ok: false, message: '请先创建 users 集合，并检查数据库权限。' };
  }
  const request = db().collection('users').doc(user._id).update({
    data: {
      ...data,
      updatedAt: now()
    }
  });
  return withTimeout(request, CLOUD_TIMEOUT, (error) => fail(normalizeErrorMessage(error, 'users', '保存设置'), error), 'update user');
}

module.exports = {
  withTimeout,
  ensureUser,
  updateUser,
  getPets,
  addPet,
  updatePet,
  deletePet,
  getDailyCards,
  getCardsByPetId,
  getTodayDailyCards,
  addDailyCard,
  getReminders,
  getTodayReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  addLocalReminder
};
