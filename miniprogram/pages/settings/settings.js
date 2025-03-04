// settings.js
Page({
  data: {
    darkMode: false,
    soundEnabled: true,
    vibrationEnabled: true,
    defaultCoffeeWeight: 15,
    defaultRatio: 15
  },

  onLoad() {
    // 从本地存储加载设置
    const settings = wx.getStorageSync('appSettings');
    if (settings) {
      this.setData({
        darkMode: settings.darkMode !== undefined ? settings.darkMode : this.data.darkMode,
        soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : this.data.soundEnabled,
        vibrationEnabled: settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : this.data.vibrationEnabled,
        defaultCoffeeWeight: settings.defaultCoffeeWeight || this.data.defaultCoffeeWeight,
        defaultRatio: settings.defaultRatio || this.data.defaultRatio
      });
    }
  },

  toggleDarkMode(e) {
    this.setData({
      darkMode: e.detail.value
    });
  },

  toggleSound(e) {
    this.setData({
      soundEnabled: e.detail.value
    });
  },

  toggleVibration(e) {
    this.setData({
      vibrationEnabled: e.detail.value
    });
  },

  onDefaultCoffeeWeightChange(e) {
    this.setData({
      defaultCoffeeWeight: parseInt(e.detail.value)
    });
  },

  onDefaultRatioChange(e) {
    this.setData({
      defaultRatio: parseInt(e.detail.value)
    });
  },

  clearAllRecords() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有冲泡记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('coffeeRecords');
          wx.showToast({
            title: '记录已清除',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  resetSettings() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有设置吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            darkMode: false,
            soundEnabled: true,
            vibrationEnabled: true,
            defaultCoffeeWeight: 15,
            defaultRatio: 15
          });
          
          // 保存重置后的设置
          this.saveSettings();
          
          wx.showToast({
            title: '设置已重置',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  saveSettings() {
    const { darkMode, soundEnabled, vibrationEnabled, defaultCoffeeWeight, defaultRatio } = this.data;
    
    // 保存到本地存储
    wx.setStorageSync('appSettings', {
      darkMode,
      soundEnabled,
      vibrationEnabled,
      defaultCoffeeWeight,
      defaultRatio
    });
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 2000
    });
    
    // 返回上一页
    wx.navigateBack();
  }
}); 