// brew-params.js
Page({
  data: {
    methodName: 'Kalita Wave',
    methodDesc: '(平底滤杯)',
    methodImage: '/assets/images/kalita.jpg',
    coffeeAmount: 15,
    waterTemp: 92,
    grindSizeValue: 3,
    grindSize: '中',
    ratioIndex: 1,
    waterRatio: '1:15',
    waterAmount: 225,
    autoCalculate: true,
    showScienceTooltip: false // 科学参数提示显示状态
  },

  onLoad(options) {
    console.log('参数页面加载:', options);
    if (options.method) {
      this.setMethodDetails(options.method);
    }
  },

  setMethodDetails(method) {
    console.log('设置冲泡方法:', method);
    const methodDetails = {
      'hario-v60': {
        methodName: 'Hario V60',
        methodDesc: '(锥形滤杯)',
        methodImage: '/assets/images/v60.jpg',
        grindSizeValue: 2,
        grindSize: '中细',
        waterTemp: 94
      },
      'kalita-wave': {
        methodName: 'Kalita Wave',
        methodDesc: '(平底滤杯)',
        methodImage: '/assets/images/kalita.jpg',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 92
      },
      'chemex': {
        methodName: 'Chemex',
        methodDesc: '',
        methodImage: '/assets/images/chemex.jpg',
        grindSizeValue: 4,
        grindSize: '中粗',
        waterTemp: 93
      },
      'melitta': {
        methodName: 'Melitta',
        methodDesc: '',
        methodImage: '/assets/images/melitta.jpg',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 92
      },
      'bee-house': {
        methodName: 'Bee House',
        methodDesc: '',
        methodImage: '/assets/images/beehouse.jpg',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 90
      },
      'kono': {
        methodName: 'Kono',
        methodDesc: '',
        methodImage: '/assets/images/kono.jpg',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 92
      }
    };

    if (methodDetails[method]) {
      this.setData(methodDetails[method]);
      this.calculateWaterAmount();
    }
  },

  // 应用科学咖啡冲泡参数
  applyScienceParams() {
    // 科学化参数配置
    const scienceParams = {
      'Hario V60': {
        waterTemp: 96,     // 205°F (96°C)
        grindSizeValue: 2, // 中细
        grindSize: '中细',
        ratioIndex: 2,     // 1:16
        waterRatio: '1:16',
        scienceTip: '适合快速萃取，强调风味层次。建议使用鹅颈壶以圆形方式倒水，先进行30秒的预浸（bloom），然后分阶段倒水以控制萃取。'
      },
      'Kalita Wave': {
        waterTemp: 96,     // 205°F (96°C)
        grindSizeValue: 3, // 中
        grindSize: '中',
        ratioIndex: 2,     // 1:16
        waterRatio: '1:16',
        scienceTip: '平底设计有助于均匀萃取。使用Kalita Wave专用滤纸，螺旋式倒水保持水位稳定，避免边缘倒水。'
      },
      'Chemex': {
        waterTemp: 96,     // 205°F (96°C)
        grindSizeValue: 5, // 粗
        grindSize: '粗',
        ratioIndex: 1,     // 1:15
        waterRatio: '1:15',
        scienceTip: '较长冲泡时间适合其较大容量和粗研磨。使用Chemex专用滤纸，分阶段倒水，预浸后等待30秒再继续，适合较大批量的冲泡。'
      },
      'Melitta': {
        waterTemp: 93,     // 200°F (93°C)
        grindSizeValue: 2, // 中细至中
        grindSize: '中细',
        ratioIndex: 3,     // 1:17
        waterRatio: '1:17',
        scienceTip: '适合日常简单冲泡。使用标准Melitta锥形滤纸，均匀倒水，预浸30秒后继续，适合小型冲泡。'
      },
      'Bee House': {
        waterTemp: 93,     // 200-205°F (93-96°C)
        grindSizeValue: 2, // 中细
        grindSize: '中细',
        ratioIndex: 2,     // 1:16
        waterRatio: '1:16',
        scienceTip: '与Melitta类似，适合日常使用。使用标准Melitta锥形滤纸，均匀倒水，预浸后分阶段倒水。'
      },
      'Kono': {
        waterTemp: 94,     // 200-205°F (93-96°C)
        grindSizeValue: 3, // 中
        grindSize: '中',
        ratioIndex: 2,     // 1:16
        waterRatio: '1:16',
        scienceTip: '类似其他锥形滤杯，强调稳定滴流。使用Kono专用滤纸，控制倒水速度以保持稳定滴流，预浸30秒后分阶段倒水。'
      }
    };
    
    // 根据当前方法应用科学参数
    const params = scienceParams[this.data.methodName];
    if (params) {
      this.setData({
        waterTemp: params.waterTemp,
        grindSizeValue: params.grindSizeValue,
        grindSize: params.grindSize,
        ratioIndex: params.ratioIndex,
        waterRatio: params.waterRatio,
        scienceTip: params.scienceTip,
        showScienceTooltip: true
      });
      
      // 自动计算水量
      this.calculateWaterAmount();
      
      // 显示提示
      wx.showToast({
        title: '已应用科学参数',
        icon: 'success',
        duration: 1500
      });
      
      // 5秒后隐藏科学提示
      setTimeout(() => {
        this.setData({
          showScienceTooltip: false
        });
      }, 10000);
    }
  },
  
  // 关闭科学参数提示
  closeScienceTip() {
    this.setData({
      showScienceTooltip: false
    });
  },

  decreaseCoffeeAmount() {
    console.log('减少咖啡量');
    if (this.data.coffeeAmount > 5) {
      this.setData({
        coffeeAmount: this.data.coffeeAmount - 1
      });
      this.calculateWaterAmount();
    }
  },

  increaseCoffeeAmount() {
    console.log('增加咖啡量');
    if (this.data.coffeeAmount < 30) {
      this.setData({
        coffeeAmount: this.data.coffeeAmount + 1
      });
      this.calculateWaterAmount();
    }
  },

  decreaseWaterTemp() {
    console.log('降低水温');
    if (this.data.waterTemp > 85) {
      this.setData({
        waterTemp: this.data.waterTemp - 1
      });
    }
  },

  increaseWaterTemp() {
    console.log('提高水温');
    if (this.data.waterTemp < 100) {
      this.setData({
        waterTemp: this.data.waterTemp + 1
      });
    }
  },

  onGrindSizeChange(e) {
    const value = e.detail.value;
    const grindSizes = ['细', '中细', '中', '中粗', '粗'];
    this.setData({
      grindSizeValue: value,
      grindSize: grindSizes[value - 1]
    });
  },

  onRatioChange(e) {
    const value = e.detail.value;
    const ratios = ['1:14', '1:15', '1:16', '1:17', '1:18'];
    this.setData({
      ratioIndex: value,
      waterRatio: ratios[value]
    });
    this.calculateWaterAmount();
  },

  calculateWaterAmount() {
    if (this.data.autoCalculate) {
      const ratioValue = parseInt(this.data.waterRatio.split(':')[1]);
      const waterAmount = this.data.coffeeAmount * ratioValue;
      this.setData({
        waterAmount: waterAmount
      });
    }
  },

  toggleAutoCalculate(e) {
    this.setData({
      autoCalculate: e.detail.value
    });
    if (e.detail.value) {
      this.calculateWaterAmount();
    }
  },

  startBrewing() {
    console.log('开始冲泡');
    const brewParams = {
      methodName: this.data.methodName,
      methodDesc: this.data.methodDesc,
      methodImage: this.data.methodImage,
      coffeeAmount: this.data.coffeeAmount,
      waterTemp: this.data.waterTemp,
      grindSize: this.data.grindSize,
      grindSizeDesc: '',  // 不再使用比喻性描述
      waterRatio: this.data.waterRatio,
      waterAmount: this.data.waterAmount
    };

    wx.navigateTo({
      url: `../brew-timer/brew-timer?params=${encodeURIComponent(JSON.stringify(brewParams))}`,
      fail: (error) => {
        console.error('导航失败:', error);
        wx.showToast({
          title: '导航失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 将研磨度转换为描述性文字 - 不再使用比喻
  convertGrindSizeToDesc(grindSize) {
    return '';  // 返回空字符串，不再使用比喻性描述
  }
}); 