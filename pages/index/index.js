const db = require('../../utils/db');
const { formatDate } = require('../../utils/date');
const { randomStickers } = require('../../utils/stickers');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');
const { getThemeById } = require('../../utils/themes');

const QUICK_ACTIONS = [
  {
    key: 'pets',
    icon: '+',
    title: '添加宠物',
    desc: '录入新的毛孩子'
  },
  {
    key: 'history',
    icon: '历',
    title: '历史记录',
    desc: '查看过往日报'
  },
  {
    key: 'album',
    icon: '相',
    title: '成长相册',
    desc: '保存可爱瞬间'
  },
  {
    key: 'theme',
    icon: '题',
    title: '主题皮肤',
    desc: '更换整套风格'
  }
];

const DARK_THEME_IDS = ['theme-realm-gold', 'theme-realm-battle', 'theme-tianming-god'];

function isDarkCustomTheme(theme = {}) {
  const bg = theme.customTheme && theme.customTheme.backgroundColor;
  return theme.type === 'custom' && typeof bg === 'string' && /^#([0-5][0-9a-f])/i.test(bg);
}

function isDarkHomeTheme(theme = {}) {
  return DARK_THEME_IDS.indexOf(theme.pageClass) > -1 || isDarkCustomTheme(theme);
}

function applyHomeTabBar(theme = {}) {
  if (!wx.setTabBarStyle) return;
  if (isDarkHomeTheme(theme)) {
    wx.setTabBarStyle({
      backgroundColor: '#2A1608',
      borderStyle: 'black',
      color: '#B7A985',
      selectedColor: '#F6C65B'
    });
    return;
  }
  wx.setTabBarStyle({
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    color: '#8A747C',
    selectedColor: '#FF6FA3'
  });
}

function getPlanName() {
  return '全部免费';
}

function buildPetView(item) {
  const nextLevelExp = item.nextLevelExp || 100;
  const exp = item.exp || 0;
  return {
    ...item,
    typeText: [item.type, item.breed].filter(Boolean).join(' · ') || '未填写类型',
    expText: item.expText || `${exp}/${nextLevelExp}`,
    expProgress: item.expProgress || Math.min(100, Math.round((exp / nextLevelExp) * 100)),
    todayPracticeText: item.todayPracticeText || (item.lastRecordDate === formatDate() ? '今日已修行' : '今日待记录')
  };
}

function buildHomeCopy(theme = {}) {
  const map = {
    xhs_sticker: {
      kicker: '小红书甜宠',
      title: '记录可爱日常',
      subtitle: '把今天的萌点、照片和小心情整理成一张适合分享的日报。',
      actionText: '生成甜宠日报',
      petTitle: '今日甜宠主角',
      reminderTitle: '今日可爱待办'
    },
    diary_cover: {
      kicker: '手账贴纸',
      title: '翻开毛孩手账',
      subtitle: '用拍立得、便签和贴纸，收集毛孩子每天的小事情。',
      actionText: '写一页手账',
      petTitle: '手账主角',
      reminderTitle: '今日小便签'
    },
    realm_panel: {
      kicker: '灵宠修行',
      title: '今日修行开启',
      subtitle: '记录喂养、陪伴与互动，让毛孩子的灵气悄悄增长。',
      actionText: '开始今日修行',
      petTitle: '我的灵宠',
      reminderTitle: '今日修行任务'
    },
    god_card: {
      kicker: '天命毛神',
      title: '神谕日报降临',
      subtitle: '以黑金典藏风记录今天的神气瞬间，压轴展示毛孩子。',
      actionText: '生成天命日报',
      petTitle: '天命所归',
      reminderTitle: '今日神谕任务'
    }
  };
  return map[theme.heroVariant] || {
    kicker: '奶油日常',
    title: '毛孩日报',
    subtitle: '每天 30 秒，记录毛孩子的温暖陪伴。',
    actionText: '生成今日日报',
    petTitle: '我的宠物',
    reminderTitle: '今日提醒'
  };
}

