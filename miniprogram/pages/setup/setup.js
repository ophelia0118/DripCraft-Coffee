// setup.js
Page({
  data: {
    coffeeType: '埃塞俄比亚耶加雪菲',
    coffeeWeight: 15,
    waterWeight: 225,
    ratio: 15,
    waterWeightLocked: true,
    brewingSteps: [
      { time: '00:00', description: '开始冲泡，先注入30g水进行闷蒸' },
      { time: '00:30', description: '闷蒸结束，开始第一次注水，注入至100g' },
      { time: '01:15', description: '开始第二次注水，注入至160g' },
      { time: '01:45', description: '开始第三次注水，注入至225g' },
      { time: '02:30', description: '冲泡完成，请享用您的咖啡' }
    ]
  },

  onLoad() {
    // 从本地存储获取设置
    const settings = wx.getStorageSync('coffeeSettings');
    if (settings) {
      this.setData({
        coffeeType: settings.coffeeType || this.data.coffeeType,
        coffeeWeight: settings.coffeeWeight || this.data.coffeeWeight,
        waterWeight: settings.waterWeight || this.data.waterWeight,
        ratio: settings.ratio || this.data.ratio,
        brewingSteps: settings.brewingSteps || this.data.brewingSteps
      });
    }
  },

  onCoffeeTypeChange(e) {
    this.setData({
      coffeeType: e.detail.value
    });
  },

  onCoffeeWeightChange(e) {
    const coffeeWeight = parseFloat(e.detail.value) || 0;
    
    this.setData({ coffeeWeight });
    
    if (this.data.waterWeightLocked) {
      this.updateWaterWeight();
    } else {
      this.updateRatio();
    }
  },

  onRatioChange(e) {
    const ratio = parseFloat(e.detail.value) || 0;
    
    this.setData({ ratio });
    
    if (this.data.waterWeightLocked) {
      this.updateWaterWeight();
    } else {
      this.updateRatio();
    }
  },

  onWaterWeightChange(e) {
    const waterWeight = parseFloat(e.detail.value) || 0;
    
    this.setData({ 
      waterWeight,
      waterWeightLocked: false
    });
    
    this.updateRatio();
  },

  toggleWaterWeightLock(e) {
    this.setData({
      waterWeightLocked: e.detail.value
    });
  },

  updateWaterWeight() {
    const { coffeeWeight, ratio } = this.data;
    
    if (coffeeWeight > 0 && ratio > 0) {
      const waterWeight = Math.round(coffeeWeight * ratio);
      this.setData({ waterWeight });
    }
  },

  updateRatio() {
    const { coffeeWeight, waterWeight } = this.data;
    
    if (coffeeWeight > 0 && waterWeight > 0) {
      const ratio = Math.round((waterWeight / coffeeWeight) * 10) / 10;
      this.setData({ ratio });
    }
  },

  onStepTimeChange(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    const brewingSteps = [...this.data.brewingSteps];
    brewingSteps[index].time = value;
    
    this.setData({
      brewingSteps
    });
  },

  onStepDescChange(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    const brewingSteps = [...this.data.brewingSteps];
    brewingSteps[index].description = value;
    
    this.setData({
      brewingSteps
    });
  },

  addStep() {
    const brewingSteps = [...this.data.brewingSteps];
    
    brewingSteps.push({
      time: '00:00',
      description: '新步骤'
    });
    
    this.setData({
      brewingSteps
    });
  },

  deleteStep(e) {
    const { index } = e.currentTarget.dataset;
    
    if (this.data.brewingSteps.length <= 1) {
      wx.showToast({
        title: '至少需要保留一个步骤',
        icon: 'none'
      });
      return;
    }
    
    const brewingSteps = [...this.data.brewingSteps];
    brewingSteps.splice(index, 1);
    
    this.setData({
      brewingSteps
    });
  },

  saveSettings() {
    const { coffeeType, coffeeWeight, waterWeight, ratio, brewingSteps } = this.data;
    
    // 验证数据
    if (coffeeWeight <= 0) {
      wx.showToast({
        title: '咖啡粉重量必须大于0',
        icon: 'none'
      });
      return;
    }
    
    if (waterWeight <= 0) {
      wx.showToast({
        title: '水重量必须大于0',
        icon: 'none'
      });
      return;
    }
    
    if (ratio <= 0) {
      wx.showToast({
        title: '比例必须大于0',
        icon: 'none'
      });
      return;
    }
    
    // 验证步骤时间格式
    for (const step of brewingSteps) {
      if (!/^\d{2}:\d{2}$/.test(step.time)) {
        wx.showToast({
          title: '步骤时间格式错误',
          icon: 'none'
        });
        return;
      }
    }
    
    // 验证步骤描述
    for (const step of brewingSteps) {
      if (!step.description.trim()) {
        wx.showToast({
          title: '步骤描述不能为空',
          icon: 'none'
        });
        return;
      }
    }
    
    // 按时间排序步骤
    const sortedSteps = [...brewingSteps].sort((a, b) => {
      const [aMinutes, aSeconds] = a.time.split(':').map(Number);
      const [bMinutes, bSeconds] = b.time.split(':').map(Number);
      
      const aTime = aMinutes * 60 + aSeconds;
      const bTime = bMinutes * 60 + bSeconds;
      
      return aTime - bTime;
    });
    
    // 保存到本地存储
    wx.setStorageSync('coffeeSettings', {
      coffeeType,
      coffeeWeight,
      waterWeight,
      ratio,
      brewingSteps: sortedSteps
    });
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 2000
    });
    
    // 返回上一页
    wx.navigateBack();
  },

  cancel() {
    wx.navigateBack();
  }
}); 