const db = require('../../utils/db');
const { tryUploadImageToCloud } = require('../../utils/upload');
const { calculateAge } = require('../../utils/date');
const { PET_TYPES, PET_GENDERS, PERSONALITY_TAGS } = require('../../utils/constants');
const { resolveTheme, applyThemeToPage } = require('../../utils/themeManager');

Page({
  data: {
    id: '',
    themeClass: 'theme-default-warm',
    customThemeStyle: '',
    petTypes: PET_TYPES,
    genders: PET_GENDERS,
    tagItems: PERSONALITY_TAGS.map((label) => ({ label, selected: false })),
    typeIndex: 0,
    genderIndex: 2,
    form: {
      name: '',
      type: PET_TYPES[0],
      breed: '',
      gender: PET_GENDERS[2],
      birthday: '',
      age: '',
      weight: '',
      avatar: '',
      personalityTags: [],
      note: ''
    }
  },

  async onLoad(query = {}) {
    try {
      const user = await db.ensureUser();
      applyThemeToPage(this, resolveTheme(user));
    } catch (error) {
      console.warn('[page] pet edit theme load failed', error);
    }

    if (!query.id) return;
    try {
      const pets = await db.getPets();
      const pet = pets.find((item) => item._id === query.id);
      if (pet) {
        this.setData({
          id: query.id,
          form: { ...this.data.form, ...pet, personalityTags: pet.personalityTags || [] },
          tagItems: this.buildTagItems(pet.personalityTags || []),
          typeIndex: Math.max(PET_TYPES.indexOf(pet.type), 0),
          genderIndex: Math.max(PET_GENDERS.indexOf(pet.gender), 0)
        });
      }
    } catch (error) {
      console.warn('[page] pet info load failed', error);
      wx.showToast({ title: '宠物信息加载失败', icon: 'none' });
    }
  },

  buildTagItems(selected) {
    return PERSONALITY_TAGS.map((label) => ({ label, selected: selected.indexOf(label) > -1 }));
  },

  input(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: event.detail.value });
  },

  pickType(event) {
    const index = Number(event.detail.value);
    this.setData({ typeIndex: index, 'form.type': PET_TYPES[index] });
  },

  pickGender(event) {
    const index = Number(event.detail.value);
    this.setData({ genderIndex: index, 'form.gender': PET_GENDERS[index] });
  },

  pickBirthday(event) {
    this.setData({ 'form.birthday': event.detail.value, 'form.age': calculateAge(event.detail.value) });
  },

  toggleTag(event) {
    const value = event.currentTarget.dataset.value;
    const tags = this.data.form.personalityTags.slice();
    const index = tags.indexOf(value);
    if (index > -1) tags.splice(index, 1);
    else tags.push(value);
    this.setData({ 'form.personalityTags': tags, tagItems: this.buildTagItems(tags) });
  },

  async chooseAvatar() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      });
      const filePath = res.tempFiles[0].tempFilePath;
      this.setData({ 'form.avatar': filePath });

      wx.showLoading({ title: '上传中' });
      const result = await tryUploadImageToCloud(filePath, 'pet-avatars');
      if (result.ok && result.fileID) {
        this.setData({ 'form.avatar': result.fileID });
        wx.showToast({ title: '头像已上传' });
      } else {
        wx.showToast({ title: '头像已显示，本次云端保存失败', icon: 'none' });
      }
    } catch (error) {
      console.warn('[page] choose avatar failed', error);
      wx.showToast({ title: '未选择图片', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async save() {
    const form = this.data.form;
    if (!form.name || !form.name.trim()) {
      wx.showToast({ title: '请填写宠物昵称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    try {
      const result = this.data.id
        ? await db.updatePet(this.data.id, form)
        : await db.addPet(form);

      if (result && result.ok === false) {
        wx.showModal({
          title: '保存失败',
          content: result.message || '请检查云开发配置和 pets 集合。',
          showCancel: false
        });
        return;
      }

      wx.showToast({ title: '已保存' });
      setTimeout(() => wx.navigateBack(), 300);
    } catch (error) {
      console.warn('[page] save pet failed', error);
      wx.showModal({
        title: '保存失败',
        content: '请确认云开发环境、pets 集合和数据库权限已配置。',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  deletePet() {
    if (!this.data.id) return;
    wx.showModal({
      title: '删除宠物',
      content: '确认删除这份宠物档案吗？删除后不会影响已经保存的历史日报卡。',
      confirmText: '删除',
      confirmColor: '#C85B47',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中' });
        try {
          const result = await db.deletePet(this.data.id);
          if (result && result.ok === false) {
            wx.showModal({ title: '删除失败', content: result.message, showCancel: false });
            return;
          }
          wx.showToast({ title: '已删除' });
          setTimeout(() => wx.navigateBack(), 300);
        } catch (error) {
          console.warn('[page] delete pet failed', error);
          wx.showModal({
            title: '删除失败',
            content: '请确认 pets 集合和数据库权限。',
            showCancel: false
          });
        } finally {
          wx.hideLoading();
        }
      }
    });
  }
});
