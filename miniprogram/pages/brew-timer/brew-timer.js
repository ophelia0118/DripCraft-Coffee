// brew-timer.js
Page({
  data: {
    brewParams: null,
    totalTime: '00:00',
    currentStep: 0,
    isRunning: false,
    isPaused: false,
    steps: [],
    currentTime: 0, // 当前冲泡时间（秒）
    targetTotalTime: 240, // 目标总时间（秒）
    currentStepInfo: {},
    stepProgress: 0,
    progressStyle: 'conic-gradient(rgba(169, 115, 66, 0.5) 0% 0%, transparent 0% 100%)', // 深咖啡色进度样式
    showSaveModal: false,
    // 输入对话框相关数据
    showInputDialog: false,
    dialogInputValue: ''
  },

  onLoad(options) {
    console.log('计时器页面加载', options);
    if (options.params) {
      try {
        const brewParams = JSON.parse(decodeURIComponent(options.params));
        console.log('解析的冲泡参数', brewParams);
        
        // 确保水粉比有正确的值
        if (!brewParams.waterRatio || brewParams.waterRatio === 'undefined') {
          // 使用默认值或根据咖啡量和水量计算
          const waterAmount = parseInt(brewParams.waterAmount);
          const coffeeAmount = parseFloat(brewParams.coffeeAmount);
          if (waterAmount && coffeeAmount && coffeeAmount > 0) {
            const ratio = Math.round(waterAmount / coffeeAmount);
            brewParams.waterRatio = `1:${ratio}`;
          } else {
            brewParams.waterRatio = '1:16'; // 默认值
          }
        }
        
        this.setData({ 
          brewParams,
          // 根据不同冲泡方法和咖啡粉量设置目标总时间
          targetTotalTime: this.getTargetTime(brewParams.methodName, brewParams.coffeeAmount)
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
  getTargetTime(methodName, coffeeAmount) {
    // 基准咖啡粉量（20g）对应的标准时间
    const standardCoffeeAmount = 20;
    const baseMethodTimes = {
      'Hario V60': 180, // 2.5-3分钟
      'Kalita Wave': 210, // 3-3.5分钟
      'Chemex': 240, // 4分钟
      'Melitta': 210, // 3-4分钟
      'Bee House': 210, // 3-4分钟
      'Kono': 210 // 3-4分钟
    };
    
    // 获取该方法的基准时间
    const baseTime = baseMethodTimes[methodName] || 180; // 默认3分钟
    
    // 根据咖啡粉量调整时间，使用平方根比例，避免线性调整导致时间变化过大
    // 例如，咖啡粉量从20g减少到10g，时间不应减半，而是减少约30%
    const timeRatio = Math.sqrt(coffeeAmount / standardCoffeeAmount);
    
    // 计算调整后的时间，并设置上下限
    let adjustedTime = Math.round(baseTime * timeRatio);
    
    // 设置最小和最大时间限制，避免极端值
    const minTime = Math.round(baseTime * 0.7); // 最小不低于基准的70%
    const maxTime = Math.round(baseTime * 1.3); // 最大不超过基准的130%
    
    // 确保时间在合理范围内
    adjustedTime = Math.max(minTime, Math.min(adjustedTime, maxTime));
    
    console.log(`冲泡时间计算：方法=${methodName}, 咖啡量=${coffeeAmount}g, 基准时间=${baseTime}秒, 调整后=${adjustedTime}秒`);
    
    return adjustedTime;
  },

  generateSteps(params) {
    // 计算基本参数
    const totalWater = params.waterAmount; // 总水量
    const targetTime = this.data.targetTotalTime; // 获取动态计算后的目标总时间
    console.log('用户设置的总水量:', totalWater, '目标总时间:', targetTime);
    
    // 各方法的标准步骤和比例
    const methodStepsTemplates = {
      'Hario V60': [
        { 
          name: '闷蒸', 
          timeRatio: 0.167, // 30/180 = 0.167
          instruction: '使用Hario V60专用滤纸，以鹅颈壶圆形方式倒水进行预浸，释放气体', 
          waterPercent: 0.125, // 47/375 = 0.125
          tips: '研磨度：中细，水温：93°C'
        },
        { 
          name: '第一阶段注水', 
          timeRatio: 0.333, // 60/180 = 0.333
          instruction: '以画圈方式缓慢注水，由中心向外，避免直接冲击咖啡床边缘', 
          waterPercent: 0.438, // 164/375 = 0.438
          tips: '使用鹅颈壶以保持稳定的水流控制'
        },
        { 
          name: '第二阶段注水', 
          timeRatio: 0.5, // 90/180 = 0.5
          instruction: '等水位下降后继续注水，保持水位平稳', 
          waterPercent: 0.75, // 281/375 = 0.75
          tips: '此时应控制总冲泡时间在2.5-3分钟范围内'
        },
        { 
          name: '第三阶段注水', 
          timeRatio: 0.833, // 150/180 = 0.833
          instruction: '完成剩余水量的注入', 
          waterPercent: 1.0, // 375/375 = 1.0
          tips: '控制流速，确保均匀萃取'
        },
        { 
          name: '等待完成', 
          timeRatio: 1.0, // 180/180 = 1.0
          instruction: '等待所有水流过咖啡粉，观察水流速度判断研磨度是否合适', 
          waterPercent: 1.0, // 保持总量不变
          tips: '水粉比1:15，研磨度中细，水温93°C'
        }
      ],
      'Kalita Wave': [
        { 
          name: '闷蒸', 
          timeRatio: 0.143, // 30/210 = 0.143
          instruction: '使用Kalita Wave专用滤纸，进行预浸，保持水位稳定，避免边缘倒水', 
          waterPercent: 0.156, // 62/400 = 0.155
          tips: '研磨度：中细，水温：94°C'
        },
        { 
          name: '第一阶段注水', 
          timeRatio: 0.429, // 90/210 = 0.429
          instruction: '以螺旋式方式注水，保持水位稳定，避免边缘倒水', 
          waterPercent: 0.625, // 250/400 = 0.625
          tips: '平底设计有助于均匀萃取，保持水位稳定'
        },
        { 
          name: '第二阶段注水', 
          timeRatio: 1.0, // 210/210 = 1.0
          instruction: '完成剩余水量的注入', 
          waterPercent: 1.0, // 400/400 = 1.0
          tips: '确保水流均匀通过整个咖啡床'
        },
        { 
          name: '等待完成', 
          timeRatio: 1.0, // 210/210 = 1.0
          instruction: '等待所有水流过咖啡粉', 
          waterPercent: 1.0, // 保持总量不变
          tips: '水粉比1:16，研磨度中细，水温94°C'
        }
      ],
      'Chemex': [
        { 
          name: '闷蒸', 
          timeRatio: 0.125, // 30/240 = 0.125
          instruction: '使用Chemex专用滤纸，进行预浸，等待30秒后继续，适合较大批量冲泡', 
          waterPercent: 0.133, // 93/700 = 0.133
          tips: '研磨度：中粗，水温：96°C'
        },
        { 
          name: '第一阶段注水', 
          timeRatio: 0.5, // 120/240 = 0.5
          instruction: '以画圈方式缓慢注水，保持水位稳定', 
          waterPercent: 0.633, // 443/700 = 0.633
          tips: '厚滤纸确保萃取干净，适合较大批量冲泡'
        },
        { 
          name: '第二阶段注水', 
          timeRatio: 1.0, // 240/240 = 1.0
          instruction: '完成剩余水量的注入', 
          waterPercent: 1.0, // 700/700 = 1.0
          tips: '控制总冲泡时间在4分钟左右'
        },
        { 
          name: '等待完成', 
          timeRatio: 1.0, // 240/240 = 1.0
          instruction: '等待所有水流过咖啡粉', 
          waterPercent: 1.0, // 保持总量不变
          tips: '水粉比1:17，研磨度中粗，水温96°C'
        }
      ],
      'Melitta': [
        { 
          name: '闷蒸', 
          timeRatio: 0.125, // 30/240 = 0.125
          instruction: '使用标准Melitta锥形滤纸，均匀倒水，预浸30秒后继续，适合小型冲泡', 
          waterPercent: 0.118, // 47/400 = 0.118
          tips: '研磨度：中细，水温：93°C'
        },
        { 
          name: '第一阶段注水', 
          timeRatio: 0.5, // 120/240 = 0.5
          instruction: '均匀倒水，保持水位稳定', 
          waterPercent: 0.559, // 223/400 = 0.559
          tips: '适合日常简单冲泡，使用标准Melitta锥形滤纸'
        },
        { 
          name: '第二阶段注水', 
          timeRatio: 1.0, // 240/240 = 1.0
          instruction: '完成剩余水量的注入', 
          waterPercent: 1.0, // 400/400 = 1.0
          tips: '控制总冲泡时间在3-4分钟范围内'
        },
        { 
          name: '等待完成', 
          timeRatio: 1.0, // 240/240 = 1.0
          instruction: '等待所有水流过咖啡粉', 
          waterPercent: 1.0, // 保持总量不变
          tips: '水粉比1:17，研磨度中细，水温93°C'
        }
      ],
      'Bee House': [
        { 
          name: '闷蒸', 
          timeRatio: 0.125, // 30/240 = 0.125
          instruction: '使用标准Melitta锥形滤纸，均匀倒水，预浸后分阶段倒水', 
          waterPercent: 0.156, // 59/380 = 0.156
          tips: '研磨度：中细，水温：96°C'
        },
        { 
          name: '第一阶段注水', 
          timeRatio: 0.375, // 90/240 = 0.375
          instruction: '均匀倒水，保持水位稳定', 
          waterPercent: 0.625, // 237/380 = 0.625
          tips: '使用标准Melitta锥形滤纸，适合日常使用'
        },
        { 
          name: '第二阶段注水', 
          timeRatio: 0.875, // 210/240 = 0.875
          instruction: '完成剩余水量的注入', 
          waterPercent: 1.0, // 380/380 = 1.0
          tips: '控制总冲泡时间在3-4分钟范围内'
        },
        { 
          name: '等待完成', 
          timeRatio: 1.0, // 240/240 = 1.0
          instruction: '等待所有水流过咖啡粉', 
          waterPercent: 1.0, // 保持总量不变
          tips: '水粉比1:18，研磨度中细，水温96°C'
        }
      ],
      'Kono': [
        { 
          name: '闷蒸', 
          timeRatio: 0.125, // 30/240 = 0.125
          instruction: '使用Kono专用滤纸，控制倒水速度以保持稳定滴流，预浸30秒后分阶段倒水', 
          waterPercent: 0.156, // 30/192 = 0.156
          tips: '研磨度：中细，水温：93°C'
        },
        { 
          name: '第一阶段注水', 
          timeRatio: 0.375, // 90/240 = 0.375
          instruction: '以螺旋方式均匀倒水，保持水位稳定', 
          waterPercent: 0.625, // 120/192 = 0.625
          tips: '类似其他锥形滤杯，强调稳定滴流'
        },
        { 
          name: '第二阶段注水', 
          timeRatio: 0.875, // 210/240 = 0.875
          instruction: '完成剩余水量的注入', 
          waterPercent: 1.0, // 192/192 = 1.0
          tips: '控制总冲泡时间在3-4分钟范围内'
        },
        { 
          name: '等待完成', 
          timeRatio: 1.0, // 240/240 = 1.0
          instruction: '等待所有水流过咖啡粉', 
          waterPercent: 1.0, // 保持总量不变
          tips: '水粉比1:16，研磨度中细，水温93°C'
        }
      ]
    };
    
    // 使用模板生成动态水量和时间的步骤
    let stepsTemplate = methodStepsTemplates[params.methodName] || methodStepsTemplates['Hario V60'];
    let steps = stepsTemplate.map(step => {
      // 根据用户设置的总水量计算每个步骤的实际水量
      const actualWaterAmount = Math.round(step.waterPercent * totalWater);
      // 根据目标总时间和时间比例计算每个步骤的实际时间点
      const timeMarker = Math.round(step.timeRatio * targetTime);
      
      return {
        ...step,
        waterAmount: actualWaterAmount,
        timeMarker: timeMarker
      };
    });
    
    // 设置步骤和初始当前步骤信息
    this.setData({
      steps: steps,
      currentStepInfo: steps[0]
    });
    
    console.log('根据用户水量和时间生成的冲泡步骤:', steps);
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
    console.log('暂停计时器');
    this.setData({
      isRunning: false
    });
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },

  toggleTimer() {
    console.log('切换计时器状态, 当前isRunning:', this.data.isRunning);
    if (this.data.isRunning) {
      this.pauseTimer();
    } else {
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
      currentStepInfo: this.data.steps[0],
      stepProgress: 0,
      progressStyle: 'conic-gradient(rgba(169, 115, 66, 0.5) 0% 0%, transparent 0% 100%)'
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
            // 步骤变化时强制震动提醒
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
          break;
        }
      }
      
      // 检查是否超过最后一个步骤的时间
      if (currentTime > steps[steps.length - 1].timeMarker) {
        if (currentTime >= this.data.targetTotalTime) {
          // 达到目标总时间，完成冲泡
          this.onTimerFinish();
          return;
        }
        newStep = steps.length - 1; // 保持在最后一个步骤
      }
      
      // 计算进度百分比并转换为CSS样式
      const progress = this.calculateStepProgress(currentTime, newStep);
      const progressStyle = `conic-gradient(rgba(169, 115, 66, 0.5) 0% ${progress}%, transparent ${progress}% 100%)`;
      
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

  onTimerFinish() {
    this.setData({
      isRunning: false
    });
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    // 冲泡完成强制震动提醒
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
    
    // 显示保存数据的模态窗口，而不是直接返回
    this.setData({
      showSaveModal: true
    });
  },
  
  // 保存冲泡数据
  saveBrewData: function() {
    // 获取当前冲泡数据
    const brewParams = this.data.brewParams;
    
    // 解析水量和咖啡粉量
    const waterAmount = parseInt(brewParams.waterAmount);
    const coffeeAmount = parseFloat(brewParams.coffeeAmount);
    
    // 直接计算水粉比的数值部分（不含"1:"前缀）
    let ratio;
    if (waterAmount && coffeeAmount && coffeeAmount > 0) {
      ratio = Math.round(waterAmount / coffeeAmount);
    } else {
      ratio = 15; // 默认值
    }
    
    const brewData = {
      date: new Date().toISOString(),
      coffeeType: brewParams.methodName + ' ' + brewParams.methodDesc,
      coffeeWeight: brewParams.coffeeAmount,
      waterWeight: brewParams.waterAmount,
      ratio: ratio, // 只保存比例数字部分
      time: this.data.totalTime,
      waterTemp: brewParams.waterTemp,
      grindSize: brewParams.grindSize
    };
    
    // 获取已保存的数据
    let coffeeRecords = wx.getStorageSync('coffeeRecords') || [];
    
    // 添加新数据
    coffeeRecords.unshift(brewData);
    
    // 保存回本地存储
    wx.setStorageSync('coffeeRecords', coffeeRecords);
    
    // 显示保存成功提示
    wx.showToast({
      title: '冲泡数据已保存!',
      icon: 'success',
      duration: 1500
    });
    
    // 关闭模态窗口并返回上一页
    this.setData({
      showSaveModal: false
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  // 不保存数据，直接返回
  cancelSave: function() {
    this.setData({
      showSaveModal: false
    });
    wx.navigateBack();
  },

  goBack() {
    wx.navigateBack();
  },

  // 显示保存数据模态窗口
  showSaveDataModal() {
    this.setData({
      showSaveModal: true
    });
  },

  // 减少咖啡粉量
  decreaseCoffeeAmount() {
    if (this.data.brewParams.coffeeAmount > 5) {
      const newAmount = parseFloat((this.data.brewParams.coffeeAmount - 0.5).toFixed(1));
      this.updateCoffeeAmount(newAmount);
    }
  },

  // 增加咖啡粉量
  increaseCoffeeAmount() {
    if (this.data.brewParams.coffeeAmount < 50) {
      const newAmount = parseFloat((this.data.brewParams.coffeeAmount + 0.5).toFixed(1));
      this.updateCoffeeAmount(newAmount);
    }
  },

  // 显示咖啡粉量输入对话框
  showCoffeeInputDialog() {
    this.setData({
      showInputDialog: true,
      dialogInputValue: this.data.brewParams.coffeeAmount.toString()
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

    // 检查咖啡粉量范围
    if (value < 5 || value > 50) {
      wx.showToast({
        title: '咖啡粉量应在5-50g之间',
        icon: 'none'
      });
      return;
    }
    
    this.updateCoffeeAmount(parseFloat(value.toFixed(1)));
    this.closeInputDialog();
  },

  // 更新咖啡粉量并重新计算水量
  updateCoffeeAmount(newAmount) {
    // 获取当前水粉比
    const ratioStr = this.data.brewParams.waterRatio;
    let ratio;
    
    // 处理不同格式的水粉比
    if (typeof ratioStr === 'string' && ratioStr.includes(':')) {
      // 如果是"1:15"格式
      ratio = parseInt(ratioStr.split(':')[1]);
    } else if (typeof ratioStr === 'number') {
      // 如果已经是数字
      ratio = ratioStr;
    } else {
      // 默认值
      ratio = 15;
    }
    
    // 计算新的水量
    const newWaterAmount = Math.round(newAmount * ratio);
    
    // 更新数据
    const brewParams = this.data.brewParams;
    brewParams.coffeeAmount = newAmount;
    brewParams.waterAmount = newWaterAmount + 'ml';
    // 确保水粉比显示正确
    brewParams.waterRatio = `1:${ratio}`;
    
    this.setData({
      brewParams: brewParams,
      // 更新目标总时间
      targetTotalTime: this.getTargetTime(brewParams.methodName, newAmount)
    });
    
    // 重新生成步骤
    this.generateSteps(brewParams);
    
    // 如果计时器正在运行，提示用户
    if (this.data.isRunning) {
      wx.showToast({
        title: '已更新参数，但请注意计时器已开始',
        icon: 'none',
        duration: 2000
      });
    }
  }
}); 