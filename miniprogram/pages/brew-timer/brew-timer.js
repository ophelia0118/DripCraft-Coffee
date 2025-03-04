// brew-timer.js
Page({
  data: {
    brewParams: null,
    totalTime: '00:00',
    currentStep: 0,
    isRunning: false,
    isPaused: false,
    steps: [],
    alertEnabled: true,
    currentTime: 0, // 当前冲泡时间（秒）
    targetTotalTime: 240, // 目标总时间（秒）
    currentStepInfo: {},
    stepProgress: 0,
    progressStyle: 'conic-gradient(#d4a26a 0% 0%, rgba(255, 255, 255, 0.15) 0% 100%)' // 初始进度样式，改为咖啡金色
  },

  onLoad(options) {
    console.log('计时器页面加载', options);
    if (options.params) {
      try {
        const brewParams = JSON.parse(decodeURIComponent(options.params));
        console.log('解析的冲泡参数', brewParams);
        this.setData({ 
          brewParams,
          // 根据不同冲泡方法设置目标总时间
          targetTotalTime: this.getTargetTime(brewParams.methodName)
        });
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

  // 获取不同冲泡方法的目标总时间（秒）
  getTargetTime(methodName) {
    const methodTimes = {
      'Hario V60': 180, // 2.5-3分钟
      'Kalita Wave': 210, // 3-3.5分钟
      'Chemex': 240, // 4分钟
      'Melitta': 210, // 3-4分钟
      'Bee House': 210, // 3-4分钟
      'Kono': 210 // 3-4分钟
    };
    
    return methodTimes[methodName] || 180; // 默认3分钟
  },

  generateSteps(params) {
    // 根据不同的冲泡方法生成科学化冲泡步骤
    const methodSteps = {
      'Hario V60': [
        { 
          name: '闷蒸', 
          timeMarker: 30, 
          instruction: '使用Hario V60专用滤纸，以鹅颈壶圆形方式倒水进行预浸，释放气体', 
          waterAmount: params.coffeeAmount * 2,
          tips: '研磨度：中细，水温：96°C'
        },
        { 
          name: '第一阶段注水', 
          timeMarker: 60, 
          instruction: '以画圈方式缓慢注水，由中心向外，避免直接冲击咖啡床边缘', 
          waterAmount: params.waterAmount * 0.6,
          tips: '使用鹅颈壶以保持稳定的水流控制'
        },
        { 
          name: '第二阶段注水', 
          timeMarker: 120, 
          instruction: '等水位下降后继续注水，保持水位平稳', 
          waterAmount: params.waterAmount * 0.4,
          tips: '此时应控制总冲泡时间在2.5-3分钟范围内'
        },
        { 
          name: '等待完成', 
          timeMarker: 180, 
          instruction: '等待所有水流过咖啡粉，观察水流速度判断研磨度是否合适', 
          waterAmount: 0,
          tips: '最终时间：2.5-3分钟，强调风味层次'
        }
      ],
      'Kalita Wave': [
        { 
          name: '闷蒸', 
          timeMarker: 30, 
          instruction: '使用Kalita Wave专用滤纸，进行预浸，保持水位稳定，避免边缘倒水', 
          waterAmount: params.coffeeAmount * 2,
          tips: '研磨度：中，水温：96°C'
        },
        { 
          name: '第一阶段注水', 
          timeMarker: 75, 
          instruction: '以螺旋式方式注水，保持水位稳定，避免边缘倒水', 
          waterAmount: params.waterAmount * 0.4,
          tips: '平底设计有助于均匀萃取，保持水位稳定'
        },
        { 
          name: '第二阶段注水', 
          timeMarker: 120, 
          instruction: '保持水位稳定，继续缓慢注水', 
          waterAmount: params.waterAmount * 0.3,
          tips: '确保水流均匀通过整个咖啡床'
        },
        { 
          name: '第三阶段注水', 
          timeMarker: 165, 
          instruction: '完成剩余水量的注入', 
          waterAmount: params.waterAmount * 0.3,
          tips: '此时应控制总冲泡时间在3-3.5分钟范围内'
        },
        { 
          name: '等待完成', 
          timeMarker: 210, 
          instruction: '等待所有水流过咖啡粉', 
          waterAmount: 0,
          tips: '平底滤杯设计确保更均匀的萃取'
        }
      ],
      'Chemex': [
        { 
          name: '闷蒸', 
          timeMarker: 30, 
          instruction: '使用Chemex专用滤纸，进行预浸，等待30秒后继续，适合较大批量冲泡', 
          waterAmount: params.coffeeAmount * 2,
          tips: '研磨度：粗，水温：96°C'
        },
        { 
          name: '第一阶段注水', 
          timeMarker: 90, 
          instruction: '以画圈方式缓慢注水，保持水位稳定', 
          waterAmount: params.waterAmount * 0.4,
          tips: '厚滤纸确保萃取干净，适合较大批量冲泡'
        },
        { 
          name: '第二阶段注水', 
          timeMarker: 150, 
          instruction: '等水位下降后继续注水', 
          waterAmount: params.waterAmount * 0.3,
          tips: '保持均匀注水，避免过度搅动咖啡床'
        },
        { 
          name: '第三阶段注水', 
          timeMarker: 210, 
          instruction: '完成剩余水量的注入', 
          waterAmount: params.waterAmount * 0.3,
          tips: '控制总冲泡时间在4分钟左右'
        },
        { 
          name: '等待完成', 
          timeMarker: 240, 
          instruction: '等待所有水流过咖啡粉', 
          waterAmount: 0,
          tips: 'Chemex冲泡特点：清澈口感，突出咖啡果酸'
        }
      ],
      'Melitta': [
        { 
          name: '闷蒸', 
          timeMarker: 30, 
          instruction: '使用标准Melitta锥形滤纸，均匀倒水，预浸30秒后继续，适合小型冲泡', 
          waterAmount: params.coffeeAmount * 2,
          tips: '研磨度：中细至中，水温：93°C'
        },
        { 
          name: '第一阶段注水', 
          timeMarker: 90, 
          instruction: '均匀倒水，保持水位稳定', 
          waterAmount: params.waterAmount * 0.5,
          tips: '适合日常简单冲泡，使用标准Melitta锥形滤纸'
        },
        { 
          name: '第二阶段注水', 
          timeMarker: 150, 
          instruction: '完成剩余水量的注入', 
          waterAmount: params.waterAmount * 0.5,
          tips: '控制总冲泡时间在3-4分钟范围内'
        },
        { 
          name: '等待完成', 
          timeMarker: 210, 
          instruction: '等待所有水流过咖啡粉', 
          waterAmount: 0,
          tips: '水粉比1:17，适合小型冲泡'
        }
      ],
      'Bee House': [
        { 
          name: '闷蒸', 
          timeMarker: 30, 
          instruction: '使用标准Melitta锥形滤纸，均匀倒水，预浸后分阶段倒水', 
          waterAmount: params.coffeeAmount * 2,
          tips: '研磨度：中细，水温：93-96°C'
        },
        { 
          name: '第一阶段注水', 
          timeMarker: 90, 
          instruction: '均匀倒水，保持水位稳定', 
          waterAmount: params.waterAmount * 0.5,
          tips: '使用标准Melitta锥形滤纸，适合日常使用'
        },
        { 
          name: '第二阶段注水', 
          timeMarker: 150, 
          instruction: '完成剩余水量的注入', 
          waterAmount: params.waterAmount * 0.5,
          tips: '控制总冲泡时间在3-4分钟范围内'
        },
        { 
          name: '等待完成', 
          timeMarker: 210, 
          instruction: '等待所有水流过咖啡粉', 
          waterAmount: 0,
          tips: '水粉比1:16，平衡的风味表现'
        }
      ],
      'Kono': [
        { 
          name: '闷蒸', 
          timeMarker: 30, 
          instruction: '使用Kono专用滤纸，控制倒水速度以保持稳定滴流，预浸30秒后分阶段倒水', 
          waterAmount: params.coffeeAmount * 2,
          tips: '研磨度：中，水温：93-96°C'
        },
        { 
          name: '第一阶段注水', 
          timeMarker: 90, 
          instruction: '控制倒水速度以保持稳定滴流', 
          waterAmount: params.waterAmount * 0.4,
          tips: '使用Kono专用滤纸，确保稳定滴流'
        },
        { 
          name: '第二阶段注水', 
          timeMarker: 150, 
          instruction: '保持水位，继续缓慢注水', 
          waterAmount: params.waterAmount * 0.3,
          tips: '注重稳定的滴流速度'
        },
        { 
          name: '第三阶段注水', 
          timeMarker: 180, 
          instruction: '完成剩余水量的注入', 
          waterAmount: params.waterAmount * 0.3,
          tips: '控制总冲泡时间在3-4分钟范围内'
        },
        { 
          name: '等待完成', 
          timeMarker: 210, 
          instruction: '等待所有水流过咖啡粉', 
          waterAmount: 0,
          tips: '水粉比1:16，与V60相似但更稳定的萃取'
        }
      ]
    };

    // 使用默认步骤（如果没有特定方法的步骤）
    let steps = [
      { 
        name: '闷蒸', 
        timeMarker: 30, 
        instruction: '均匀浇水形成咖啡床，等待咖啡释放气体', 
        waterAmount: params.coffeeAmount * 2,
        tips: '标准闷蒸时间30秒，水量为咖啡粉重量的2倍'
      },
      { 
        name: '第一阶段注水', 
        timeMarker: 90, 
        instruction: '以画圈方式缓慢注水', 
        waterAmount: params.waterAmount * 0.5,
        tips: '控制水流速度和注水节奏'
      },
      { 
        name: '第二阶段注水', 
        timeMarker: 150, 
        instruction: '完成剩余水量的注入', 
        waterAmount: params.waterAmount * 0.5,
        tips: '确保水均匀通过咖啡床'
      },
      { 
        name: '等待完成', 
        timeMarker: 210, 
        instruction: '等待所有水流过咖啡粉', 
        waterAmount: 0,
        tips: '观察滴流速度判断研磨度是否合适'
      }
    ];

    // 如果有特定的步骤，则使用它
    if (methodSteps[params.methodName]) {
      steps = methodSteps[params.methodName];
    }

    this.setData({ 
      steps,
      currentStepInfo: steps[0]
    });
  },

  startTimer() {
    if (!this.data.isRunning) {
      this.setData({ 
        isRunning: true,
        isPaused: false
      });
      this.runTimer();
    } else if (this.data.isPaused) {
      this.setData({ isPaused: false });
      this.runTimer();
    }
  },

  pauseTimer() {
    this.setData({ isPaused: true });
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },

  toggleTimer() {
    console.log('切换计时器状态');
    if (this.data.isRunning && !this.data.isPaused) {
      // 当前正在运行，切换到暂停
      this.pauseTimer();
    } else {
      // 当前未运行或已暂停，切换到开始
      this.startTimer();
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
      currentTime: 0,
      totalTime: '00:00',
      currentStepInfo: this.data.steps[0]
    });
  },

  runTimer() {
    // 正向计时器
    const updateTimer = () => {
      if (this.data.isPaused) return;

      const currentTime = this.data.currentTime + 1;
      
      // 更新总时间显示
      const minutes = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // 检查是否需要更新当前步骤
      const { steps, currentStep } = this.data;
      let newStep = currentStep;
      
      // 检查是否到达下一个步骤的时间点
      for (let i = 0; i < steps.length; i++) {
        if (currentTime <= steps[i].timeMarker) {
          if (newStep !== i) {
            newStep = i;
            // 如果启用了震动提醒，在步骤变化时震动
            if (this.data.alertEnabled) {
              console.log('步骤变化触发震动');
              wx.vibrateLong({
                success: function() {
                  console.log('震动触发成功');
                },
                fail: function(err) {
                  console.error('震动触发失败:', err);
                }
              });
            }
          }
          break;
        }
      }
      
      // 检查是否超过最后一个步骤的时间
      if (currentTime > steps[steps.length - 1].timeMarker) {
        if (currentTime >= this.data.targetTotalTime) {
          // 达到目标总时间，完成冲泡
          this.completeBrewProcess();
          return;
        }
        newStep = steps.length - 1; // 保持在最后一个步骤
      }
      
      // 计算进度百分比并转换为CSS样式
      const progress = this.calculateStepProgress(currentTime, newStep);
      const progressStyle = `conic-gradient(#d4a26a 0% ${progress}%, rgba(255, 255, 255, 0.15) ${progress}% 100%)`;
      
      // 更新数据
      this.setData({
        currentTime,
        totalTime: formattedTime,
        currentStep: newStep,
        currentStepInfo: steps[newStep],
        // 计算当前步骤的进度百分比
        stepProgress: progress,
        // 添加进度条样式
        progressStyle: progressStyle
      });
      
      // 继续计时
      this.timer = setTimeout(updateTimer, 1000);
    };

    // 开始计时
    updateTimer();
  },
  
  // 计算当前步骤的进度百分比
  calculateStepProgress(currentTime, stepIndex) {
    const { steps } = this.data;
    
    // 计算总体进度百分比（针对圆环进度条）
    const totalProgress = (currentTime / this.data.targetTotalTime) * 100;
    
    // 当前步骤信息
    const currentStep = steps[stepIndex];
    
    // 计算当前步骤已经过去的时间
    const prevStepTime = stepIndex > 0 ? steps[stepIndex - 1].timeMarker : 0;
    const elapsedInStep = currentTime - prevStepTime;
    
    // 当前步骤的总时间
    const stepTotalTime = currentStep.timeMarker - prevStepTime;
    
    // 返回总体进度百分比 (用于圆环进度条)
    return totalProgress;
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  toggleAlert() {
    console.log('切换震动提醒状态');
    const newAlertState = !this.data.alertEnabled;
    
    this.setData({
      alertEnabled: newAlertState
    });
    
    // 在切换到开启状态时，提供一个短震动作为反馈
    if (newAlertState) {
      console.log('尝试触发测试震动');
      wx.vibrateShort({
        type: 'medium',
        success: function() {
          console.log('测试震动成功');
        },
        fail: function(err) {
          console.error('测试震动失败:', err);
        }
      });
    }
    
    wx.showToast({
      title: newAlertState ? '震动提醒已开启' : '震动提醒已关闭',
      icon: 'none',
      duration: 1500
    });
  },

  completeBrewProcess() {
    this.setData({
      isRunning: false
    });
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    // 显示完成提示
    wx.showToast({
      title: '冲泡完成!',
      icon: 'success',
      duration: 2000
    });
    
    // 震动提醒冲泡完成
    if (this.data.alertEnabled) {
      console.log('冲泡完成触发震动');
      wx.vibrateLong({
        success: function() {
          console.log('冲泡完成震动1触发成功');
        },
        fail: function(err) {
          console.error('冲泡完成震动1触发失败:', err);
        }
      });
      setTimeout(() => {
        wx.vibrateLong({
          success: function() {
            console.log('冲泡完成震动2触发成功');
          },
          fail: function(err) {
            console.error('冲泡完成震动2触发失败:', err);
          }
        });
      }, 1000);
    }
    
    // 可以跳转到完成页面
    setTimeout(() => {
      wx.navigateBack();
    }, 2000);
  },

  goBack() {
    wx.navigateBack();
  }
}); 