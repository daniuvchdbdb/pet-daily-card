const db = require('../../utils/db');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

Page({
  data: {
    user: null,
    planName: '全部免费版',
    expireText: '永久有效',
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    freeFeatures: [
      '全部主题皮肤免费使用',
      '全部日报模板免费使用',
      '自定义主题免费保存',
      '日报保存默认无水印',
      '宠物档案、养护提醒和日报数量不设会员限制',
      '提醒完成可自动同步到日报'
    ]
  },

  onShow() {
    this.load();
  },

  async load() {
    const user = await db.ensureUser();
    const theme = resolveTheme(user);
    applyThemeToPage(this, theme);
    this.setData({ user });
  },

  goThemeCenter() {
    wx.navigateTo({ url: '/pages/theme-center/theme-center' });
  },

  contactService() {}
});