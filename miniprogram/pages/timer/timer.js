Page({
  data: {
    minutes: '00',
    seconds: '15',
    milliseconds: '02',
    isRunning: false,
    isPaused: false,
    startTime: 0,
    elapsedTime: 0,
    intervalId: null,
    progressDegree: 90,
    maxBrewTime: 3 * 60 * 1000,
    notificationEnabled: true,
    brewMethod: 'Kalita Wave',
    brewMethodDesc: '(平底滤杯)'
  },

  onLoad: function(options) {
    // 如果从其他页面传入了冲泡方法信息
    if (options.method) {
      this.setData({
        brewMethod: options.method
      });
    }
    
    if (options.desc) {
      this.setData({
        brewMethodDesc: options.desc
      });
    }
  },

  toggleTimer: function() {
    if (this.data.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer: function() {
    const initialTime = 15 * 1000 + 20;
    const startTime = Date.now() - (this.data.elapsedTime || initialTime);
    
    this.setData({
      isRunning: true,
      isPaused: false,
      startTime: startTime
    });
    
    this.intervalId = setInterval(() => {
      const elapsedTime = Date.now() - this.data.startTime;
      this.updateTimer(elapsedTime);
    }, 10);
  },

  pauseTimer: function() {
    clearInterval(this.intervalId);
    this.setData({
      isRunning: false,
      isPaused: true,
      elapsedTime: Date.now() - this.data.startTime
    });
  },

  resetTimer: function() {
    clearInterval(this.intervalId);
    this.setData({
      minutes: '00',
      seconds: '15',
      milliseconds: '02',
      isRunning: false,
      isPaused: false,
      elapsedTime: 0,
      progressDegree: 90
    });
  },

  updateTimer: function(elapsedTime) {
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);
    
    // 计算进度环的旋转角度 (0-360度)
    const progress = Math.min(elapsedTime / this.data.maxBrewTime, 1);
    const progressDegree = progress * 360;
    
    this.setData({
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0'),
      progressDegree: progressDegree
    });
  },

  toggleNotification: function() {
    this.setData({
      notificationEnabled: !this.data.notificationEnabled
    });
    
    wx.showToast({
      title: this.data.notificationEnabled ? '已开启提醒' : '已关闭提醒',
      icon: 'none',
      duration: 1500
    });
  },

  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  onHide: function() {
    if (this.data.isRunning) {
      this.pauseTimer();
    }
  },

  onUnload: function() {
    clearInterval(this.intervalId);
  }
}); 