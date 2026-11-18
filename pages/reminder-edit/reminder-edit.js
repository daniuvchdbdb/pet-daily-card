const db = require('../../utils/db');
const { requestReminderSubscribe } = require('../../utils/subscribe');
const { formatDate } = require('../../utils/date');
const { REMINDER_TYPES, REPEAT_TYPES, HEALTH_REMINDER_DETAIL } = require('../../utils/constants');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

function getHealthTip(type) {
  const item = REMINDER_TYPES.find((option) => option.key === type);
  return item && item.health ? HEALTH_REMINDER_DETAIL : '';
}

Page({
  data: {
    themeInfo: null,
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    id: '',
    pageTitle: '新增提醒',
    user: null,
    pets: [],
    petIndex: 0,
    selectedPet: {},
    reminderTypes: REMINDER_TYPES,
    repeatTypes: REPEAT_TYPES,
    typeIndex: 0,
    repeatIndex: 1,
    healthTip: '',
    weekdayItems: [],
    form: {
      petId: '',
      petName: '',
      type: 'feed',
      title: '喂饭',
      note: '',
      enabled: false,
      subscribeEnabled: false,
      subscribeStatus: 'unknown',
      repeatType: 'daily',
      intervalDays: 7,
      remindTime: '09:00',
      remindDate: formatDate(),
      weekdays: [],
      autoSyncToDailyCard: false
    }
  },

  async onLoad(query = {}) {
    try {
      const [user, pets, reminders] = await Promise.all([db.ensureUser(), db.getPets(), db.getReminders()]);
      applyThemeToPage(this, resolveTheme(user));

      let form = this.data.form;
      const id = query.id || '';
      if (id) {
        form = { ...form, ...(reminders.find((item) => item._id === id) || {}) };
      } else if (query.petId) {
        const pet = pets.find((item) => item._id === query.petId);
        if (pet) form = { ...form, petId: pet._id, petName: pet.name };
      }

      const petIndex = Math.max(pets.findIndex((item) => item._id === form.petId), 0);
      const selectedPet = pets[petIndex] || {};
      if (!form.petId && selectedPet._id) form = { ...form, petId: selectedPet._id, petName: selectedPet.name };

      const typeIndex = Math.max(REMINDER_TYPES.findIndex((item) => item.key === form.type), 0);
      const repeatIndex = Math.max(REPEAT_TYPES.findIndex((item) => item.key === form.repeatType), 0);
      this.setData({
        id,
        pageTitle: id ? '编辑提醒' : '新增提醒',
        user,
        pets,
        form,
        petIndex,
        selectedPet,
        typeIndex,
        repeatIndex,
        weekdayItems: this.buildWeekdayItems(form.weekdays || []),
        healthTip: getHealthTip(form.type)
      });
    } catch (error) {
      console.warn('[page] reminder info load failed', error);
      wx.showToast({ title: '提醒信息加载失败', icon: 'none' });
    }
  },

  buildWeekdayItems(selected) {
    return [
      { label: '日', value: 0 },
      { label: '一', value: 1 },
      { label: '二', value: 2 },
      { label: '三', value: 3 },
      { label: '四', value: 4 },
      { label: '五', value: 5 },
      { label: '六', value: 6 }
    ].map((item) => ({ ...item, selected: selected.indexOf(item.value) > -1 }));
  },

  input(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: event.detail.value });
  },

  pickPet(event) {
    const index = Number(event.detail.value);
    const pet = this.data.pets[index] || {};
    this.setData({ petIndex: index, selectedPet: pet, 'form.petId': pet._id, 'form.petName': pet.name });
  },

  pickType(event) {
    const index = Number(event.detail.value);
    const type = REMINDER_TYPES[index];
    this.setData({
      typeIndex: index,
      'form.type': type.key,
      'form.title': type.label,
      healthTip: getHealthTip(type.key)
    });
  },

  pickRepeat(event) {
    const index = Number(event.detail.value);
    this.setData({ repeatIndex: index, 'form.repeatType': REPEAT_TYPES[index].key });
  },

  pickTime(event) {
    this.setData({ 'form.remindTime': event.detail.value });
  },

  pickDate(event) {
    this.setData({ 'form.remindDate': event.detail.value });
  },

  toggleEnabled(event) {
    this.setData({ 'form.enabled': event.detail.value });
  },

  toggleWeekday(event) {
    const value = Number(event.currentTarget.dataset.value);
    const weekdays = this.data.form.weekdays.slice();
    const index = weekdays.indexOf(value);
    if (index > -1) weekdays.splice(index, 1);
    else weekdays.push(value);
    this.setData({ 'form.weekdays': weekdays, weekdayItems: this.buildWeekdayItems(weekdays) });
  },

  async toggleSubscribe(event) {
    if (!event.detail.value) {
      this.setData({ 'form.subscribeEnabled': false, 'form.subscribeStatus': 'unknown' });
      return;
    }

    const status = await requestReminderSubscribe();
    this.setData({ 'form.subscribeEnabled': true, 'form.subscribeStatus': status });
    if (status !== 'accept') {
      wx.showToast({
        title: '你还没有开启微信服务通知，到点可能无法收到微信提醒，可稍后在提醒设置中开启。',
        icon: 'none',
        duration: 3000
      });
    }
  },

  async save() {
    if (!this.data.form.petId) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '保存中' });
      const result = this.data.id
        ? await db.updateReminder(this.data.id, this.data.form)
        : await db.addReminder(this.data.form);

      if (result && result.ok === false) {
        wx.showModal({
          title: '保存失败',
          content: result.message || '请确认已创建 reminders 集合，并检查数据库权限。',
          showCancel: false
        });
        return;
      }

      wx.showToast({ title: '已保存' });
      setTimeout(() => wx.navigateBack(), 300);
    } catch (error) {
      console.warn('[page] save reminder failed', error);
      wx.showModal({
        title: '保存失败',
        content: '请确认已创建 reminders 集合，并检查数据库权限。',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  deleteReminder() {
    if (!this.data.id) return;
    wx.showModal({
      title: '删除提醒',
      content: '确认删除这条养护提醒吗？删除后不会影响已经保存的日报记录。',
      confirmText: '删除',
      confirmColor: '#C85B47',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中' });
        try {
          const result = await db.deleteReminder(this.data.id);
          if (result && result.ok === false) {
            wx.showModal({ title: '删除失败', content: result.message, showCancel: false });
            return;
          }
          wx.showToast({ title: '已删除' });
          setTimeout(() => wx.navigateBack(), 300);
        } catch (error) {
          console.warn('[page] delete reminder failed', error);
          wx.showModal({
            title: '删除失败',
            content: '请确认 reminders 集合和数据库权限。',
            showCancel: false
          });
        } finally {
          wx.hideLoading();
        }
      }
    });
  }
});
