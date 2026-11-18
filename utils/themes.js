const DEFAULT_THEME_ID = 'theme_default_warm';

const THEMES = [
  {
    id: 'theme_default_warm',
    name: '奶油日常',
    level: 'free',
    type: 'preset',
    scene: '日常陪伴 / 基础记录',
    desc: '温柔、治愈、陪伴感强，适合每天生成一张干净可爱的日报。',
    sellingPoint: '免费可用，满足日常记录和基础分享。',
    pageClass: 'theme-default-warm',
    cardClass: 'card-default-warm',
    cardStyle: 'cute_daily',
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
    decorationVariant: 'soft_paws',
    badgeText: '免费',
    previewColors: ['#FFF7E8', '#FFB36A', '#FFFFFF'],
    decorations: ['奶油背景', '温暖圆角', '轻量爪印']
  },
  {
    id: 'theme_xhs_pink',
    name: '小红书甜宠',
    level: 'free',
    type: 'preset',
    scene: '朋友圈 / 小红书晒宠',
    desc: '粉白贴纸、爱心、胶带和大图封面，让毛孩子更适合被分享。',
    sellingPoint: '照片更突出，贴纸感更强，当前版本免费无水印保存。',
    pageClass: 'theme-xhs-pink',
    cardClass: 'card-xhs-pink',
    cardStyle: 'xhs_share',
    layoutType: 'social_sticker',
    heroVariant: 'xhs_sticker',
    quickCardVariant: 'bubble_tiles',
    petCardVariant: 'sweet_badge',
    reminderCardVariant: 'pink_note',
    reportCardVariant: 'xhs_share',
    emptyStateVariant: 'heart_bubble',
    tabbarVariant: 'pink_tabs',
    buttonVariant: 'hot_pink',
    tagVariant: 'sticker_pill',
    iconVariant: 'sweet_icon',
    decorationVariant: 'hearts_stars',
    badgeText: '免费',
    previewColors: ['#FFF1F5', '#FF4F93', '#FFFFFF'],
    decorations: ['大图晒宠', '爱心贴纸', '粉色便签']
  },
  {
    id: 'theme_sticker_diary',
    name: '手账贴纸',
    level: 'free',
    type: 'preset',
    scene: '手账收藏 / 可爱日记',
    desc: '牛皮纸、拍立得、胶带、便签和虚线，像一本毛孩子专属手账。',
    sellingPoint: '更有收藏感，适合长期沉淀毛孩子的可爱瞬间。',
    pageClass: 'theme-sticker-diary',
    cardClass: 'card-sticker-diary',
    cardStyle: 'sticker_diary',
    layoutType: 'scrapbook',
    heroVariant: 'diary_cover',
    quickCardVariant: 'paper_tiles',
    petCardVariant: 'polaroid_profile',
    reminderCardVariant: 'paper_checklist',
    reportCardVariant: 'sticker_diary',
    emptyStateVariant: 'paper_note',
    tabbarVariant: 'paper_tabs',
    buttonVariant: 'mustard_stamp',
    tagVariant: 'tape_label',
    iconVariant: 'handdrawn',
    decorationVariant: 'tapes_papers',
    badgeText: '免费',
    previewColors: ['#FFF4D6', '#D49B54', '#FFFDF5'],
    decorations: ['拍立得照片', '纸张纹理', '胶带贴纸']
  },
  {
    id: 'theme_realm_gold',
    name: '灵宠修行',
    level: 'free',
    type: 'preset',
    scene: '等级养成 / 灵宠修行',
    desc: '黑金灵气、境界、等级和属性条，把日报变成灵宠修行记录。',
    sellingPoint: '免费开放的游戏卡风格，适合展示灵宠等级和成长进度。',
    pageClass: 'theme-realm-gold',
    cardClass: 'card-realm-gold',
    cardStyle: 'realm_battle',
    layoutType: 'realm_rpg',
    heroVariant: 'realm_panel',
    quickCardVariant: 'rune_grid',
    petCardVariant: 'battle_profile',
    reminderCardVariant: 'quest_board',
    reportCardVariant: 'realm_report',
    emptyStateVariant: 'spirit_seal',
    tabbarVariant: 'dark_gold_tabs',
    buttonVariant: 'gold_plate',
    tagVariant: 'rune_badge',
    iconVariant: 'realm_seal',
    decorationVariant: 'runes_glow',
    badgeText: '免费',
    previewColors: ['#120804', '#F6C65B', '#2B1808'],
    decorations: ['灵气光效', '符文边框', '等级战力']
  },
  {
    id: 'theme_tianming_god',
    name: '天命毛神',
    level: 'free',
    type: 'preset',
    scene: '终极收藏 / 免费开放',
    desc: '神圣黑金、皇冠神环、星辉和典藏徽章，是整套主题里最华丽的一套。',
    sellingPoint: '免费开放的高级主题，适合重要时刻和收藏展示。',
    pageClass: 'theme-tianming-god',
    cardClass: 'card-tianming-god',
    cardStyle: 'tianming_god',
    layoutType: 'divine_legend',
    heroVariant: 'god_card',
    quickCardVariant: 'divine_tiles',
    petCardVariant: 'legend_profile',
    reminderCardVariant: 'divine_tasks',
    reportCardVariant: 'god_report',
    emptyStateVariant: 'divine_empty',
    tabbarVariant: 'divine_tabs',
    buttonVariant: 'legend_gold',
    tagVariant: 'divine_badge',
    iconVariant: 'god_emblem',
    decorationVariant: 'crowns_starlight',
    badgeText: '免费',
    previewColors: ['#050403', '#F8D87A', '#3A2108'],
    decorations: ['皇冠神环', '星辉灵阵', '典藏徽章']
  }
];

