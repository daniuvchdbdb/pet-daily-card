const db = require('../../utils/db');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

function getPlanName() {
  return '全部免费版';
}

Page({
  data: {
    user: null,
    planName: '全部免费版',
    creatorMode: false,
    themeInfo: null,
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    themeName: '奶油日常',
    stats: {
      pets: 0,
      cards: 0,
      reminders: 0
    },
    benefitCards: [
      { key: 'free', name: '主题模板', icon: '🎨', items: ['全部主题免费', '全部模板免费', '自定义主题免费'] },
      { key: 'plus', name: '记录能力', icon: '📒', items: ['日报数量不限', '宠物档案不限', '提醒数量不限'] },
      { key: 'pro', name: '保存体验', icon: '✨', items: ['默认无水印', '高级风格可用', '自动同步日报'] }
    ],
    menuItems: [
      { key: 'theme', icon: '🎨', title: '主题皮肤', desc: '更换整套页面风格' },
      { key: 'pets', icon: '🐾', title: '我的宠物', desc: '管理宠物档案' },
      { key: 'history', icon: '📒', title: '历史记录', desc: '查看过往日报' },
      { key: 'about', icon: 'ℹ', title: '关于小程序', desc: '功能与合规说明' }
    ]
  },

  onShow() {
    this.load();
  },

  async load() {
    const [user, pets, cards, reminders] = await Promise.all([
      db.ensureUser(),
      db.getPets(),
      db.getDailyCards(),
      db.getReminders()
    ]);
    const theme = resolveTheme(user);
    applyThemeToPage(this, theme);
    this.setData({
      user,
      planName: getPlanName(user),
      creatorMode: false,
      themeName: theme.name,
      stats: {
        pets: pets.length,
        cards: cards.length,
        reminders: reminders.length
      }
    });
  },

  goThemeCenter() {
    wx.navigateTo({ url: '/pages/theme-center/theme-center' });
  },

  goPets() {
    wx.switchTab({ url: '/pages/pets/pets' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  handleMenu(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'theme') this.goThemeCenter();
    if (key === 'pets') this.goPets();
    if (key === 'history') this.goHistory();
    if (key === 'about') {
      wx.showModal({
        title: '关于毛孩日报',
        content: '毛孩日报用于记录宠物日常养护和成长陪伴，不提供医疗诊断、问诊、处方或治疗建议。当前版本所有主题和模板均免费开放。',
        showCancel: false
      });
    }
  }
});