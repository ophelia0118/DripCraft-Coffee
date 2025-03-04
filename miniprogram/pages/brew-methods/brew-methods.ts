Page({
  data: {
    userName: '吴同学'
  },

  onLoad() {
    // 可以从用户信息中获取用户名
  },

  selectBrewMethod(e: any) {
    const method = e.currentTarget.dataset.method;
    wx.navigateTo({
      url: `../brew-params/brew-params?method=${method}`
    });
  },

  goToHome() {
    wx.switchTab({
      url: '../index/index'
    });
  },

  goToRecords() {
    wx.switchTab({
      url: '../record/record'
    });
  }
}); 