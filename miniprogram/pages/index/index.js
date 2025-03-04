// index.js
Page({
  data: {
    debugInfo: '页面已加载'
  },

  onLoad() {
    console.log('首页加载');
    this.setData({
      debugInfo: '加载完成: ' + new Date().toLocaleTimeString()
    });
  },

  onShow() {
    console.log('首页显示');
  },

  goToSelectBrewMethod() {
    console.log('跳转到冲泡方法选择页面');
    wx.navigateTo({
      url: '../brew-methods/brew-methods',
      success: () => {
        console.log('导航成功');
      },
      fail: (error) => {
        console.error('导航失败', error);
        // 尝试使用switchTab作为备选方案
        wx.switchTab({
          url: '../brew-methods/brew-methods',
          fail: (switchError) => {
            console.error('切换标签也失败', switchError);
            wx.showToast({
              title: '导航失败，请重试',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  testMethod() {
    console.log('测试按钮被点击');
    wx.showToast({
      title: '测试点击成功',
      icon: 'success',
      duration: 2000
    });
    
    // 更新调试信息
    this.setData({
      debugInfo: '按钮点击测试: ' + new Date().toLocaleTimeString()
    });
  }
}); 