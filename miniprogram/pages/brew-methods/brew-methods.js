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
    
    // 显示加载提示
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
      url: `../brew-params/brew-params?method=${method}`,
      success: () => {
        clearTimeout(navigationTimeout);
        wx.hideLoading();
        console.log('导航到参数页面成功');
      },
      fail: (error) => {
        clearTimeout(navigationTimeout);
        wx.hideLoading();
        console.error('导航到参数页面失败', error);
        
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
                this.selectBrewMethod({currentTarget: {dataset: {method: method}}});
              }, 500);
            }
          }
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
  },
  
  navigateToCoffeeRecipes() {
    console.log('导航到咖啡配方页面');
    
    // 显示加载提示
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
      url: '../coffee-recipes/coffee-recipes',
      success: () => {
        clearTimeout(navigationTimeout);
        wx.hideLoading();
        console.log('导航到咖啡配方页面成功');
      },
      fail: (error) => {
        clearTimeout(navigationTimeout);
        wx.hideLoading();
        console.error('导航到咖啡配方页面失败', error);
        
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
                this.navigateToCoffeeRecipes();
              }, 500);
            }
          }
        });
      }
    });
  }
});
