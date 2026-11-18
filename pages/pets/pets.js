const db = require('../../utils/db');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

Page({
  data: {
    pets: [],
    user: null,
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    themeName: '奶油日常',
    loading: false
  },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ loading: true });
    try {
      const [user, pets] = await Promise.all([db.ensureUser(), db.getPets()]);
      const theme = resolveTheme(user);
      applyThemeToPage(this, theme);
      const themedPets = pets.map((item) => ({
        ...item,
        themeName: theme.name,
        typeText: [item.type, item.gender].filter(Boolean).join(' · ') || '未填写类型',
        expText: item.expText || `${item.exp || 0}/${item.nextLevelExp || 100}`,
        expProgress: item.expProgress || Math.min(100, Math.round(((item.exp || 0) / (item.nextLevelExp || 100)) * 100))
      }));
      this.setData({ user, pets: themedPets, themeName: theme.name });
    } catch (error) {
      console.warn('[page] pets load failed', error);
      wx.showToast({ title: '宠物档案加载失败，请检查云开发配置', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async addPet() {
    let user = this.data.user;
    try {
      if (!user) {
        user = await db.ensureUser();
        this.setData({ user });
      }
      wx.navigateTo({ url: '/pages/pet-edit/pet-edit' });
    } catch (error) {
      wx.showModal({
        title: '无法新增宠物',
        content: '请先确认云开发环境和 pets、users 集合已配置。',
        showCancel: false
      });
    }
  },

  editPet(event) {
    wx.navigateTo({ url: `/pages/pet-edit/pet-edit?id=${event.currentTarget.dataset.id}` });
  },

  openReminder(event) {
    wx.navigateTo({ url: `/pages/reminders/reminders?petId=${event.currentTarget.dataset.id}` });
  },

  openPetLevel(event) {
    wx.navigateTo({ url: `/pages/pet-level/pet-level?id=${event.currentTarget.dataset.id}` });
  },

  onRealmIconError(event) {
    const id = event.currentTarget.dataset.id;
    const pets = this.data.pets.map((item) => item._id === id ? { ...item, realmIconBroken: true } : item);
    this.setData({ pets });
  }
});
