const { REALM_ICONS, getRealmByLevel } = require('./realmIcons');
const { formatDate } = require('./date');

const MAX_LEVEL = 100;
const DAILY_NORMAL_LIMIT = 100;
const TYPE_DAILY_LIMITS = {
  upload_photo: 10,
  complete_reminder: 30
};

const SPECIAL_TYPES = ['streak_bonus', 'growth_book', 'birthday_record'];

const BADGE_DEFS = [
  { id: 'first_record', name: '初次修行', description: '完成第一张日报', icon: '🌱' },
  { id: 'streak_3', name: '三日聚灵', description: '连续记录 3 天', icon: '✨' },
  { id: 'streak_7', name: '七日守护', description: '连续记录 7 天', icon: '🛡️' },
  { id: 'streak_30', name: '满月修行', description: '连续记录 30 天', icon: '🌙' },
  { id: 'reminder_10', name: '养护小尊者', description: '完成 10 次提醒', icon: '🏅' },
  { id: 'total_100', name: '百日灵契', description: '累计记录 100 天', icon: '💫' },
  { id: 'photo_100', name: '灵影留痕', description: '累计上传 100 张照片', icon: '📸' },
  { id: 'birthday_guardian', name: '生辰守护', description: '生日当天完成记录', icon: '🎂' }
];

function database() {
  return wx.cloud.database();
}

function serverDate() {
  return database().serverDate();
}

function getNextLevelExp(level) {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, Number(level) || 1));
  if (safeLevel >= MAX_LEVEL) return 0;
  return 100 + (safeLevel - 1) * 30;
}

function calculateLevelUp(currentLevel, currentExp, addedExp) {
  let level = Math.max(1, Math.min(MAX_LEVEL, Number(currentLevel) || 1));
  let exp = Math.max(0, Number(currentExp) || 0) + Math.max(0, Number(addedExp) || 0);
  const levelBefore = level;

  while (level < MAX_LEVEL) {
    const need = getNextLevelExp(level);
    if (exp < need) break;
    exp -= need;
    level += 1;
  }

  if (level >= MAX_LEVEL) {
    level = MAX_LEVEL;
    exp = 0;
  }

  return {
    levelBefore,
    levelAfter: level,
    exp,
    nextLevelExp: getNextLevelExp(level),
    leveledUp: level > levelBefore
  };
}

function initPetGrowthFields(pet = {}) {
  const level = Math.max(1, Math.min(MAX_LEVEL, Number(pet.level) || 1));
  const realm = getRealmByLevel(level);
  const exp = Math.max(0, Number(pet.exp) || 0);
  const nextLevelExp = Number(pet.nextLevelExp) >= 0 ? Number(pet.nextLevelExp) : getNextLevelExp(level);
  const progress = nextLevelExp > 0 ? Math.min(100, Math.round((exp / nextLevelExp) * 100)) : 100;
  const today = formatDate();
  const todayDone = pet.lastRecordDate === today || pet.todayExpDate === today;

  return {
    ...pet,
    level,
    exp,
    nextLevelExp,
    realm: realm.realm,
    title: realm.title,
    realmInfo: realm,
    realmIcon: realm,
    realmIconBroken: false,
    expProgress: progress,
    expText: nextLevelExp > 0 ? `${exp}/${nextLevelExp}` : '满级',
    streakDays: Number(pet.streakDays) || 0,
    totalRecordDays: Number(pet.totalRecordDays) || 0,
    lastRecordDate: pet.lastRecordDate || '',
    todayExp: pet.todayExpDate === today ? Number(pet.todayExp) || 0 : 0,
    todayExpDate: pet.todayExpDate || '',
    todayDone,
    todayPracticeText: todayDone ? '今日修行完成' : '今日修行尚未开始',
    badges: Array.isArray(pet.badges) ? pet.badges : []
  };
}

function isSameDay(a, b) {
  return formatDate(a) === formatDate(b);
}

