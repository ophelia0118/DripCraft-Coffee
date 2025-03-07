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

  startBrewing() {
    // 使用预加载提示，降低用户对加载时间的感知
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
    
    // 设置导航超时处理
    const navigationTimeout = setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '加载超时，请重试',
        icon: 'none',
        duration: 2000
      });
    }, 5000); // 5秒超时
    
    wx.navigateTo({
      url: '../brew-methods/brew-methods',
      success: () => {
        clearTimeout(navigationTimeout);
        wx.hideLoading();
        console.log('导航成功');
      },
      fail: (error) => {
        clearTimeout(navigationTimeout);
        wx.hideLoading();
        console.error('导航失败', error);
        
        // 显示错误并提供重试选项
        wx.showModal({
          title: '页面加载失败',
          content: '可能是系统资源不足，是否重试？',
          confirmText: '重试',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 延迟一会再重试，给系统一些恢复时间
              setTimeout(() => {
                this.startBrewing();
              }, 500);
            }
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