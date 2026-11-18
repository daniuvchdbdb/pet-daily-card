const db = require('../../utils/db');
const { getContinuousRecordDays } = require('../../utils/date');

Page({
  data: {
    cards: [],
    pets: [],
    currentPet: null,
    totalDays: 0,
    continuousDays: 0
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const [cards, pets] = await Promise.all([db.getDailyCards(), db.getPets()]);
      const normalizedCards = cards.map((item) => ({
        ...item,
        careRecordCount: Array.isArray(item.careRecords) ? item.careRecords.length : 0
      }));
      const totalDays = new Set(normalizedCards.map((item) => item.recordDate)).size;
      this.setData({
        cards: normalizedCards,
        pets,
        currentPet: pets[0] || null,
        totalDays,
        continuousDays: getContinuousRecordDays(normalizedCards)
      });
    } catch (error) {
      console.warn('[page] album load failed', error);
      wx.showToast({ title: '成长相册加载失败', icon: 'none' });
    }
  },

  openPetLevel() {
    if (!this.data.currentPet) return;
    wx.navigateTo({ url: `/pages/pet-level/pet-level?id=${this.data.currentPet._id}` });
  },

  onRealmIconError() {
    this.setData({ 'currentPet.realmIconBroken': true });
  }
});
