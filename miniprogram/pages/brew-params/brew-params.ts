Page({
  data: {
    methodName: 'Kalita Wave',
    methodDesc: '(平底滤杯)',
    methodImage: '/assets/images/kalita.png',
    coffeeAmount: 15,
    waterTemp: 92,
    grindSizeValue: 3,
    grindSize: '中',
    ratioIndex: 1,
    waterRatio: '1:15',
    waterAmount: 250,
    autoCalculate: true
  },

  onLoad(options: any) {
    if (options.method) {
      this.setMethodDetails(options.method);
    }
  },

  setMethodDetails(method: string) {
    const methodDetails = {
      'hario-v60': {
        methodName: 'Hario V60',
        methodDesc: '(锥形滤杯)',
        methodImage: '/assets/images/v60.png',
        grindSizeValue: 2,
        grindSize: '中细',
        waterTemp: 94
      },
      'kalita-wave': {
        methodName: 'Kalita Wave',
        methodDesc: '(平底滤杯)',
        methodImage: '/assets/images/kalita.png',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 92
      },
      'chemex': {
        methodName: 'Chemex',
        methodDesc: '',
        methodImage: '/assets/images/chemex.png',
        grindSizeValue: 4,
        grindSize: '中粗',
        waterTemp: 93
      },
      'melitta': {
        methodName: 'Melitta',
        methodDesc: '',
        methodImage: '/assets/images/melitta.png',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 92
      },
      'bee-house': {
        methodName: 'Bee House',
        methodDesc: '',
        methodImage: '/assets/images/beehouse.png',
        grindSizeValue: 3,
        grindSize: '中',
        waterTemp: 90
      },
      'kono': {
        methodName: 'Kono',
        methodDesc: '',
        methodImage: '/assets/images/kono.png',
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

  decreaseCoffeeAmount() {
    if (this.data.coffeeAmount > 5) {
      this.setData({
        coffeeAmount: this.data.coffeeAmount - 1
      });
      this.calculateWaterAmount();
    }
  },

  increaseCoffeeAmount() {
    if (this.data.coffeeAmount < 30) {
      this.setData({
        coffeeAmount: this.data.coffeeAmount + 1
      });
      this.calculateWaterAmount();
    }
  },

  decreaseWaterTemp() {
    if (this.data.waterTemp > 85) {
      this.setData({
        waterTemp: this.data.waterTemp - 1
      });
    }
  },

  increaseWaterTemp() {
    if (this.data.waterTemp < 100) {
      this.setData({
        waterTemp: this.data.waterTemp + 1
      });
    }
  },

  onGrindSizeChange(e: any) {
    const value = e.detail.value;
    const grindSizes = ['极细', '细', '中细', '中', '中粗', '粗'];
    this.setData({
      grindSizeValue: value,
      grindSize: grindSizes[value]
    });
  },

  onRatioChange(e: any) {
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

  toggleAutoCalculate(e: any) {
    this.setData({
      autoCalculate: e.detail.value
    });
    if (e.detail.value) {
      this.calculateWaterAmount();
    }
  },

  startBrewing() {
    const brewParams = {
      methodName: this.data.methodName,
      methodDesc: this.data.methodDesc,
      methodImage: this.data.methodImage,
      coffeeAmount: this.data.coffeeAmount,
      waterTemp: this.data.waterTemp,
      grindSize: this.data.grindSize,
      waterRatio: this.data.waterRatio,
      waterAmount: this.data.waterAmount
    };

    wx.navigateTo({
      url: `../brew-timer/brew-timer?params=${encodeURIComponent(JSON.stringify(brewParams))}`
    });
  }
}); 