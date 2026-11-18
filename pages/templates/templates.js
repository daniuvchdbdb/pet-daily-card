const { THEMES } = require('../../utils/themes');

Page({
  data: {
    cardTemplates: []
  },

  onLoad() {
    this.setData({
      cardTemplates: THEMES.map((theme) => ({
        id: theme.id,
        name: theme.name,
        level: theme.badgeText,
        scene: theme.scene,
        cardStyle: theme.cardStyle,
        desc: `卡片排版：${theme.desc}`,
        previewColorA: theme.previewColors[0],
        previewColorB: theme.previewColors[1],
        previewColorC: theme.previewColors[2]
      }))
    });
  },

  goThemeCenter() {
    wx.navigateTo({ url: '/pages/theme-center/theme-center' });
  }
});
