// brew-timer.js
Page({
  data: {
    brewParams: null,
    totalTime: '00:00',
    currentStep: 0,
    isRunning: false,
    isPaused: false,
    steps: []
  },

  onLoad(options) {
    console.log('计时器页面加载', options);
    if (options.params) {
      try {
        const brewParams = JSON.parse(decodeURIComponent(options.params));
        console.log('解析的冲泡参数', brewParams);
        this.setData({ brewParams });
        this.generateSteps(brewParams);
      } catch (error) {
        console.error('解析参数失败', error);
        wx.showToast({
          title: '参数解析失败',
          icon: 'none'
        });
      }
    }
  },

  generateSteps(params) {
    // 根据不同的冲泡方法生成冲泡步骤
    const methodSteps = {
      'hario-v60': [
        { name: '预热滤纸', time: 30, instruction: '用热水冲洗滤纸并预热器具', waterAmount: 0 },
        { name: '闷蒸', time: 30, instruction: '均匀浇水形成咖啡床，等待咖啡释放气体', waterAmount: params.coffeeAmount * 2 },
        { name: '第一次注水', time: 30, instruction: '以画圈方式缓慢注水', waterAmount: params.waterAmount * 0.6 },
        { name: '第二次注水', time: 30, instruction: '等水位下降后继续注水', waterAmount: params.waterAmount * 0.4 },
        { name: '等待滤完', time: 30, instruction: '等待所有水流过咖啡粉', waterAmount: 0 }
      ],
      'kalita-wave': [
        { name: '预热滤纸', time: 30, instruction: '用热水冲洗滤纸并预热器具', waterAmount: 0 },
        { name: '闷蒸', time: 30, instruction: '均匀浇水形成咖啡床，等待咖啡释放气体', waterAmount: params.coffeeAmount * 2 },
        { name: '第一次注水', time: 45, instruction: '以画圈方式缓慢注水', waterAmount: params.waterAmount * 0.4 },
        { name: '第二次注水', time: 45, instruction: '保持水位，继续缓慢注水', waterAmount: params.waterAmount * 0.3 },
        { name: '第三次注水', time: 45, instruction: '完成剩余水量的注入', waterAmount: params.waterAmount * 0.3 },
        { name: '等待滤完', time: 60, instruction: '等待所有水流过咖啡粉', waterAmount: 0 }
      ]
    };

    // 使用默认步骤
    let steps = [
      { name: '预热滤纸', time: 30, instruction: '用热水冲洗滤纸并预热器具', waterAmount: 0 },
      { name: '闷蒸', time: 30, instruction: '均匀浇水形成咖啡床，等待咖啡释放气体', waterAmount: params.coffeeAmount * 2 },
      { name: '第一次注水', time: 30, instruction: '以画圈方式缓慢注水', waterAmount: params.waterAmount * 0.5 },
      { name: '第二次注水', time: 30, instruction: '等水位下降后继续注水', waterAmount: params.waterAmount * 0.5 },
      { name: '等待滤完', time: 30, instruction: '等待所有水流过咖啡粉', waterAmount: 0 }
    ];

    // 如果有特定的步骤，则使用它
    if (params.methodName === 'Hario V60' && methodSteps['hario-v60']) {
      steps = methodSteps['hario-v60'];
    } else if (params.methodName === 'Kalita Wave' && methodSteps['kalita-wave']) {
      steps = methodSteps['kalita-wave'];
    }

    this.setData({ steps });
  },

  startTimer() {
    if (!this.data.isRunning) {
      this.setData({ 
        isRunning: true,
        isPaused: false
      });
      this.runStep();
    } else if (this.data.isPaused) {
      this.setData({ isPaused: false });
      this.runStep();
    }
  },

  pauseTimer() {
    this.setData({ isPaused: true });
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.setData({
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      totalTime: '00:00'
    });
  },

  runStep() {
    const { currentStep, steps } = this.data;
    if (currentStep >= steps.length) {
      this.completeBrewProcess();
      return;
    }

    const step = steps[currentStep];
    let remainingSeconds = step.time;
    let totalSeconds = 0;

    // 更新显示
    const updateTimer = () => {
      if (this.data.isPaused) return;

      remainingSeconds--;
      totalSeconds++;

      // 更新总时间
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      this.setData({
        totalTime: formattedTime
      });

      if (remainingSeconds <= 0) {
        // 步骤完成，进入下一步
        this.setData({
          currentStep: this.data.currentStep + 1
        });
        this.runStep();
      } else {
        // 继续当前步骤
        this.timer = setTimeout(updateTimer, 1000);
      }
    };

    // 开始计时
    updateTimer();
  },

  completeBrewProcess() {
    this.setData({
      isRunning: false
    });
    
    // 显示完成提示
    wx.showToast({
      title: '冲泡完成!',
      icon: 'success',
      duration: 2000
    });
    
    // 可以跳转到完成页面
    setTimeout(() => {
      wx.navigateTo({
        url: '../index/index'
      });
    }, 2000);
  },

  goBack() {
    wx.navigateBack();
  }
}); 