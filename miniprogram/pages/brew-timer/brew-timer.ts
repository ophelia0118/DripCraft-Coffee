// brew-timer.ts
Page({
  data: {
    brewParams: {
      methodName: '',
      methodDesc: '',
      methodImage: '',
      coffeeAmount: 0,
      waterTemp: 0,
      grindSize: '',
      waterRatio: '',
      waterAmount: 0
    },
    startTime: 0,
    currentTime: 0,
    timerInterval: null as any,
    isRunning: false,
    displayTime: '00:00:00',
    alertEnabled: true
  },

  onLoad(options: any) {
    if (options.params) {
      const brewParams = JSON.parse(decodeURIComponent(options.params));
      this.setData({ brewParams });
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: `${brewParams.methodName} ${brewParams.methodDesc}`
      });
    }
  },

  onUnload() {
    this.clearTimerInterval();
  },

  toggleTimer() {
    if (this.data.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    if (!this.data.isRunning) {
      const now = new Date().getTime();
      const startTime = this.data.startTime || now;
      
      if (!this.data.startTime) {
        this.setData({ startTime });
      }
      
      this.setData({ isRunning: true });
      
      const timerInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        this.updateDisplayTime(elapsedTime);
        
        this.checkAndNotifySteps(elapsedTime);
      }, 100);
      
      this.setData({ timerInterval });
    }
  },

  pauseTimer() {
    if (this.data.isRunning) {
      this.clearTimerInterval();
      this.setData({ isRunning: false });
    }
  },

  resetTimer() {
    this.clearTimerInterval();
    this.setData({
      startTime: 0,
      currentTime: 0,
      isRunning: false,
      displayTime: '00:00:00'
    });
  },

  clearTimerInterval() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({ timerInterval: null });
    }
  },

  updateDisplayTime(elapsedTime: number) {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);
    
    const displayTime = `${this.padNumber(minutes)}:${this.padNumber(seconds)}:${this.padNumber(milliseconds)}`;
    this.setData({ displayTime });
  },

  padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  },

  toggleAlert() {
    this.setData({ alertEnabled: !this.data.alertEnabled });
    if (this.data.alertEnabled) {
      wx.showToast({
        title: '震动提醒已开启',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '震动提醒已关闭',
        icon: 'none',
        duration: 1500
      });
    }
  },

  checkAndNotifySteps(elapsedTime: number) {
    // 预设步骤时间点（毫秒）
    const steps = [
      { time: 10000, message: '开始加水' },
      { time: 30000, message: '第一次注水完成' },
      { time: 60000, message: '继续注水' },
      { time: 90000, message: '最后冲泡' }
    ];
    
    const totalSeconds = Math.floor(elapsedTime / 1000);
    
    steps.forEach(step => {
      const stepSeconds = Math.floor(step.time / 1000);
      if (totalSeconds === stepSeconds) {
        this.notifyStep(step.message);
      }
    });
  },

  notifyStep(message: string) {
    if (this.data.alertEnabled) {
      wx.vibrateLong({
        success: () => {
          wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  },

  // 冲泡完成
  finishBrewing() {
    this.pauseTimer();
    
    wx.navigateTo({
      url: '../brew-result/brew-result'
    });
  }
}); 