const REMINDER_TEMPLATE_ID = 'TODO_微信订阅消息模板ID';

const PET_TYPES = ['猫', '狗', '兔子', '仓鼠', '鸟', '其他'];
const PET_GENDERS = ['男孩', '女孩', '未知'];
const PERSONALITY_TAGS = ['粘人', '胆小', '活泼', '挑食', '爱睡觉', '爱拆家'];

const CARD_TEMPLATES = [
  {
    id: 'template_cute_daily',
    name: '奶油日常风',
    desc: '基础记录、温暖干净，适合每天快速保存。',
    level: 'free',
    scene: '基础记录 · 温暖干净 · 带轻水印',
    tag: '免费',
    sellingPoint: '轻奶油配色，记录吃饭、喝水、便便和今日小记，适合日常观察。',
    colors: ['#FFF7E8', '#F6A65B', '#FFEBC9'],
    decorations: ['基础记录', '奶油色', '轻水印'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_simple_record',
    name: '简洁记录风',
    desc: '表格记录，适合长期观察和复盘。',
    level: 'free',
    scene: '表格记录 · 长期观察 · 风格朴素',
    tag: '免费',
    sellingPoint: '信息密度更高，像观察表一样清楚，适合长期保存宠物状态。',
    colors: ['#FFFFFF', '#222222', '#F2F2F2'],
    decorations: ['表格', '线框', '观察记录'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_xhs_share',
    name: '小红书晒宠风',
    desc: '大图展示宠物照片，粉白贴纸装饰，适合朋友圈和小红书。',
    level: 'free',
    scene: '大图展示 · 粉白背景 · 爱心星星贴纸',
    tag: '免费',
    sellingPoint: '照片更突出，今日小记像便签，当前版本免费无水印保存。',
    colors: ['#FFF1F4', '#FF7A9A', '#FFD6E2'],
    decorations: ['大图', '爱心', '星星', '便签'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_sticker_diary',
    name: '手账贴纸风',
    desc: '拍立得照片、胶带、便签和爪印贴纸组成可爱手账。',
    level: 'free',
    scene: '拍立得 · 胶带便签 · 爪印贴纸',
    tag: '免费',
    sellingPoint: '更像一本宠物手账，保存后有收藏感。',
    colors: ['#FFF4D6', '#77BFA3', '#FFB3A7'],
    decorations: ['拍立得', '胶带', '便签', '爪印'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_growth_album',
    name: '成长相册风',
    desc: '多图拼贴、时间轴和连续记录天数，适合长期保存。',
    level: 'free',
    scene: '多图拼贴 · 时间轴 · 连续记录',
    tag: '免费',
    sellingPoint: '强化成长记录和连续陪伴感，适合做长期相册的一页。',
    colors: ['#FFFDF8', '#D6B98C', '#F4E7D0'],
    decorations: ['多图拼贴', '时间轴', '相册', '印章'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_realm_battle',
    name: '灵宠修行战力卡',
    desc: '金色渐变背景，显示 Lv、境界、灵气进度条和境界图标。',
    level: 'free',
    scene: '游戏角色卡 · 境界图标 · 灵气进度',
    tag: '免费',
    sellingPoint: '标题“今日灵宠修行录”，像角色卡一样展示毛孩子的修行状态。',
    colors: ['#FFF4D6', '#FFE2A8', '#A87114'],
    decorations: ['金色渐变', '境界', '灵气条', '角色卡'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_birthday_ceremony',
    name: '生日纪念卡',
    desc: '气球、蛋糕、彩带和礼物装饰，适合生日当天收藏。',
    level: 'free',
    scene: '生日快乐 · 蛋糕气球 · 陪伴纪念',
    tag: '免费',
    sellingPoint: '显示生日、年龄和陪伴天数，用更强仪式感保存重要日子。',
    colors: ['#FFF2D8', '#D7A84D', '#FF8FA3'],
    decorations: ['蛋糕', '气球', '彩带', '礼物'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_home_anniversary',
    name: '到家纪念日卡',
    desc: '小房子、爱心、相框和脚印，记录到家的第 X 天。',
    level: 'free',
    scene: '到家纪念 · 小房子 · 相框脚印',
    tag: '免费',
    sellingPoint: '温暖纪念风，适合保存领养、到家周年和第一次相遇。',
    colors: ['#FFF6EC', '#C9825B', '#FFD5B8'],
    decorations: ['小房子', '相框', '爱心', '脚印'],
    isPaid: false,
    requiredPlan: 'free'
  },
  {
    id: 'template_tianming_god',
    name: '天命毛神终极卡',
    desc: '神圣金背景，星辉、神环、灵阵装饰，终极收藏模板。',
    level: 'free',
    scene: '神圣金 · 星辉神环 · 终极收藏',
    tag: '免费',
    sellingPoint: '显示 Lv.100、境界、徽章和连续修行，是全套模板里最华丽的一张。',
    colors: ['#FFF9E8', '#FFD66B', '#8C5A00'],
    decorations: ['神圣金', '星辉', '神环', '灵阵'],
    isPaid: false,
    requiredPlan: 'free'
  }
];

const TEMPLATE_ID_ALIASES = {
  cream: 'template_cute_daily',
  clean: 'template_simple_record',
  storybook: 'template_xhs_share',
  'no-watermark': 'template_xhs_share',
  template_cute: 'template_cute_daily',
  template_simple: 'template_simple_record',
  template_xhs: 'template_xhs_share',
  template_realm: 'template_realm_battle',
  template_multi_pet: 'template_growth_album',
  template_festival_limited: 'template_tianming_god'
};

function normalizeTemplateId(templateId) {
  const normalized = TEMPLATE_ID_ALIASES[templateId] || templateId || 'template_cute_daily';
  return CARD_TEMPLATES.some((item) => item.id === normalized) ? normalized : 'template_cute_daily';
}

function getTemplateById(templateId) {
  const normalized = normalizeTemplateId(templateId);
  return CARD_TEMPLATES.find((item) => item.id === normalized) || CARD_TEMPLATES[0];
}

function getTemplateName(templateId) {
  return getTemplateById(templateId).name;
}

const STATUS_OPTIONS = {
  foodStatus: ['正常', '少量', '没怎么吃'],
  waterStatus: ['正常', '偏少', '偏多'],
  poopStatus: ['正常', '偏软', '未排便', '异常'],
  moodStatus: ['活跃', '正常', '粘人', '紧张', '没精神'],
  exerciseStatus: ['遛弯', '玩耍', '宅着', '睡了一天'],
  emotionStatus: ['开心', '委屈', '撒娇', '生气', '犯困', '干饭王']
};

const REMINDER_TYPES = [
  { key: 'feed', label: '喂饭', health: false, icon: '🍚' },
  { key: 'water', label: '喝水观察', health: false, icon: '💧' },
  { key: 'poop_clean', label: '铲屎/清理', health: false, icon: '🧹' },
  { key: 'walk', label: '遛狗', health: false, icon: '🐕' },
  { key: 'bath', label: '洗澡', health: false, icon: '🛁' },
  { key: 'deworm', label: '驱虫', health: true, icon: '🛡️' },
  { key: 'vaccine', label: '疫苗', health: true, icon: '📅' },
  { key: 'nail', label: '剪指甲', health: false, icon: '✂️' },
  { key: 'weight', label: '体重记录', health: false, icon: '⚖️' },
  { key: 'custom', label: '自定义', health: false, icon: '✨' }
];

const REPEAT_TYPES = [
  { key: 'once', label: '仅一次' },
  { key: 'daily', label: '每天' },
  { key: 'weekly', label: '每周' },
  { key: 'monthly', label: '每月' },
  { key: 'every_n_days', label: '每 N 天' },
  { key: 'yearly', label: '每年' }
];

const PLAN_LIMITS = {
  free: {
    petLimit: Infinity,
    dailyCardLimit: Infinity,
    reminderLimit: Infinity,
    watermarked: false,
    autoSyncReminderToDaily: true
  },
  plus: {
    petLimit: Infinity,
    dailyCardLimit: Infinity,
    reminderLimit: Infinity,
    watermarked: false,
    autoSyncReminderToDaily: true
  },
  pro: {
    petLimit: Infinity,
    dailyCardLimit: Infinity,
    reminderLimit: Infinity,
    watermarked: false,
    autoSyncReminderToDaily: true
  }
};

const LIMIT_MESSAGES = {
  pet: '当前版本宠物档案数量不设会员限制。',
  dailyCard: '当前版本日报生成数量不设会员限制，并且默认无水印。',
  reminder: '当前版本养护提醒数量不设会员限制。',
  template: '当前版本全部主题和模板均免费开放。',
  proTemplate: '当前版本高级主题、自定义主题和纪念主题均免费开放。',
  autoSync: '当前版本提醒完成后可自动同步到日报。'
};

const CARE_SAFE_NOTE = '本记录仅作日常养护观察，不替代兽医诊断。';
const HEALTH_REMINDER_NOTE = '本提醒仅根据你设置的时间发送，不替代专业兽医建议。';
const HEALTH_REMINDER_DETAIL = '本提醒仅根据你设置的时间发送，不替代专业兽医建议。如对驱虫、疫苗周期有疑问，请咨询专业兽医。';
const WARNING_NOTE = '如异常状态持续，建议及时咨询专业兽医。';

module.exports = {
  REMINDER_TEMPLATE_ID,
  PET_TYPES,
  PET_GENDERS,
  PERSONALITY_TAGS,
  CARD_TEMPLATES,
  TEMPLATE_ID_ALIASES,
  normalizeTemplateId,
  getTemplateById,
  getTemplateName,
  STATUS_OPTIONS,
  REMINDER_TYPES,
  REPEAT_TYPES,
  PLAN_LIMITS,
  LIMIT_MESSAGES,
  CARE_SAFE_NOTE,
  HEALTH_REMINDER_NOTE,
  HEALTH_REMINDER_DETAIL,
  WARNING_NOTE
};
