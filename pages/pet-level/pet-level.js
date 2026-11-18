const db = require('../../utils/db');
const { REALM_ICONS, getPetExpLogs, BADGE_DEFS } = require('../../utils/petLevel');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

Page({
  data: {
    petId: '',
    pet: null,
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    logs: [],
    realmAtlas: [],
    safeNote: '本功能为趣味成长记录，不代表宠物健康状态。',
    iconBroken: false
  },

  onLoad(query) {
    this.setData({ petId: query.id || '' });
  },

  onShow() {
    this.load();
  },

  async load() {
    if (!this.data.petId) {
      wx.showToast({ title: '缺少宠物信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '加载中' });
    try {
      const [user, pets] = await Promise.all([db.ensureUser(), db.getPets()]);
      applyThemeToPage(this, resolveTheme(user));
      const pet = pets.find((item) => item._id === this.data.petId);
      if (!pet) {
        wx.showToast({ title: '没有找到这只宠物', icon: 'none' });
        return;
      }
      const logs = await getPetExpLogs(this.data.petId, 20);
      const realmAtlas = REALM_ICONS.map((realm) => ({
        ...realm,
        unlocked: pet.level >= realm.minLevel,
        iconBroken: false
      }));
      const badges = (pet.badges && pet.badges.length) ? pet.badges : BADGE_DEFS.slice(0, 4).map((item) => ({ ...item, locked: true }));
      const nextNeed = pet.nextLevelExp > 0 ? Math.max(0, pet.nextLevelExp - pet.exp) : 0;
      this.setData({ pet: { ...pet, nextNeed, displayBadges: badges }, logs, realmAtlas, iconBroken: false });
    } catch (error) {
      console.warn('[page] pet level load failed', error);
      wx.showToast({ title: '修行信息加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onMainIconError() {
    this.setData({ iconBroken: true });
  },

  onAtlasIconError(event) {
    const type = event.currentTarget.dataset.type;
    const realmAtlas = this.data.realmAtlas.map((item) => item.iconType === type ? { ...item, iconBroken: true } : item);
    this.setData({ realmAtlas });
  },

  generateGrowthCard() {
    wx.showToast({ title: '灵宠成长卡即将开放', icon: 'none' });
  }
});
