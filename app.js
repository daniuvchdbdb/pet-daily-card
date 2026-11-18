App({
  globalData: {
    envId: 'YOUR_CLOUD_ENV_ID',
    userInfo: null,
    currentTheme: null,
    cloudReady: false
  },

  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({
        title: '当前微信版本过低',
        content: '请使用支持云开发的微信版本打开小程序。',
        showCancel: false
      });
      return;
    }

    wx.cloud.init({
      env: this.globalData.envId,
      traceUser: true
    });
    this.globalData.cloudReady = true;
  }
});
