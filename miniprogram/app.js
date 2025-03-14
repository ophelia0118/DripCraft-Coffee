// app.js
App({
  globalData: {
    userInfo: null,
    theme: 'light',
    defaultCoffeeWeight: 15,
    defaultRatio: 15
  },

  onLaunch() {
    console.log('应用启动');
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res);
      }
    });

    // 加载设置
    this.loadSettings();
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
      } else {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              wx.getUserInfo({
                success: res => {
                  this.globalData.userInfo = res.userInfo;
                  resolve(res.userInfo);
                }
              });
            } else {
              reject(new Error('未授权'));
            }
          }
        });
      }
    });
  },

  loadSettings() {
    try {
      const settings = wx.getStorageSync('coffeeSettings');
      if (settings) {
        if (settings.defaultCoffeeWeight) {
          this.globalData.defaultCoffeeWeight = settings.defaultCoffeeWeight;
        }
        if (settings.defaultRatio) {
          this.globalData.defaultRatio = settings.defaultRatio;
        }
        console.log('加载设置', this.globalData);
      }
    } catch (e) {
      console.error('加载设置失败', e);
    }
  },

  // 新增：全局分享配置
  onShow: function() {
    // 设置全局分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: function() {
        console.log('全局分享菜单设置成功');
      },
      fail: function(err) {
        console.error('全局分享菜单设置失败:', err);
      }
    });
  }
}); 