const { DEFAULT_THEME_ID, getThemeById, normalizeThemeId } = require('./themes');

const DEFAULT_CUSTOM_THEME = {
  enabled: false,
  name: '我的主题',
  backgroundColor: '#FFF7E8',
  cardColor: '#FFFFFF',
  primaryColor: '#FF944D',
  textColor: '#333333',
  radius: 24,
  decorationStyle: 'paw',
  buttonStyle: 'round'
};

const DEFAULT_VARIANTS = {
  layoutType: 'daily_clean',
  heroVariant: 'warm_photo',
  quickCardVariant: 'soft_tiles',
  petCardVariant: 'warm_profile',
  reminderCardVariant: 'gentle_list',
  reportCardVariant: 'daily_basic',
  emptyStateVariant: 'soft_paw',
  tabbarVariant: 'cream_tabs',
  buttonVariant: 'orange_glow',
  tagVariant: 'cream_pill',
  iconVariant: 'rounded_paw',
  decorationVariant: 'soft_paws'
};

function normalizeCustomTheme(customTheme = {}) {
  return {
    ...DEFAULT_CUSTOM_THEME,
    ...customTheme,
    radius: Number(customTheme.radius || DEFAULT_CUSTOM_THEME.radius)
  };
}

function buildCustomThemeStyle(customTheme) {
  if (!customTheme) return '';
  const theme = normalizeCustomTheme(customTheme);
  return [
    `--theme-bg: ${theme.backgroundColor}`,
    `--theme-card: ${theme.cardColor}`,
    `--theme-primary: ${theme.primaryColor}`,
    `--theme-text: ${theme.textColor}`,
    `--theme-radius: ${theme.radius}rpx`
  ].join(';');
}

function buildCustomTheme(customTheme, source = {}) {
  const theme = normalizeCustomTheme(customTheme);
  return {
    id: source.themeId || source.id || 'custom_theme',
    name: source.themeName || source.name || theme.name || '我的主题',
    type: 'custom',
    level: 'free',
    pageClass: 'theme-custom',
    cardClass: 'card-custom',
    cardStyle: source.cardStyle || 'custom',
    ...DEFAULT_VARIANTS,
    desc: '你自己搭配的专属页面皮肤',
    sellingPoint: '自定义背景、卡片、按钮和装饰风格',
    badgeText: '自定义',
    previewColors: [theme.backgroundColor, theme.primaryColor, theme.cardColor],
    customTheme: theme
  };
}

function resolveTheme(user = {}, pageThemeId = '') {
  if (pageThemeId) return getThemeById(pageThemeId);
  if (user && user.customTheme && user.customTheme.enabled) {
    return buildCustomTheme(user.customTheme);
  }
  return getThemeById(user.currentThemeId || DEFAULT_THEME_ID);
}

function resolveThemeFromSnapshot(card = {}) {
  if (card.customThemeSnapshot) {
    return buildCustomTheme(card.customThemeSnapshot, card);
  }
  return getThemeById(card.themeId || card.templateId || DEFAULT_THEME_ID);
}

function applyThemeToPage(page, themeInfo) {
  const theme = themeInfo || getThemeById(DEFAULT_THEME_ID);
  page.setData({
    themeInfo: theme,
    themeId: theme.id,
    themeClass: theme.pageClass,
    customTheme: theme.customTheme || null,
    customThemeStyle: buildCustomThemeStyle(theme.customTheme)
  });
}

function getThemeSnapshot(themeInfo = {}) {
  const theme = themeInfo.id ? themeInfo : getThemeById(themeInfo.themeId || DEFAULT_THEME_ID);
  return {
    themeId: normalizeThemeId(theme.id),
    themeName: theme.name,
    themeType: theme.type || 'preset',
    cardStyle: theme.cardStyle,
    cardClass: theme.cardClass,
    pageClass: theme.pageClass,
    layoutType: theme.layoutType,
    heroVariant: theme.heroVariant,
    quickCardVariant: theme.quickCardVariant,
    petCardVariant: theme.petCardVariant,
    reminderCardVariant: theme.reminderCardVariant,
    reportCardVariant: theme.reportCardVariant,
    emptyStateVariant: theme.emptyStateVariant,
    buttonVariant: theme.buttonVariant,
    tagVariant: theme.tagVariant,
    decorationVariant: theme.decorationVariant,
    customThemeSnapshot: theme.customTheme ? normalizeCustomTheme(theme.customTheme) : null
  };
}

module.exports = {
  DEFAULT_CUSTOM_THEME,
  normalizeCustomTheme,
  buildCustomThemeStyle,
  resolveTheme,
  resolveThemeFromSnapshot,
  applyThemeToPage,
  getThemeSnapshot
};
