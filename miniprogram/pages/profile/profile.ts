// profile.ts
const profileDefaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    userInfo: {
      avatarUrl: profileDefaultAvatarUrl,
      nickName: '',
    },
    totalRecords: 0,
    totalCoffeeWeight: 0,
    totalWaterWeight: 0,
    averageRatio: 0,
    favoriteBean: '',
  },

  onLoad() {
    // 加载用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      });
    }
    
    this.loadStatistics();
  },

  onShow() {
    this.loadStatistics();
  },

  loadStatistics() {
    // 从本地存储获取记录
    const records = wx.getStorageSync('coffeeRecords') || [];
    
    if (records.length === 0) {
      this.setData({
        totalRecords: 0,
        totalCoffeeWeight: 0,
        totalWaterWeight: 0,
        averageRatio: 0,
        favoriteBean: '暂无数据'
      });
      return;
    }
    
    // 计算统计数据
    const totalRecords = records.length;
    let totalCoffeeWeight = 0;
    let totalWaterWeight = 0;
    const beanCount: {[key: string]: number} = {};
    
    records.forEach((record: any) => {
      totalCoffeeWeight += record.coffeeWeight || 0;
      totalWaterWeight += record.waterWeight || 0;
      
      if (record.coffeeType) {
        beanCount[record.coffeeType] = (beanCount[record.coffeeType] || 0) + 1;
      }
    });
    
    // 找出最常用的咖啡豆
    let favoriteBean = '';
    let maxCount = 0;
    
    for (const bean in beanCount) {
      if (beanCount[bean] > maxCount) {
        maxCount = beanCount[bean];
        favoriteBean = bean;
      }
    }
    
    this.setData({
      totalRecords,
      totalCoffeeWeight,
      totalWaterWeight,
      averageRatio: totalRecords > 0 ? Math.round((totalWaterWeight / totalCoffeeWeight) * 10) / 10 : 0,
      favoriteBean: favoriteBean || '暂无数据'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '../settings/settings'
    });
  },

  goToFavorites() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  goToHelp() {
    wx.navigateTo({
      url: '../help/help'
    });
  },

  goToAbout() {
    wx.navigateTo({
      url: '../about/about'
    });
  }
}); 