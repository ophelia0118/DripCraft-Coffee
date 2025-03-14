// brew-params.js
Page({
  data: {
    methodName: 'Kalita Wave',
    methodDesc: '(平底滤杯)',
    methodImage: '/assets/images/kalita.jpg',
    methodNameShort: 'Kalita',
    coffeeAmount: 15,
    waterTemp: 92,
    grindSizeValue: 3,
    grindSize: '中',
    ratioIndex: 1,
    waterRatio: '1:15',
    waterAmount: 225,
    autoCalculate: true,
    showScienceTooltip: false, // 科学参数提示显示状态
    method: null,
    // 输入对话框相关数据
    showInputDialog: false,
    dialogTitle: '',
    dialogInputValue: '',
    dialogUnit: '',
    currentInputType: '' // 'coffee' 或 'waterTemp'
  },

  onLoad(options) {
    console.log('参数页面加载:', options);
    
    // 仅设置基本参数，其他操作延迟执行
    if (options.method) {
      this.setData({
        method: options.method
      });
      
      // 延迟执行复杂操作，避免初始化阻塞
      wx.nextTick(() => {
        this.setMethodDetails(options.method);
        
        // 尝试加载保存的参数
        this.loadSavedParams();
      });
    }
  },

  onReady() {
    // 页面渲染完成后，可以进行其他初始化工作
  },

  setMethodDetails(method) {
    console.log('设置冲泡方法:', method);
    const methodDetails = {
      'hario-v60': {
        methodName: 'Hario V60',
        methodDesc: '(锥形滤杯)',
        methodImage: '/assets/images/v60.jpg',
        methodNameShort: 'V60',
      },
      'kalita-wave': {
        methodName: 'Kalita Wave',
        methodDesc: '(平底滤杯)',
        methodImage: '/assets/images/kalita.jpg',
        methodNameShort: 'Kalita',
      },
      'chemex': {
        methodName: 'Chemex',
        methodDesc: '',
        methodImage: '/assets/images/chemex.jpg',
        methodNameShort: 'Chemex',
      },
      'melitta': {
        methodName: 'Melitta',
        methodDesc: '',
        methodImage: '/assets/images/melitta.jpg',
        methodNameShort: 'Melitta',
      },
      'bee-house': {
        methodName: 'Bee House',
        methodDesc: '',
        methodImage: '/assets/images/beehouse.jpg',
        methodNameShort: 'Bee House',
      },
      'kono': {
        methodName: 'Kono',
        methodDesc: '',
        methodImage: '/assets/images/kono.jpg',
        methodNameShort: 'Kono',
      }
    };

    if (methodDetails[method]) {
      this.setData(methodDetails[method]);
    }
  },

  // 应用推荐参数按钮事件处理函数
  applyRecommendedParams() {
    // 弹出确认对话框
    wx.showModal({
      title: '应用推荐参数',
      content: '这将重置所有参数为当前冲泡方法的推荐值，确定继续吗？',
      confirmText: '应用',
      confirmColor: '#6F4E37',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，应用推荐参数
          this.applyScienceParams(true);
          
          // 显示成功提示
          wx.showToast({
            title: '已应用推荐参数',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 应用科学咖啡冲泡参数
  applyScienceParams(showToast = true) {
    // 科学化参数配置 - 根据冲泡指南页面的确切数据进行更新
    const scienceParams = {
      'Hario V60': {
        waterTemp: 93,     // 冲泡指南：375毫升热水，水温约93°C
        grindSizeValue: 2, // 中细
        grindSize: '中细',
        ratioIndex: 1,     // 1:15 (冲泡指南：1:15，即25克咖啡配375毫升水)
        waterRatio: '1:15',
        coffeeAmount: 25,  // 冲泡指南：25克咖啡
        scienceTip: '适合快速萃取，强调风味层次。建议使用鹅颈壶以圆形方式倒水，先进行30秒的预浸（bloom），然后分阶段倒水以控制萃取。'
      },
      'Kalita Wave': {
        waterTemp: 94,     // 冲泡指南：水温约92-96°C（取中间值）
        grindSizeValue: 2, // 中细（指南中说明使用中细研磨）
        grindSize: '中细',
        ratioIndex: 2,     // 1:16 (冲泡指南：1:16，即25克咖啡配400毫升水)
        waterRatio: '1:16',
        coffeeAmount: 25,  // 冲泡指南：25克咖啡
        scienceTip: '平底设计有助于均匀萃取。使用Kalita Wave专用滤纸，螺旋式倒水保持水位稳定，避免边缘倒水。'
      },
      'Chemex': {
        waterTemp: 96,     // 冲泡指南：水温约96°C
        grindSizeValue: 4, // 中粗
        grindSize: '中粗',
        ratioIndex: 3,     // 1:17 (冲泡指南：1:17，即42克咖啡配700毫升水)
        waterRatio: '1:17',
        coffeeAmount: 42,  // 冲泡指南：42克咖啡
        scienceTip: '较长冲泡时间适合其较大容量和中粗研磨。使用Chemex专用滤纸，分阶段倒水，预浸后等待30秒再继续，适合较大批量的冲泡。'
      },
      'Melitta': {
        waterTemp: 93,     // 冲泡指南：水温约90-96°C（取中间值）
        grindSizeValue: 2, // 中细
        grindSize: '中细',
        ratioIndex: 3,     // 1:17
        waterRatio: '1:17',
        coffeeAmount: 23.5,  // 精确匹配冲泡指南：23.5克咖啡
        scienceTip: '适合日常简单冲泡。使用标准Melitta锥形滤纸，均匀倒水，预浸30秒后继续，适合小型冲泡。'
      },
      'Bee House': {
        waterTemp: 96,     // 冲泡指南：水温约96°C
        grindSizeValue: 2, // 中细
        grindSize: '中细',
        ratioIndex: 4,     // 1:18 (冲泡指南：1:18，即21克咖啡配380毫升水)
        waterRatio: '1:18',
        coffeeAmount: 21,  // 冲泡指南：21克咖啡
        scienceTip: '与Melitta类似，适合日常使用。使用标准Melitta锥形滤纸，均匀倒水，预浸后分阶段倒水。'
      },
      'Kono': {
        waterTemp: 93,     // 冲泡指南：水温约93°C / 195°F
        grindSizeValue: 2, // 中细（指南中说明使用中等至中细研磨）
        grindSize: '中细',
        ratioIndex: 2,     // 1:16 (冲泡指南：1:15.8，近似为1:16)
        waterRatio: '1:16',
        coffeeAmount: 12,  // 冲泡指南：12克咖啡
        scienceTip: '类似其他锥形滤杯，强调稳定滴流。使用Kono专用滤纸，控制倒水速度以保持稳定滴流，预浸30秒后分阶段倒水。'
      }
    };
    
    // 根据当前冲泡方法应用相应的科学参数
    const params = scienceParams[this.data.methodName];
    if (params) {
      // 设置这些参数
      const newData = {
        ...params
      };
      
      // 计算水量
      const ratio = parseInt(newData.waterRatio.split(':')[1]);
      newData.waterAmount = newData.coffeeAmount * ratio;
      
      // 显示科学参数提示并设置数据
      this.setData({
        ...newData,
        showScienceTooltip: true
      });
      
      if (showToast) {
        wx.showToast({
          title: '已应用推荐参数',
          icon: 'success'
        });
      }
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
        coffeeAmount: parseFloat((this.data.coffeeAmount - 0.5).toFixed(1))
      });
      this.calculateWaterAmount();
    }
  },

  increaseCoffeeAmount() {
    console.log('增加咖啡量');
    if (this.data.coffeeAmount < 50) {
      this.setData({
        coffeeAmount: parseFloat((this.data.coffeeAmount + 0.5).toFixed(1))
      });
      this.calculateWaterAmount();
    }
  },

  decreaseWaterTemp() {
    console.log('降低水温');
    if (this.data.waterTemp > 85) {
      this.setData({
        waterTemp: parseFloat((this.data.waterTemp - 0.5).toFixed(1))
      });
    }
  },

  increaseWaterTemp() {
    console.log('提高水温');
    if (this.data.waterTemp < 100) {
      this.setData({
        waterTemp: parseFloat((this.data.waterTemp + 0.5).toFixed(1))
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
      // 计算水量，乘以比例，然后四舍五入到最接近的整数
      const waterAmount = Math.round(this.data.coffeeAmount * ratioValue);
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
    // 保存当前参数
    this.saveCurrentParams();
    
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
  },
  
  // 显示冲泡指南
  showBrewingGuide() {
    const methodName = this.data.methodNameShort;
    
    console.log('显示冲泡指南:', methodName);
    // 直接导航到帮助页面显示指南
    wx.navigateTo({
      url: `../help/help?source=guide&method=${methodName}`,
      success: () => {
        console.log('导航到指南页面成功');
      },
      fail: (error) => {
        console.error('导航到指南页面失败:', error);
        wx.showToast({
          title: '打开指南失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 显示咖啡粉量输入对话框
  showCoffeeInputDialog() {
    this.setData({
      showInputDialog: true,
      dialogTitle: '输入咖啡粉量',
      dialogInputValue: this.data.coffeeAmount.toString(),
      dialogUnit: 'g',
      currentInputType: 'coffee'
    });
  },

  // 显示水温输入对话框
  showWaterTempInputDialog() {
    this.setData({
      showInputDialog: true,
      dialogTitle: '输入水温',
      dialogInputValue: this.data.waterTemp.toString(),
      dialogUnit: '°C',
      currentInputType: 'waterTemp'
    });
  },

  // 关闭输入对话框
  closeInputDialog() {
    this.setData({
      showInputDialog: false
    });
  },

  // 处理对话框中的输入
  onDialogInput(e) {
    this.setData({
      dialogInputValue: e.detail.value
    });
  },

  // 防止背景滚动
  preventTouchMove() {
    return false;
  },

  // 确认输入值
  confirmInputValue() {
    const value = parseFloat(this.data.dialogInputValue);
    if (isNaN(value)) {
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      });
      return;
    }

    if (this.data.currentInputType === 'coffee') {
      // 检查咖啡粉量范围
      if (value < 5 || value > 50) {
        wx.showToast({
          title: '咖啡粉量应在5-50g之间',
          icon: 'none'
        });
        return;
      }
      this.setData({
        coffeeAmount: parseFloat(value.toFixed(1))
      });
      this.calculateWaterAmount();
    } else if (this.data.currentInputType === 'waterTemp') {
      // 检查水温范围
      if (value < 85 || value > 100) {
        wx.showToast({
          title: '水温应在85-100°C之间',
          icon: 'none'
        });
        return;
      }
      this.setData({
        waterTemp: parseFloat(value.toFixed(1))
      });
    }

    this.closeInputDialog();
  },

  // 新增：加载已保存的参数
  loadSavedParams() {
    const method = this.data.methodName;
    // 构建存储键名，针对每种冲泡方法分别存储
    const storageKey = `saved_params_${method}`;
    const savedParams = wx.getStorageSync(storageKey);
    
    if (savedParams) {
      console.log(`加载已保存的${method}参数:`, savedParams);
      
      // 更新界面数据
      this.setData({
        ...savedParams
      });
      
      // 显示提示
      wx.showToast({
        title: '已加载保存参数',
        icon: 'success',
        duration: 1000
      });
    } else {
      // 如果没有保存的参数，则应用推荐参数
      console.log('没有保存的参数，使用推荐参数');
      this.applyScienceParams(false);
    }
  },

  // 新增：保存当前参数
  saveCurrentParams() {
    const method = this.data.methodName;
    const storageKey = `saved_params_${method}`;
    
    // 提取需要保存的参数
    const paramsToSave = {
      coffeeAmount: this.data.coffeeAmount,
      waterTemp: this.data.waterTemp,
      grindSizeValue: this.data.grindSizeValue,
      grindSize: this.data.grindSize,
      ratioIndex: this.data.ratioIndex,
      waterRatio: this.data.waterRatio,
      waterAmount: this.data.waterAmount
    };
    
    // 保存参数
    wx.setStorageSync(storageKey, paramsToSave);
    console.log(`已保存${method}参数:`, paramsToSave);
  },

  // 在页面隐藏时自动保存参数
  onHide() {
    this.saveCurrentParams();
  },

  // 新增: 分享功能
  onShareAppMessage: function() {
    const { methodName, coffeeAmount, waterAmount, waterTemp, grindSize } = this.data;
    
    return {
      title: `我在用DripCraft设置${methodName}冲泡参数，快来看看吧！`,
      path: '/pages/brew-params/brew-params?method=' + encodeURIComponent(methodName),
      imageUrl: '/images/share-params.png', // 如果有分享图片的话
      success: function(res) {
        // 分享成功
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(res) {
        // 分享失败
        wx.showToast({
          title: '分享失败',
          icon: 'none',
          duration: 2000
        });
      }
    };
  },
}); 