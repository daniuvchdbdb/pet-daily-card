const db = require('../../utils/db');
const { tryUploadImageToCloud } = require('../../utils/upload');
const { formatDate } = require('../../utils/date');
const { STATUS_OPTIONS } = require('../../utils/constants');
const { getThemeById } = require('../../utils/themes');
const { resolveTheme, applyThemeToPage, getThemeSnapshot } = require('../../utils/themeManager');

function buildCreateCopy(theme = {}) {
  const map = {
    social_sticker: {
      title: '创建甜宠日报',
      subtitle: '照片、心情和可爱瞬间都会被整理成适合分享的甜宠卡。',
      photoTitle: '上传今天的美照',
      noteTitle: '今天过得怎么样呢？',
      submitText: '生成甜宠预览'
    },
    scrapbook: {
      title: '写一页毛孩手账',
      subtitle: '像贴照片和写便签一样，保存今天的小事。',
      photoTitle: '今日照片贴纸',
      noteTitle: '今日记录便签',
      submitText: '生成手账预览'
    },
    realm_rpg: {
      title: '今日修行记录',
      subtitle: '记录饮食、互动和心情，转化为灵宠修行日报。',
      photoTitle: '上传灵宠影像',
      noteTitle: '修行感悟',
      submitText: '生成修行录'
    },
    divine_legend: {
      title: '天命日报创建',
      subtitle: '用高级黑金典藏风，记录毛孩子今天的神气瞬间。',
      photoTitle: '上传神选照片',
      noteTitle: '今日神谕',
      submitText: '生成天命预览'
    }
  };
  return map[theme.layoutType] || {
    title: '生成今日日报',
    subtitle: '选择宠物、上传照片、记录状态，生成适合保存和分享的日报卡。',
    photoTitle: '今日照片',
    noteTitle: '今日小记',
    submitText: '生成预览'
  };
}

Page({
  data: {
    pets: [],
    petIndex: 0,
    selectedPet: {},
    user: null,
    creatorMode: false,
    routeThemeId: '',
    themeInfo: getThemeById(),
    themeId: 'theme_default_warm',
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    createCopy: buildCreateCopy(),
    careRecords: [],
    statusOptions: STATUS_OPTIONS,
    form: {
      images: [],
      weight: '',
      foodStatus: '正常',
      waterStatus: '正常',
      poopStatus: '正常',
      moodStatus: '正常',
      exerciseStatus: '玩耍',
      emotionStatus: '开心',
      dailyNote: ''
    }
  },

  async onLoad(query = {}) {
    this.setData({ routeThemeId: query.themeId || query.templateId || '' });
    await this.load();
    if (query.reminderLogId) {
      const cached = wx.getStorageSync('pendingCareRecord');
      if (cached) this.setData({ careRecords: [cached] });
    }
  },

  async load() {
    try {
      const [user, pets] = await Promise.all([db.ensureUser(), db.getPets()]);
      const selectedPet = pets[this.data.petIndex] || pets[0] || {};
      const themeInfo = resolveTheme(user, this.data.routeThemeId);
      applyThemeToPage(this, themeInfo);
      this.setData({
        user,
        pets,
        selectedPet,
        themeInfo,
        createCopy: buildCreateCopy(themeInfo),
        creatorMode: false
      });
    } catch (error) {
      console.warn('[page] create card load failed', error);
      wx.showToast({ title: '数据加载失败，请检查云开发配置', icon: 'none' });
    }
  },

  pickPet(event) {
    const index = Number(event.detail.value);
    const selectedPet = this.data.pets[index] || {};
    this.setData({ petIndex: index, selectedPet });
  },

  input(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: event.detail.value });
  },

  chooseStatus(event) {
    this.setData({ [`form.${event.currentTarget.dataset.key}`]: event.currentTarget.dataset.value });
  },

  openThemeCenter() {
    wx.navigateTo({ url: '/pages/theme-center/theme-center' });
  },

  async chooseImages() {
    const remain = 4 - this.data.form.images.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传 4 张照片', icon: 'none' });
      return;
    }

    try {
      const res = await wx.chooseMedia({ count: remain, mediaType: ['image'], sourceType: ['album', 'camera'] });
      const localPaths = res.tempFiles.map((file) => file.tempFilePath);
      const startIndex = this.data.form.images.length;
      this.setData({ 'form.images': this.data.form.images.concat(localPaths).slice(0, 4) });

      wx.showLoading({ title: '上传中' });
      const uploaded = [];
      for (const filePath of localPaths) {
        uploaded.push(await tryUploadImageToCloud(filePath, 'daily-photos'));
      }

      const nextImages = this.data.form.images.slice();
      uploaded.forEach((item, index) => {
        if (item.ok && item.fileID) nextImages[startIndex + index] = item.fileID;
      });
      this.setData({ 'form.images': nextImages.slice(0, 4) });

      if (uploaded.some((item) => !item.ok)) {
        wx.showToast({ title: '部分图片云端保存失败，已保留本地预览', icon: 'none' });
      } else {
        wx.showToast({ title: '上传成功' });
      }
    } catch (error) {
      console.warn('[page] choose daily images failed', error);
      wx.showToast({ title: '未选择照片或上传失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  removeImage(event) {
    const index = Number(event.currentTarget.dataset.index);
    const images = this.data.form.images.slice();
    images.splice(index, 1);
    this.setData({ 'form.images': images });
  },

  async generate() {
    const user = this.data.user || { plan: 'free', role: 'user' };
    if (!this.data.selectedPet._id) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }

    const theme = this.data.themeInfo || resolveTheme(user);
    const themeSnapshot = getThemeSnapshot(theme);
    const selectedPet = this.data.selectedPet || {};
    const cardData = {
      ...this.data.form,
      ...themeSnapshot,
      templateId: themeSnapshot.themeId,
      templateName: themeSnapshot.themeName,
      templateLevel: 'free',
      templatePreviewLocked: false,
      userPlan: 'free',
      userRole: user.role || 'user',
      petId: selectedPet._id,
      petName: selectedPet.name,
      petType: selectedPet.type,
      petAvatar: selectedPet.avatar,
      petLevel: selectedPet.level || 1,
      petRealm: selectedPet.realm || '',
      petTitle: selectedPet.title || '',
      petExp: selectedPet.exp || 0,
      petNextLevelExp: selectedPet.nextLevelExp || 100,
      petExpProgress: selectedPet.expProgress || 0,
      streakDays: selectedPet.streakDays || 0,
      totalRecordDays: selectedPet.totalRecordDays || 0,
      badgeCount: selectedPet.badges ? selectedPet.badges.length : 0,
      birthday: selectedPet.birthday || '',
      homeDate: selectedPet.homeDate || selectedPet.adoptDate || '',
      recordDate: formatDate(),
      templateIsPaid: false,
      isWatermarked: false,
      careRecords: this.data.careRecords
    };

    wx.setStorageSync('dailyCardDraft', cardData);
    wx.navigateTo({
      url: '/pages/card-preview/card-preview',
      success: (res) => {
        res.eventChannel.emit('cardData', cardData);
      }
    });
  }
});
