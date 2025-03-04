// index.ts
Page({
  data: {
    // 移除不需要的数据
  },
  
  goToSelectBrewMethod() {
    wx.navigateTo({
      url: '../brew-methods/brew-methods'
    });
  }
});
