const db = require('../../utils/db');
const { resolveThemeFromSnapshot, applyThemeToPage } = require('../../utils/themeManager');

Page({
  data: {
    card: null,
    themeClass: 'theme-default-warm',
    customThemeStyle: ''
  },

  async onLoad(query) {
    const cards = await db.getDailyCards();
    const card = cards.find((item) => item._id === query.id) || null;
    if (card) {
      const theme = resolveThemeFromSnapshot(card);
      applyThemeToPage(this, theme);
      this.setData({
        card: {
          ...card,
          themeId: theme.id,
          themeLabel: card.themeName || theme.name,
          themeType: card.themeType || theme.type || 'preset',
          cardStyle: card.cardStyle || theme.cardStyle,
          careRecordCount: Array.isArray(card.careRecords) ? card.careRecords.length : 0
        }
      });
    } else {
      this.setData({ card: null });
    }
  },

  saveImage() {
    const url = this.data.card && (this.data.card.cardImageUrl || this.data.card.cardImagePath);
    if (!url) return;
    wx.getImageInfo({
      src: url,
      success: (info) => {
        wx.saveImageToPhotosAlbum({
          filePath: info.path,
          success: () => wx.showToast({ title: '已保存' })
        });
      }
    });
  }
});