const THEME_ALIASES = {
  theme_cute_daily: 'theme_default_warm',
  theme_simple_record: 'theme_default_warm',
  theme_growth_album: 'theme_sticker_diary',
  theme_birthday_ceremony: 'theme_tianming_god',
  template_cute_daily: 'theme_default_warm',
  template_simple_record: 'theme_default_warm',
  template_xhs_share: 'theme_xhs_pink',
  template_sticker_diary: 'theme_sticker_diary',
  template_growth_album: 'theme_sticker_diary',
  template_multi_pet: 'theme_sticker_diary',
  template_realm_battle: 'theme_realm_gold',
  template_birthday_ceremony: 'theme_tianming_god',
  template_home_anniversary: 'theme_sticker_diary',
  template_festival_limited: 'theme_tianming_god',
  template_tianming_god: 'theme_tianming_god',
  template_cute: 'theme_default_warm',
  template_simple: 'theme_default_warm',
  template_xhs: 'theme_xhs_pink',
  template_realm: 'theme_realm_gold'
};

function normalizeThemeId(id) {
  return THEME_ALIASES[id] || id || DEFAULT_THEME_ID;
}

function mapTemplateToTheme(templateId) {
  return normalizeThemeId(templateId);
}

function getThemeById(id) {
  const themeId = normalizeThemeId(id);
  return THEMES.find((item) => item.id === themeId) || THEMES[0];
}

function resolveThemeId(inputThemeId, pet = {}, user = {}) {
  return getThemeById(inputThemeId || pet.currentThemeId || user.currentThemeId || DEFAULT_THEME_ID).id;
}

function getThemePaywall() {
  return {
    title: '已免费开放',
    content: '当前版本已取消会员限制，所有主题和模板都可以直接使用。',
    confirmText: '知道了',
    cancelText: '继续使用'
  };
}

module.exports = {
  DEFAULT_THEME_ID,
  THEMES,
  getThemeById,
  mapTemplateToTheme,
  normalizeThemeId,
  resolveThemeId,
  getThemePaywall
};
