const db = require('../../utils/db');
const { THEMES, getThemeById } = require('../../utils/themes');
const {
  DEFAULT_CUSTOM_THEME,
  normalizeCustomTheme,
  resolveTheme,
  applyThemeToPage
} = require('../../utils/themeManager');

const BG_COLORS = ['#FFF8EF', '#FFF4F8', '#F1F8FF', '#F8FFF1', '#FFF4D6', '#F7F0FF'];
const CARD_COLORS = ['#FFFFFF', '#FFFDF8', '#FFF7FB', '#F8FCFF', '#FFF9E8', '#FAF5FF'];
const PRIMARY_COLORS = ['#FF6F8F', '#FF8FA8', '#6CA8FF', '#7CCB8A', '#F6B64A', '#9B7CFF'];
const TEXT_COLORS = ['#3A2A2A', '#4A2A34', '#25324A', '#31503A', '#5A3A18', '#3D315E'];
const RADIUS_OPTIONS = [24, 32, 40, 48];
const DECORATION_OPTIONS = [
  { value: 'paw', label: '爪印' },
  { value: 'heart', label: '爱心' },
  { value: 'star', label: '星星' },
  { value: 'none', label: '简洁' }
];
const BUTTON_OPTIONS = [
  { value: 'round', label: '圆润' },
  { value: 'soft', label: '柔和' },
  { value: 'simple', label: '简洁' }
];

function buildThemeView(theme, user, currentThemeId) {
  const canUse = true;
  const creatorMode = false;
  return {
    ...theme,
    canUse,
    isCurrent: currentThemeId === theme.id,
    lockVisible: false,
    creatorUsable: false,
    levelText: '免费',
    previewColorA: theme.previewColors[0],
    previewColorB: theme.previewColors[1],
    previewColorC: theme.previewColors[2],
    actionText: currentThemeId === theme.id ? '使用中' : '使用主题'
  };
}

Page({
  data: {
    user: null,
    themeInfo: getThemeById(),
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    currentThemeName: '奶油日常',
    currentThemeLevel: '免费',
    currentThemeDesc: '温暖干净的基础主题',
    creatorMode: false,
    featuredThemes: [],
    freeThemes: [],
    plusThemes: [],
    proThemes: [],
    customTheme: DEFAULT_CUSTOM_THEME,
    bgColors: BG_COLORS,
    cardColors: CARD_COLORS,
    primaryColors: PRIMARY_COLORS,
    textColors: TEXT_COLORS,
    radiusOptions: RADIUS_OPTIONS,
    decorationOptions: DECORATION_OPTIONS,
    buttonOptions: BUTTON_OPTIONS
  },

  onShow() {
    this.load();
  },

  async load() {
    const user = await db.ensureUser();
    const themeInfo = resolveTheme(user);
    const customTheme = normalizeCustomTheme(user.customTheme || DEFAULT_CUSTOM_THEME);
    const currentThemeId = themeInfo.id;
    const creatorMode = false;
    const themeViews = THEMES.map((item) => buildThemeView(item, user, currentThemeId));
    applyThemeToPage(this, themeInfo);
    this.setData({
      user,
      customTheme,
      creatorMode,
      currentThemeName: themeInfo.name,
      currentThemeLevel: themeInfo.type === 'custom' ? '自定义' : '免费',
      currentThemeDesc: themeInfo.desc || '你正在使用这套主题皮肤',
      featuredThemes: themeViews,
      freeThemes: themeViews.filter((item) => item.level === 'free'),
      plusThemes: [],
      proThemes: []
    });
  },

  async useTheme(event) {
    const theme = getThemeById(event.currentTarget.dataset.id);
    const user = this.data.user || { plan: 'free', role: 'user' };
    wx.showLoading({ title: '应用中' });
    try {
      const result = await db.updateUser({
        currentThemeId: theme.id,
        customTheme: {
          ...normalizeCustomTheme(user.customTheme || DEFAULT_CUSTOM_THEME),
          enabled: false
        }
      });
      if (result && result.ok === false) {
        wx.showModal({ title: '应用失败', content: result.message, showCancel: false });
        return;
      }
      getApp().globalData.currentTheme = theme;
      wx.showToast({ title: '主题已应用', icon: 'none' });
      await this.load();
    } finally {
      wx.hideLoading();
    }
  },

  previewTheme(event) {
    const theme = getThemeById(event.currentTarget.dataset.id);
    applyThemeToPage(this, theme);
    this.setData({
      currentThemeName: `${theme.name}（预览）`,
      currentThemeLevel: theme.badgeText,
      currentThemeDesc: theme.desc
    });
  },

  inputCustomName(event) {
    this.updateCustom({ name: event.detail.value });
  },

  chooseColor(event) {
    const key = event.currentTarget.dataset.key;
    const value = event.currentTarget.dataset.value;
    this.updateCustom({ [key]: value });
  },

  chooseRadius(event) {
    this.updateCustom({ radius: Number(event.currentTarget.dataset.value) });
  },

  chooseOption(event) {
    const key = event.currentTarget.dataset.key;
    const value = event.currentTarget.dataset.value;
    this.updateCustom({ [key]: value });
  },

  updateCustom(patch) {
    const customTheme = normalizeCustomTheme({
      ...this.data.customTheme,
      ...patch,
      enabled: true
    });
    applyThemeToPage(this, {
      id: 'custom_theme',
      name: customTheme.name || '我的主题',
      type: 'custom',
      level: 'free',
      pageClass: 'theme-custom',
      cardStyle: 'custom',
      customTheme
    });
    this.setData({
      customTheme,
      currentThemeName: `${customTheme.name || '我的主题'}（预览）`,
      currentThemeLevel: '自定义',
      currentThemeDesc: '正在实时预览你的专属主题'
    });
  },

  async saveCustomTheme() {
    const user = this.data.user || { plan: 'free', role: 'user' };
    wx.showLoading({ title: '保存中' });
    try {
      const customTheme = normalizeCustomTheme({
        ...this.data.customTheme,
        enabled: true
      });
      const result = await db.updateUser({
        customTheme,
        currentThemeId: 'custom_theme'
      });
      if (result && result.ok === false) {
        wx.showModal({ title: '保存失败', content: result.message, showCancel: false });
        return;
      }
      getApp().globalData.currentTheme = {
        id: 'custom_theme',
        name: customTheme.name,
        type: 'custom',
        pageClass: 'theme-custom',
        customTheme
      };
      wx.showToast({ title: '自定义主题已应用', icon: 'none' });
      await this.load();
    } finally {
      wx.hideLoading();
    }
  },

});