function buildReminderView(item, currentTime) {
  const runAt = item.nextRunAt ? new Date(item.nextRunAt) : new Date();
  const completed = item.status === 'completed' || item.completedAt;
  return {
    ...item,
    timeText: Number.isNaN(runAt.getTime())
      ? '--:--'
      : `${runAt.getHours().toString().padStart(2, '0')}:${runAt.getMinutes().toString().padStart(2, '0')}`,
    statusText: completed ? '已完成' : runAt.getTime() < currentTime ? '已过期' : '待完成',
    statusClass: completed ? 'done' : runAt.getTime() < currentTime ? 'late' : 'pending'
  };
}

Page({
  data: {
    user: null,
    planName: '免费版',
    themeInfo: getThemeById(),
    themeName: '奶油日常',
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    quickActions: QUICK_ACTIONS,
    pets: [],
    todayReminders: [],
    featuredPet: {},
    homeCopy: buildHomeCopy(),
    heroStickers: ['/assets/stickers/paw-orange.png', '/assets/stickers/crown.png', '/assets/stickers/star.png']
  },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ heroStickers: randomStickers(3) });
    try {
      const [user, pets, reminders] = await Promise.all([
        db.ensureUser(),
        db.getPets(),
        db.getTodayReminders()
      ]);

      const theme = resolveTheme(user);
      applyThemeToPage(this, theme);
      applyHomeTabBar(theme);
      getApp().globalData.currentTheme = theme;

      const currentTime = Date.now();
      const petViews = pets.map(buildPetView);
      this.setData({
        user,
        planName: getPlanName(user),
        themeName: theme.name,
        pets: petViews,
        featuredPet: petViews[0] || {},
        homeCopy: buildHomeCopy(theme),
        todayReminders: reminders.map((item) => buildReminderView(item, currentTime))
      });
    } catch (error) {
      console.warn('[page] index load failed', error);
      this.setData({ pets: [], todayReminders: [] });
    }
  },

  openMembership() {
    wx.showToast({ title: '全部功能已免费开放', icon: 'none' });
  },

  handleQuickAction(event) {
    const key = event.currentTarget.dataset.key;
    const map = {
      pets: () => this.goPets(),
      history: () => this.goHistory(),
      album: () => this.goAlbum(),
      theme: () => this.goThemeCenter()
    };
    if (map[key]) map[key]();
  },

  goThemeCenter() {
    wx.navigateTo({ url: '/pages/theme-center/theme-center' });
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/create-card/create-card' });
  },

  goPets() {
    wx.switchTab({ url: '/pages/pets/pets' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  goAlbum() {
    wx.navigateTo({ url: '/pages/album/album' });
  },

  goReminders() {
    wx.switchTab({ url: '/pages/reminders/reminders' });
  },

  addReminder() {
    wx.navigateTo({ url: '/pages/reminder-edit/reminder-edit' });
  },

  goPetLevel(event) {
    wx.navigateTo({ url: `/pages/pet-level/pet-level?id=${event.currentTarget.dataset.id}` });
  },

  async completeReminder(event) {
    wx.showLoading({ title: '记录中' });
    try {
      const reminderId = event.currentTarget.dataset.id;
      const result = await db.completeReminder(reminderId);
      const data = result.result || {};
      if (data.ok === false) {
        wx.showToast({ title: data.message || '操作失败', icon: 'none' });
        return;
      }
      if (data.careRecord) wx.setStorageSync('pendingCareRecord', data.careRecord);
      wx.showToast({
        title: data.expResult && data.expResult.addedExp ? `养护完成，灵气 +${data.expResult.addedExp}` : '养护完成',
        icon: 'none'
      });
      setTimeout(() => {
        wx.showModal({
          title: '已完成',
          content: data.autoSynced ? '已自动同步到今日日报卡。' : '要把这次养护记录加入今日日报卡吗？',
          confirmText: '去日报',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: data.path || `/pages/create-card/create-card?reminderLogId=${data.reminderLogId || ''}&date=${formatDate()}` });
            } else {
              this.load();
            }
          }
        });
      }, 500);
    } catch (error) {
      console.warn('[page] complete reminder failed', error);
      wx.showToast({ title: '操作失败，请检查云开发配置', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
