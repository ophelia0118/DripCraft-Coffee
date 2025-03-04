// 此文件作为TypeScript的桥接文件
// 请确保微信开发工具已正确配置TypeScript编译

// 直接定义页面
Page({
  data: {
    brewMethods: [
      {
        id: 'hario-v60',
        name: 'Hario V60',
        description: '锥形滤杯',
        image: '/assets/images/v60.jpg'
      },
      {
        id: 'kalita-wave',
        name: 'Kalita Wave',
        description: '平底滤杯',
        image: '/assets/images/kalita.jpg'
      },
      {
        id: 'chemex',
        name: 'Chemex',
        description: '经典滤杯',
        image: '/assets/images/chemex.jpg'
      },
      {
        id: 'melitta',
        name: 'Melitta',
        description: '楔形滤杯',
        image: '/assets/images/melitta.jpg'
      },
      {
        id: 'bee-house',
        name: 'Bee House',
        description: '日式陶瓷滤杯',
        image: '/assets/images/beehouse.jpg'
      },
      {
        id: 'kono',
        name: 'Kono',
        description: '日式金属滤杯',
        image: '/assets/images/kono.jpg'
      }
    ]
  },

  onLoad() {
    console.log('冲泡方法页面加载');
  },

  onShow() {
    console.log('冲泡方法页面显示');
  },

  selectBrewMethod(e) {
    const method = e.currentTarget.dataset.method;
    console.log('选择冲泡方法:', method);
    
    wx.navigateTo({
      url: `../brew-params/brew-params?method=${method}`,
      success: () => {
        console.log('导航到参数页面成功');
      },
      fail: (error) => {
        console.error('导航到参数页面失败', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  goToHome() {
    wx.navigateTo({
      url: '../index/index',
      fail: () => {
        wx.switchTab({
          url: '../index/index'
        });
      }
    });
  },

  goToRecords() {
    wx.navigateTo({
      url: '../record/record'
    });
  }
});
