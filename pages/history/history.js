const db = require('../../utils/db');
const { resolveTheme, resolveThemeFromSnapshot, applyThemeToPage } = require('../../utils/themeManager');

Page({
  data: {
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    petOptions: [{ _id: '', name: '全部宠物' }],
    petIndex: 0,
    cards: []
  },

  onShow() {
    this.load();
  },

  async load() {
    const [user, pets] = await Promise.all([db.ensureUser(), db.getPets()]);
    applyThemeToPage(this, resolveTheme(user));

    const petOptions = [{ _id: '', name: '全部宠物' }].concat(pets);
    const selected = petOptions[this.data.petIndex] || petOptions[0];
    const cards = (await db.getDailyCards(selected._id ? { petId: selected._id } : {})).map((item) => {
      const theme = resolveThemeFromSnapshot(item);
      return {
        ...item,
        themeId: theme.id,
        templateLabel: item.themeName || theme.name,
        watermarkLabel: item.isWatermarked ? ' · 含水印' : ' · 无水印'
      };
    });
    this.setData({ petOptions, cards });
  },

  pickPet(event) {
    this.setData({ petIndex: Number(event.detail.value) }, () => this.load());
  },

  openDetail(event) {
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${event.currentTarget.dataset.id}` });
  }
});
