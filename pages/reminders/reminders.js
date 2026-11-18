const db = require('../../utils/db');
const { REMINDER_TYPES, REPEAT_TYPES, HEALTH_REMINDER_DETAIL } = require('../../utils/constants');
const { formatDate } = require('../../utils/date');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

const TYPE_MAP = REMINDER_TYPES.reduce((map, item) => {
  map[item.key] = item;
  return map;
}, {});

const REPEAT_MAP = REPEAT_TYPES.reduce((map, item) => {
  map[item.key] = item;
  return map;
}, {});

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

function buildReminderView(item) {
  const type = TYPE_MAP[item.type] || TYPE_MAP.custom;
  const repeat = REPEAT_MAP[item.repeatType] || {};
  const runAt = item.nextRunAt ? new Date(item.nextRunAt) : null;
  const completed = item.status === 'completed' || item.completedAt;
  const enabled = !!item.enabled;

  return {
    ...item,
    typeIcon: type.icon || '✨',
    typeLabel: type.label || item.type || '提醒',
    repeatLabel: repeat.label || item.repeatType || '未设置',
    nextRunText: item.nextRunAt ? formatDate(item.nextRunAt, true) : '-',
    timeText: runAt && !Number.isNaN(runAt.getTime())
      ? `${String(runAt.getHours()).padStart(2, '0')}:${String(runAt.getMinutes()).padStart(2, '0')}`
      : '--:--',
    statusText: completed ? '已完成' : (enabled ? '待完成' : '已关闭'),
    statusClass: completed ? 'done' : (enabled ? 'pending' : 'off'),
    healthTip: type.health ? HEALTH_REMINDER_DETAIL : '',
    isToday: isToday(item.nextRunAt)
  };
}

Page({
  data: {
    themeInfo: null,
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    pets: [],
    reminders: [],
    todayReminders: [],
    allReminders: [],
    summary: {
      todayCount: 0,
      enabledCount: 0
    },
    petFilterOptions: [{ _id: '', name: '全部宠物' }],
    petFilterIndex: 0,
    queryPetId: ''
  },

  onLoad(query = {}) {
    this.setData({ queryPetId: query.petId || '' });
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const [user, pets] = await Promise.all([db.ensureUser(), db.getPets()]);
      applyThemeToPage(this, resolveTheme(user));

      const options = [{ _id: '', name: '全部宠物' }].concat(pets);
      const filterIndex = this.data.queryPetId
        ? Math.max(options.findIndex((item) => item._id === this.data.queryPetId), 0)
        : this.data.petFilterIndex;
      const petId = options[filterIndex] && options[filterIndex]._id;
      const reminders = (await db.getReminders(petId ? { petId } : {})).map(buildReminderView);

      this.setData({
        pets,
        petFilterOptions: options,
        petFilterIndex: filterIndex,
        reminders,
        todayReminders: reminders.filter((item) => item.isToday),
        allReminders: reminders,
        summary: {
          todayCount: reminders.filter((item) => item.isToday).length,
          enabledCount: reminders.filter((item) => item.enabled).length
        }
      });
    } catch (error) {
      console.warn('[page] reminders load failed', error);
      this.setData({ reminders: [], todayReminders: [], allReminders: [] });
      wx.showToast({ title: '提醒加载失败，请检查云开发配置', icon: 'none' });
    }
  },

  pickPetFilter(event) {
    this.setData({ petFilterIndex: Number(event.detail.value), queryPetId: '' }, () => this.load());
  },

  addReminder() {
    const current = this.data.petFilterOptions[this.data.petFilterIndex];
    const suffix = current && current._id ? `?petId=${current._id}` : '';
    wx.navigateTo({ url: `/pages/reminder-edit/reminder-edit${suffix}` });
  },

  editReminder(event) {
    wx.navigateTo({ url: `/pages/reminder-edit/reminder-edit?id=${event.currentTarget.dataset.id}` });
  },

  async toggleEnabled(event) {
    const reminderId = event.currentTarget.dataset.id;
    const reminder = this.data.allReminders.find((item) => item._id === reminderId) || {};
    wx.showLoading({ title: '保存中' });
    try {
      const result = await db.updateReminder(reminderId, {
        ...reminder,
        enabled: event.detail.value
      });
      if (result && result.ok === false) {
        wx.showToast({ title: result.message || '保存失败', icon: 'none' });
        return;
      }
      this.load();
    } catch (error) {
      console.warn('[page] toggle reminder failed', error);
      wx.showToast({ title: '保存失败，请检查 reminders 集合', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async completeReminder(event) {
    const reminderId = event.currentTarget.dataset.id;
    wx.showLoading({ title: '记录中' });
    try {
      const result = await db.completeReminder(reminderId);
      const data = result.result || {};
      if (data.ok === false) {
        wx.showToast({ title: data.message || '记录失败', icon: 'none' });
        return;
      }
      if (data.careRecord) wx.setStorageSync('pendingCareRecord', data.careRecord);
      wx.showToast({
        title: data.expResult && data.expResult.addedExp ? `养护完成，灵气 +${data.expResult.addedExp}` : '养护完成',
        icon: 'none'
      });
      setTimeout(() => {
        wx.showModal({
          title: '已完成',
          content: data.autoSynced ? '已自动同步到今日日报卡。' : '要把这次养护记录加入今日日报卡吗？',
          confirmText: data.autoSynced ? '去查看' : '去日报',
          success: (res) => {
            if (res.confirm) wx.navigateTo({ url: data.path || '/pages/create-card/create-card' });
            else this.load();
          }
        });
      }, 500);
    } catch (error) {
      console.warn('[page] complete reminder failed', error);
      wx.showToast({ title: '记录失败，请检查云开发配置', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