function addDays(dateText, amount) {
  const date = new Date(`${dateText || formatDate()}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return formatDate(date);
}

function isSpecialType(type, explicit) {
  return explicit || SPECIAL_TYPES.indexOf(type) > -1;
}

async function getPet(petId) {
  const res = await database().collection('pets').doc(petId).get();
  return initPetGrowthFields(res.data || {});
}

async function getPetExpLogs(petId, limit = 20) {
  try {
    const res = await database().collection('pet_exp_logs')
      .where({ petId })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return res.data || [];
  } catch (error) {
    console.warn('[petLevel] get exp logs failed', error);
    return [];
  }
}

async function sumLogs(petId, recordDate, matcher) {
  try {
    const res = await database().collection('pet_exp_logs').where({ petId, recordDate }).get();
    return (res.data || []).reduce((total, item) => matcher(item) ? total + Number(item.exp || 0) : total, 0);
  } catch (error) {
    console.warn('[petLevel] sum logs failed', error);
    return 0;
  }
}

async function checkDailyExpLimit(petId, type, exp, isSpecial = false) {
  if (isSpecialType(type, isSpecial)) return Math.max(0, Number(exp) || 0);
  const recordDate = formatDate();
  const requested = Math.max(0, Number(exp) || 0);
  const normalUsed = await sumLogs(petId, recordDate, (item) => !isSpecialType(item.type, item.isSpecial));
  const typeLimit = TYPE_DAILY_LIMITS[type] || DAILY_NORMAL_LIMIT;
  const typeUsed = await sumLogs(petId, recordDate, (item) => item.type === type);
  return Math.max(0, Math.min(requested, DAILY_NORMAL_LIMIT - normalUsed, typeLimit - typeUsed));
}

async function hasSourceLog(petId, sourceId) {
  if (!sourceId) return false;
  try {
    const res = await database().collection('pet_exp_logs').where({ petId, sourceId }).limit(1).get();
    return !!(res.data && res.data.length);
  } catch (error) {
    console.warn('[petLevel] check duplicate source failed', error);
    return false;
  }
}

async function addPetExp({ userId = '', petId, type, exp, title, description, sourceId, isSpecial = false }) {
  if (!petId || !type || !sourceId) {
    return { ok: false, addedExp: 0, message: '缺少灵气记录必要信息。' };
  }

  if (await hasSourceLog(petId, sourceId)) {
    const pet = await getPet(petId);
    return {
      ok: true,
      addedExp: 0,
      levelBefore: pet.level,
      levelAfter: pet.level,
      realmBefore: pet.realm,
      realmAfter: pet.realm,
      leveledUp: false,
      realmChanged: false,
      message: '这次灵气已经领取过啦。'
    };
  }

  const addedExp = await checkDailyExpLimit(petId, type, exp, isSpecial);
  if (addedExp <= 0) {
    const pet = await getPet(petId);
    return {
      ok: true,
      addedExp: 0,
      levelBefore: pet.level,
      levelAfter: pet.level,
      realmBefore: pet.realm,
      realmAfter: pet.realm,
      leveledUp: false,
      realmChanged: false,
      message: '今日普通灵气已达上限。'
    };
  }

  const pet = await getPet(petId);
  const realmBefore = getRealmByLevel(pet.level);
  const levelResult = calculateLevelUp(pet.level, pet.exp, addedExp);
  const realmAfter = getRealmByLevel(levelResult.levelAfter);
  const recordDate = formatDate();
  const db = database();

  await db.collection('pet_exp_logs').add({
    data: {
      userId,
      petId,
      type,
      exp: addedExp,
      title: title || '灵气入体',
      description: description || '',
      recordDate,
      sourceId,
      isSpecial: isSpecialType(type, isSpecial),
      createdAt: serverDate()
    }
  });

  await db.collection('pets').doc(petId).update({
    data: {
      level: levelResult.levelAfter,
      exp: levelResult.exp,
      nextLevelExp: levelResult.nextLevelExp,
      realm: realmAfter.realm,
      title: realmAfter.title,
      todayExp: pet.todayExpDate === recordDate ? Number(pet.todayExp || 0) + addedExp : addedExp,
      todayExpDate: recordDate,
      updatedAt: serverDate()
    }
  });

  return {
    ok: true,
    addedExp,
    levelBefore: pet.level,
    levelAfter: levelResult.levelAfter,
    realmBefore: realmBefore.realm,
    realmAfter: realmAfter.realm,
    leveledUp: levelResult.leveledUp,
    realmChanged: realmBefore.realm !== realmAfter.realm,
    message: realmBefore.realm !== realmAfter.realm
      ? `天象异动！${pet.name || '毛孩子'} 成功突破至【${realmAfter.realm}】！`
      : levelResult.leveledUp
        ? `灵气汇聚！${pet.name || '毛孩子'} 修为提升至 Lv.${levelResult.levelAfter}`
        : `${title || '灵气'} +${addedExp}`
  };
}

async function updateStreakDays(petId, recordDate = formatDate()) {
  const pet = await getPet(petId);
  if (pet.lastRecordDate === recordDate) return pet;

  const nextStreak = pet.lastRecordDate && pet.lastRecordDate === addDays(recordDate, -1)
    ? Number(pet.streakDays || 0) + 1
    : 1;
  const nextTotal = Number(pet.totalRecordDays || 0) + 1;

  await database().collection('pets').doc(petId).update({
    data: {
      streakDays: nextStreak,
      totalRecordDays: nextTotal,
      lastRecordDate: recordDate,
      updatedAt: serverDate()
    }
  });

  return {
    ...pet,
    streakDays: nextStreak,
    totalRecordDays: nextTotal,
    lastRecordDate: recordDate
  };
}

function hasBadge(badges, id) {
  return (badges || []).some((item) => item.id === id);
}

async function checkAndUnlockBadges(petId) {
  const pet = await getPet(petId);
  const logs = await getPetExpLogs(petId, 200);
  const badges = (pet.badges || []).slice();
  const nowText = formatDate(new Date(), true);
  const unlock = (id) => {
    if (hasBadge(badges, id)) return;
    const def = BADGE_DEFS.find((item) => item.id === id);
    if (def) badges.push({ ...def, unlockedAt: nowText });
  };

  if (logs.some((item) => item.type === 'daily_card')) unlock('first_record');
  if (pet.streakDays >= 3) unlock('streak_3');
  if (pet.streakDays >= 7) unlock('streak_7');
  if (pet.streakDays >= 30) unlock('streak_30');
  if (pet.totalRecordDays >= 100) unlock('total_100');
  if (logs.filter((item) => item.type === 'complete_reminder').length >= 10) unlock('reminder_10');
  if (logs.filter((item) => item.type === 'upload_photo').length >= 100) unlock('photo_100');
  if (logs.some((item) => item.type === 'birthday_record')) unlock('birthday_guardian');

  if (badges.length !== (pet.badges || []).length) {
    await database().collection('pets').doc(petId).update({
      data: {
        badges,
        updatedAt: serverDate()
      }
    });
  }

  return badges;
}

async function grantDailyCardExp(card, cardId) {
  if (!card || !card.petId || !cardId) return [];
  const results = [];
  const recordDate = card.recordDate || formatDate();

  results.push(await addPetExp({
    petId: card.petId,
    type: 'daily_card',
    exp: 20,
    title: '日报修行',
    description: '创建一张宠物日报卡，灵气 +20',
    sourceId: `daily_card:${card.petId}:${recordDate}`
  }));

  const images = (card.images || []).filter(Boolean);
  if (images.length) {
    results.push(await addPetExp({
      petId: card.petId,
      type: 'upload_photo',
      exp: Math.min(images.length * 5, 10),
      title: '灵影留痕',
      description: '上传今日宠物照片，灵气 +5/张，每日最多 +10',
      sourceId: `upload_photo:${cardId}`
    }));
  }

  const streakPet = await updateStreakDays(card.petId, recordDate);
  if ([3, 7, 30].indexOf(streakPet.streakDays) > -1) {
    const bonusMap = { 3: 20, 7: 50, 30: 200 };
    results.push(await addPetExp({
      petId: card.petId,
      type: 'streak_bonus',
      exp: bonusMap[streakPet.streakDays],
      title: `${streakPet.streakDays} 日连续修行`,
      description: `连续记录 ${streakPet.streakDays} 天，额外灵气 +${bonusMap[streakPet.streakDays]}`,
      sourceId: `streak_bonus:${card.petId}:${streakPet.streakDays}:${recordDate}`,
      isSpecial: true
    }));
  }

  try {
    const pet = await getPet(card.petId);
    if (pet.birthday && pet.birthday.slice(5) === recordDate.slice(5)) {
      results.push(await addPetExp({
        petId: card.petId,
        type: 'birthday_record',
        exp: 100,
        title: '生辰守护',
        description: '生日当天完成记录，灵气 +100',
        sourceId: `birthday_record:${card.petId}:${recordDate}`,
        isSpecial: true
      }));
    }
    await checkAndUnlockBadges(card.petId);
  } catch (error) {
    console.warn('[petLevel] daily bonus extras failed', error);
  }

  return results.filter(Boolean);
}

function buildExpMessage(results = []) {
  const gained = results.reduce((sum, item) => sum + Number(item.addedExp || 0), 0);
  const breakthrough = results.find((item) => item.realmChanged);
  const levelUp = results.find((item) => item.leveledUp);
  if (breakthrough) return breakthrough.message;
  if (levelUp) return levelUp.message;
  if (gained > 0) return `今日修行完成，灵气 +${gained}`;
  return '今日修行已记录，灵气奖励已领取过啦。';
}

module.exports = {
  MAX_LEVEL,
  REALM_ICONS,
  BADGE_DEFS,
  getNextLevelExp,
  getRealmByLevel,
  calculateLevelUp,
  initPetGrowthFields,
  addPetExp,
  checkDailyExpLimit,
  updateStreakDays,
  checkAndUnlockBadges,
  getPetExpLogs,
  grantDailyCardExp,
  buildExpMessage
};
