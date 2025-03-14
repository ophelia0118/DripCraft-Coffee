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
    progressStyle: 'conic-gradient(rgba(169, 115, 66, 0.5) 0% 0%, transparent 0% 100%)', // 咖啡色进度样式
    showSaveModal: false,
    // 输入对话框相关数据
    showInputDialog: false,
    dialogInputValue: '',
    inputError: '',
    
    // 新增: 步骤状态相关
    stepPhase: 'active', // 可能的值: 'active', 'pending', 'preparing'
    isPreNotified: false, // 是否已经发出预告通知
    autoExtendMode: true, // 是否启用智能延时模式
    notificationEnabled: true, // 是否启用语音通知
    isProfessionalMode: false,  // 是否专业模式
    showTimeCustomizeModal: false,  // 是否显示时间自定义弹窗
    customTimeRatios: {},  // 自定义的步骤时间比例
    stepSeconds: []  // 存储每个步骤的秒数，用于显示和输入
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
        
        // 设置页面标题为冲泡方法
        wx.setNavigationBarTitle({
          title: `${brewParams.methodName} ${brewParams.methodDesc}`
        });
        
        // 读取专业模式设置
        const isProfessionalMode = wx.getStorageSync('isProfessionalMode') || false;
        
        // 读取保存的自定义时间比例
        const customTimeRatios = wx.getStorageSync(`customTimeRatios_${brewParams.methodName}`) || {};
        
        this.setData({
          brewParams,
          isProfessionalMode,
          customTimeRatios,
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
      'Hario V60': 165, // 2.5-3分钟 (平均2:45 = 165秒)
      'Kalita Wave': 210, // 3-3.5分钟
      'Chemex': 240, // 4分钟
      'Melitta': 210, // 3-4分钟
      'Bee House': 165, // 2:30-3:00 (平均2:45 = 165秒)
      'Kono': 150 // 2:20-2:40 (平均2:30 = 150秒)
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

  // 修改: 生成步骤函数 - 支持自定义时间比例
  generateSteps(params) {
    // 计算基本参数
    const totalWater = parseInt(params.waterAmount); // 总水量
    const targetTime = this.data.targetTotalTime; // 获取动态计算后的目标总时间
    console.log('用户设置的总水量:', totalWater, '目标总时间:', targetTime);
    
    // 各方法的标准步骤和比例
    const methodStepsTemplates = {
      'Hario V60': [
        { name: '闷蒸(Bloom)', waterRatio: 0.15, timeRatio: 0.27, instruction: '', tips: '倒入少量热水浸润咖啡粉，等待咖啡粉释放气体' },
        { name: '第一段注水', waterRatio: 0.40, timeRatio: 0.21, instruction: '', tips: '以画圈方式由内向外缓慢注水' },
        { name: '第二段注水', waterRatio: 0.70, timeRatio: 0.24, instruction: '', tips: '继续保持水位稳定，避免咖啡床干燥' },
        { name: '第三段注水', waterRatio: 1.00, timeRatio: 0.28, instruction: '', tips: '完成最后注水，等待萃取完成' },
      ],
      // ... 其他滤杯模板保持不变
      'Kalita Wave': [
        { name: '闷蒸', waterRatio: 0.2, timeRatio: 0.15, instruction: '', tips: '让咖啡粉充分膨胀并释放二氧化碳' },
        { name: '第一次注水', waterRatio: 0.33, timeRatio: 0.15, instruction: '', tips: '保持水位稳定，避免边缘倒水' },
        { name: '第二次注水', waterRatio: 0.67, timeRatio: 0.2, instruction: '', tips: '保持水位稳定，注意水温' },
        { name: '第三次注水', waterRatio: 1.00, timeRatio: 0.2, instruction: '', tips: '确保注水均匀覆盖咖啡床' },
        { name: '等待萃取完成', waterRatio: 0, timeRatio: 0.3, instruction: '等待所有水流过滤纸', tips: '滴落速度逐渐变慢是正常的' },
      ],
      'Chemex': [
        { name: '第一次注水/闷蒸', waterRatio: 0.21, timeRatio: 0.15, instruction: '', tips: '所有咖啡粉都需要均匀浸湿，确保没有干燥的部分' },
        { name: '第二次注水', waterRatio: 0.64, timeRatio: 0.2, instruction: '', tips: '轻微摇晃注水，优先浇在颜色较深的区域' },
        { name: '第三次注水', waterRatio: 1.00, timeRatio: 0.2, instruction: '', tips: '观察液面高度，距离滤杯顶部保留一个指尖的距离' },
        { name: '等待冲泡完成', waterRatio: 0, timeRatio: 0.45, instruction: '等待所有水流过滤纸，约4分钟时应接近目标量', tips: '观察玻璃滤杯上的"肚脐"标记，完成后提起滤纸' },
      ],
      'Melitta': [
        { name: '预浸(Bloom)', waterRatio: 0.125, timeRatio: 0.16, instruction: '', tips: '浸湿咖啡粉，让咖啡粉膨胀并释放二氧化碳' },
        { name: '第一次注水', waterRatio: 0.25, timeRatio: 0.10, instruction: '', tips: '缓慢注水至咖啡床中心，避免倒向滤杯边缘' },
        { name: '第二次注水', waterRatio: 0.50, timeRatio: 0.12, instruction: '', tips: '注水至咖啡床中心，避免咖啡粉堵塞出水孔' },
        { name: '第三次注水', waterRatio: 0.75, timeRatio: 0.12, instruction: '', tips: '保持水位稳定，避免注水过快' },
        { name: '最后注水', waterRatio: 1.00, timeRatio: 0.14, instruction: '', tips: '完成最后注水，耐心等待滴漏完成' },
        { name: '等待萃取完成', waterRatio: 0, timeRatio: 0.36, instruction: '等待所有水流过滤纸', tips: 'Melitta滤杯单孔设计，滴漏较慢，请耐心等待' },
      ],
      'Bee House': [
        { name: '闷蒸(Bloom)', waterRatio: 0.13, timeRatio: 0.25, instruction: '', tips: '从中心绕圈缓慢倒水，湿润所有咖啡粉' },
        { name: '第一段注水', waterRatio: 0.39, timeRatio: 0.17, instruction: '', tips: '用细水流绕圈，保持水流稳定' },
        { name: '第二段注水', waterRatio: 0.71, timeRatio: 0.19, instruction: '', tips: '继续以细水流绕圈注水，维持水位稳定' },
        { name: '第三段注水', waterRatio: 1.00, timeRatio: 0.22, instruction: '', tips: '完成最后注水，确保均匀萃取' },
        { name: '等待萃取完成', waterRatio: 0, timeRatio: 0.17, instruction: '等待所有水流过滤纸', tips: '2:30-3:00完成，水滴完后移除冲泡器，搅拌享用' },
      ],
      'Kono': [
        { name: '闷蒸(Bloom)', waterRatio: 0.15, timeRatio: 0.27, instruction: '', tips: '从中心绕圈缓慢倒水，湿润所有咖啡粉' },
        { name: '第一段注水', waterRatio: 0.53, timeRatio: 0.2, instruction: '', tips: 'Kono流速较快，使用细水流绕圈注水' },
        { name: '第二段注水', waterRatio: 0.85, timeRatio: 0.23, instruction: '', tips: '保持细水流绕圈，注意控制水流稳定性' },
        { name: '第三段注水', waterRatio: 1.00, timeRatio: 0.23, instruction: '', tips: '完成最后注水，Kono特殊设计会延长萃取时间' },
        { name: '等待萃取完成', waterRatio: 0, timeRatio: 0.07, instruction: '等待所有水流过滤纸', tips: '总时间控制在2:20-2:40，Kono的短肋设计带来浓郁甜感' },
      ]
    };
    
    // 获取当前方法的步骤模板
    const methodSteps = methodStepsTemplates[params.methodName] || methodStepsTemplates['Hario V60'];
    
    // 应用自定义时间（如果处于专业模式且有自定义比例）
    if (this.data.isProfessionalMode && this.data.customTimeRatios[params.methodName]) {
      const customRatios = this.data.customTimeRatios[params.methodName];
      
      // 计算自定义时间的总比例
      let totalRatio = 0;
      let countValidSteps = 0;
      
      methodSteps.forEach((step, index) => {
        if (customRatios[index] !== undefined && customRatios[index] > 0) {
          totalRatio += parseFloat(customRatios[index]);
          countValidSteps++;
        }
      });
      
      // 只有当有有效步骤时才应用自定义时间
      if (countValidSteps > 0) {
        methodSteps.forEach((step, index) => {
          if (customRatios[index] !== undefined) {
            step.timeRatio = parseFloat(customRatios[index]);
          }
        });
      }
    }
    
    // 计算总时间分配
    let totalTimeRatio = 0;
    methodSteps.forEach(step => {
      totalTimeRatio += step.timeRatio;
    });
    
    // 归一化时间比例
    methodSteps.forEach(step => {
      step.timeRatio = step.timeRatio / totalTimeRatio;
    });
    
    // 构建步骤数据
    let currentTime = 0;
    let finalSteps = [];
    let calculatedWaterAmount = 0;
    
    methodSteps.forEach((step, index) => {
      // 计算步骤时间
      let stepTime = Math.round(targetTime * step.timeRatio);
      
      // 为倒水步骤保证足够的时间
      if (step.name.includes('注水')) {
        // 根据水量估算所需时间
        const waterAmount = Math.round(totalWater * step.waterRatio) - calculatedWaterAmount;
        // 每100ml至少需要20秒，确保有足够时间
        const minTimeNeeded = Math.ceil(waterAmount / 100 * 20);
        // 如果计算的时间不足，给予足够的时间
        stepTime = Math.max(stepTime, minTimeNeeded);
      }
      
      // 计算本步骤的累计水量和水量范围(±5%)
      calculatedWaterAmount = Math.round(totalWater * step.waterRatio);
      const waterAmountMin = Math.round(calculatedWaterAmount * 0.95);
      const waterAmountMax = Math.round(calculatedWaterAmount * 1.05);
      const waterAmountRange = `${waterAmountMin}-${waterAmountMax}`;
      
      // 根据步骤名称和方法生成具体指令
      let instruction = '';
      const coffeeAmount = parseFloat(params.coffeeAmount);
      
      if (params.methodName === 'Hario V60') {
        if (step.name === '闷蒸(Bloom)') {
          const bloomRatio = coffeeAmount * 3; // 咖啡粉量的3倍
          const bloomWater = Math.min(Math.round(bloomRatio), Math.round(totalWater * 0.15));
          const bloomRange = `${Math.round(bloomWater * 0.9)}-${Math.round(bloomWater * 1.1)}`;
          instruction = `倒入热水(约${bloomRange}ml，豆子重量的2-3倍)，暂停30秒`;
        } else if (step.name === '第一段注水') {
          const targetAmount = Math.round(totalWater * 0.4);
          const targetRange = `${Math.round(targetAmount * 0.95)}-${Math.round(targetAmount * 1.05)}`;
          instruction = `在0:30-1:00间(30秒内)，将水量增加至${targetRange}ml`;
        } else if (step.name === '第二段注水') {
          const targetAmount = Math.round(totalWater * 0.7);
          const targetRange = `${Math.round(targetAmount * 0.95)}-${Math.round(targetAmount * 1.05)}`;
          instruction = `在1:00-1:30间(30秒内)，将水量增加至${targetRange}ml`;
        } else if (step.name === '第三段注水') {
          const targetRange = `${Math.round(totalWater * 0.95)}-${totalWater}`;
          instruction = `在1:30-2:00间(30秒内)，将水量增加至${targetRange}ml`;
        }
      } else if (params.methodName === 'Melitta') {
        // Melitta的特定指令
        if (step.name === '预浸(Bloom)') {
          const bloomWater = Math.round(totalWater * 0.125);
          const bloomRange = `${Math.round(bloomWater * 0.9)}-${Math.round(bloomWater * 1.1)}`;
          instruction = `缓慢均匀地倒入约${bloomRange}ml热水浸润咖啡粉，暂停30秒`;
        } else if (step.name === '第一次注水') {
          const prevAmount = Math.round(totalWater * 0.125);
          const currentAmount = Math.round(totalWater * 0.25);
          const pourAmount = currentAmount - prevAmount;
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `缓慢均匀地以圆形方式在咖啡床中心再倒入${pourAmount}ml(总计${targetRange}ml)，等待20秒让水自然滴漏`;
        } else if (step.name === '第二次注水') {
          const prevAmount = Math.round(totalWater * 0.25);
          const currentAmount = Math.round(totalWater * 0.5);
          const pourAmount = currentAmount - prevAmount;
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `继续以圆形方式在中心区域倒入${pourAmount}ml(总计${targetRange}ml)，等待20秒让水自然滴漏`;
        } else if (step.name === '第三次注水') {
          const prevAmount = Math.round(totalWater * 0.5);
          const currentAmount = Math.round(totalWater * 0.75);
          const pourAmount = currentAmount - prevAmount;
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `继续以圆形方式注水${pourAmount}ml(总计${targetRange}ml)，等待20秒让水自然滴漏`;
        } else if (step.name === '最后注水') {
          const prevAmount = Math.round(totalWater * 0.75);
          const pourAmount = totalWater - prevAmount;
          const targetRange = `${Math.round(totalWater * 0.95)}-${totalWater}`;
          instruction = `完成最后一次注水，加入剩余${pourAmount}ml(总计${targetRange}ml)`;
        } else if (step.name === '等待萃取完成') {
          instruction = '等待所有水完全滴漏，约需1分钟';
        }
      } else if (params.methodName === 'Bee House') {
        // Bee House的特定指令
        const coffeeAmount = parseFloat(params.coffeeAmount);
        
        if (step.name === '闷蒸(Bloom)') {
          // 闷蒸水量建议是咖啡粉的2.4倍
          const idealBloomWater = Math.round(coffeeAmount * 2.4);
          // 确保闷蒸水量不超过总水量的13%
          const bloomWater = Math.min(idealBloomWater, Math.round(totalWater * 0.13));
          const bloomRange = `${Math.round(bloomWater * 0.9)}-${Math.round(bloomWater * 1.1)}`;
          instruction = `从中心绕圈缓慢倒入约${bloomRange}ml热水浸润咖啡粉，暂停30秒`;
        } else if (step.name === '第一段注水') {
          const currentAmount = Math.round(totalWater * 0.39);
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `在0:30-1:00间(30秒内)，将水量增加至${targetRange}ml，用细水流绕圈注水`;
        } else if (step.name === '第二段注水') {
          const currentAmount = Math.round(totalWater * 0.71);
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `在1:00-1:30间(30秒内)，将水量增加至${targetRange}ml，保持细水流绕圈注水`;
        } else if (step.name === '第三段注水') {
          const targetRange = `${Math.round(totalWater * 0.95)}-${totalWater}`;
          instruction = `在1:30-2:00间(30秒内)，将水量增加至${targetRange}ml，完成所有注水`;
        } else if (step.name === '等待萃取完成') {
          instruction = '等待所有水完全滤过，总冲泡时间控制在2:30-3:00';
        }
      } else if (params.methodName === 'Kono') {
        // Kono的特定指令
        const coffeeAmount = parseFloat(params.coffeeAmount);
        
        if (step.name === '闷蒸(Bloom)') {
          // 闷蒸水量建议是咖啡粉的2.5倍
          const idealBloomWater = Math.round(coffeeAmount * 2.5);
          // 确保闷蒸水量不超过总水量的15%
          const bloomWater = Math.min(idealBloomWater, Math.round(totalWater * 0.15));
          const bloomRange = `${Math.round(bloomWater * 0.9)}-${Math.round(bloomWater * 1.1)}`;
          instruction = `从中心绕圈缓慢倒入约${bloomRange}ml热水浸润咖啡粉，暂停30秒`;
        } else if (step.name === '第一段注水') {
          const currentAmount = Math.round(totalWater * 0.53);
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `在0:30-1:00间(30秒内)，将水量增加至${targetRange}ml，用细水流绕圈注水`;
        } else if (step.name === '第二段注水') {
          const currentAmount = Math.round(totalWater * 0.85);
          const targetRange = `${Math.round(currentAmount * 0.95)}-${Math.round(currentAmount * 1.05)}`;
          instruction = `在1:00-1:30间(30秒内)，将水量增加至${targetRange}ml，保持细水流绕圈注水`;
        } else if (step.name === '第三段注水') {
          const targetRange = `${Math.round(totalWater * 0.95)}-${totalWater}`;
          instruction = `在1:30-2:00间(30秒内)，将水量增加至${targetRange}ml，完成所有注水`;
        } else if (step.name === '等待萃取完成') {
          instruction = '等待所有水完全滤过，总冲泡时间控制在2:20-2:40';
        }
      } else {
        // 其他冲泡方法的指令生成逻辑保持不变
        if (step.name.includes('闷蒸') || step.name.includes('预浸')) {
          const bloomWater = Math.round(totalWater * 0.2);
          const bloomRange = `${Math.round(bloomWater * 0.9)}-${Math.round(bloomWater * 1.1)}`;
          instruction = `倒入热水(约${bloomRange}ml)浸润咖啡粉，暂停30秒`;
        } else if (step.name.includes('第一次注水') || step.name.includes('继续注水')) {
          const targetRange = `${Math.round(calculatedWaterAmount * 0.95)}-${Math.round(calculatedWaterAmount * 1.05)}`;
          instruction = `以画圈方式缓慢注水至${targetRange}ml`;
        } else if (step.name.includes('第二次注水')) {
          const targetRange = `${Math.round(calculatedWaterAmount * 0.95)}-${Math.round(calculatedWaterAmount * 1.05)}`;
          instruction = `继续以画圈方式注水至${targetRange}ml`;
        } else if (step.name.includes('第三次注水')) {
          const targetRange = `${Math.round(totalWater * 0.95)}-${totalWater}`;
          instruction = `完成最后一次注水至${targetRange}ml`;
        } else if (step.name.includes('等待')) {
          instruction = '等待所有水流过滤纸';
        }
        
        // 为Chemex方法添加特殊指令
        if (params.methodName === 'Chemex') {
          if (step.name.includes('第一次注水/闷蒸')) {
            const targetRange = `${Math.round(calculatedWaterAmount * 0.95)}-${Math.round(calculatedWaterAmount * 1.05)}`;
            instruction = `倒入约${targetRange}ml热水浸润全部咖啡粉，用勺子搅拌确保无干团`;
          } else if (step.name.includes('第二次注水')) {
            const targetRange = `${Math.round(calculatedWaterAmount * 0.95)}-${Math.round(calculatedWaterAmount * 1.05)}`;
            instruction = `在45秒时开始，以螺旋状方式注水至${targetRange}ml`;
          } else if (step.name.includes('第三次注水')) {
            const targetRange = `${Math.round(totalWater * 0.95)}-${totalWater}`;
            instruction = `在1分45秒时开始，将滤杯加满水至${targetRange}ml`;
          }
        }
      }
      
      // 添加步骤
      currentTime += stepTime;
      
      finalSteps.push({
        name: step.name,
        waterAmount: calculatedWaterAmount,
        waterAmountRange: waterAmountRange, // 添加水量范围
        timeMarker: currentTime,
        instruction: instruction,
        tips: step.tips || '',
        durationSeconds: stepTime // 添加步骤实际持续秒数
      });
    });
    
    console.log('生成的步骤:', finalSteps);
    
    this.setData({
      steps: finalSteps,
      currentStepInfo: finalSteps[0]
    });
  },

  // 修改: 开始计时函数
  startTimer() {
    if (this.data.isRunning) return;
    
    // 初始化数据
    this.setData({
      isRunning: true,
      isPaused: false,
      reminderTimes: this.generateReminderTimes() // 生成提醒时间点
    });
    
    const startTime = Date.now() - (this.data.currentTime * 1000);
    
    // 定时器更新函数
    const updateTimer = () => {
      if (!this.data.isRunning) return;
      
      // 计算当前经过的时间
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      
      // 更新时间显示
      const minutes = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      const totalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // 获取步骤数据
      const { steps, currentStep, reminderTimes } = this.data;
      let newStep = currentStep;
      
      // 检查是否需要切换到下一个步骤
      for (let i = 0; i < steps.length; i++) {
        if (currentTime <= steps[i].timeMarker) {
          newStep = i;
          break;
        }
        
        if (i === steps.length - 1 && currentTime > steps[i].timeMarker) {
          newStep = i;
        }
      }
      
      // 检查是否需要提前通知即将到来的步骤变化（预警机制）
      if (newStep < steps.length - 1) {
        const nextStepTime = steps[newStep].timeMarker;
        const timeToNextStep = nextStepTime - currentTime;
        
        // 如果距离下一步骤还有5秒，提前通知
        if (timeToNextStep === 5 && !this.data.isPreNotified) {
          console.log('提前通知即将到来的步骤变化');
          wx.showToast({
            title: `5秒后进入${steps[newStep+1].name}`,
            icon: 'none',
            duration: 2000
          });
          
          // 轻微震动提示
          wx.vibrateShort();
          
          // 设置已通知标记，避免重复通知
          this.setData({
            isPreNotified: true
          });
        }
      }
      
      // 步骤发生变化
      if (newStep !== currentStep) {
        console.log(`步骤变化：从${currentStep}到${newStep}`);
        
        this.setData({
          currentStep: newStep,
          currentStepInfo: steps[newStep],
          isPreNotified: false // 重置预通知标记
        });
          
        // 步骤变化时震动提醒
        this.triggerStepChangeNotification(steps[newStep].name);
      }
      
      // 检查是否在提醒时间点
      if (reminderTimes && reminderTimes.length > 0) {
        for (let i = 0; i < reminderTimes.length; i++) {
          if (currentTime === reminderTimes[i].time) {
            // 触发提醒
            wx.vibrateShort();
            wx.showToast({
              title: reminderTimes[i].message,
              icon: 'none',
              duration: 2000
            });
            
            // 移除已触发的提醒
            let updatedReminders = [...reminderTimes];
            updatedReminders.splice(i, 1);
            this.setData({
              reminderTimes: updatedReminders
            });
            break;
          }
        }
      }
      
      // 计算进度百分比并转换为CSS样式
      const progress = this.calculateStepProgress(currentTime, newStep);
      const progressStyle = `conic-gradient(rgba(169, 115, 66, 0.5) 0% ${progress}%, transparent ${progress}% 100%)`;
      
      // 更新数据
      this.setData({
        currentTime,
        totalTime,
        stepProgress: progress,
        progressStyle
      });
      
      // 如果到达最后一步，并且超过了目标时间，自动停止计时器
      if (currentTime > this.data.targetTotalTime && newStep === steps.length - 1) {
        if (currentTime > this.data.targetTotalTime + 30) { // 允许多30秒缓冲
          this.triggerCompletionNotification();
          return;
        }
      }
      
      // 继续更新计时器
      this.timer = setTimeout(updateTimer, 1000);
    };
    
    // 启动定时器
    updateTimer();
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
    
    // 使用新的完成通知函数
    this.triggerCompletionNotification();
  },
  
  // 新增: 触发步骤变化通知函数
  triggerStepChangeNotification(stepName) {
    console.log('触发步骤变化震动:', stepName);
    
    // 第一次震动 - 短振动
    wx.vibrateShort({
      success: () => console.log('步骤变化短震动成功'),
      fail: (err) => console.error('步骤变化短震动失败:', err)
    });
    
    // 延迟200ms后第二次震动 - 强调提醒
    setTimeout(() => {
      wx.vibrateShort({
        success: () => console.log('步骤变化延迟震动成功'),
        fail: (err) => console.error('步骤变化延迟震动失败:', err)
      });
    }, 200);
    
    // 显示步骤变化提示
    wx.showToast({
      title: `${stepName}阶段开始`,
      icon: 'none',
      duration: 2500
    });
  },
  
  // 新增: 触发完成通知函数
  triggerCompletionNotification() {
    console.log('触发冲泡完成震动');
    
    // 暂停计时器
    this.pauseTimer();
    
    // 冲泡完成强制震动提醒 - 双重长震动
    wx.vibrateLong({
      success: () => console.log('冲泡完成第一次长震动成功'),
      fail: (err) => console.error('冲泡完成第一次长震动失败:', err)
    });
    
    // 延迟1秒后第二次长震动
    setTimeout(() => {
      wx.vibrateLong({
        success: () => console.log('冲泡完成第二次长震动成功'),
        fail: (err) => console.error('冲泡完成第二次长震动失败:', err)
      });
      
      // 显示成功提示并弹出保存对话框
      wx.showToast({
        title: '冲泡完成',
        icon: 'success',
        duration: 2000
      });
      
      // 显示保存数据的模态窗口
      setTimeout(() => {
        this.setData({
          showSaveModal: true
        });
      }, 1000);
      
    }, 1000);
  },

  // 新增: 生成提醒时间点，与缩短的步骤时间匹配
  generateReminderTimes() {
    const { steps } = this.data;
    let reminderTimes = [];
    
    if (steps.length === 0) return reminderTimes;
    
    // 创建步骤转换时间点的提前通知
    for (let i = 0; i < steps.length - 1; i++) {
      const stepTime = steps[i].timeMarker;
      
      // 每个步骤结束前10秒添加提醒
      if (stepTime > 10) {
        reminderTimes.push({
          time: stepTime - 10,
          message: `即将完成${steps[i].name}，准备进入${steps[i+1].name}`
        });
      }
    }
    
    // 获取总水量和咖啡粉量
    const totalWater = parseInt(this.data.brewParams.waterAmount);
    const coffeeAmount = parseFloat(this.data.brewParams.coffeeAmount);
    
    // 添加方法特定的提醒
    const methodName = this.data.brewParams.methodName;
    
    if (methodName === 'Hario V60') {
      // V60方法的特定提醒
      // 闷蒸中间点提醒
      if (steps[0] && steps[0].timeMarker > 15) {
        reminderTimes.push({
          time: 15,
          message: '检查咖啡粉是否均匀浸湿'
        });
      }
      
      // 第一次注水中点提醒
      if (steps[1] && steps[0]) {
        const firstPourMid = Math.floor(steps[0].timeMarker + (steps[1].timeMarker - steps[0].timeMarker) / 2);
        reminderTimes.push({
          time: firstPourMid,
          message: '继续匀速注水，保持水位稳定'
        });
      }
      
    } else if (methodName === 'Chemex') {
      // Chemex的特定提醒
      // 第一段注水中提醒搅拌
      if (steps[0] && steps[0].timeMarker > 10) {
        reminderTimes.push({
          time: 10,
          message: '轻轻搅拌确保咖啡粉均匀浸湿'
        });
      }
      
      // 第二段注水提醒观察水位
      if (steps[1] && steps[2]) {
        const secondPourMid = Math.floor(steps[1].timeMarker + (steps[2].timeMarker - steps[1].timeMarker) / 2);
        reminderTimes.push({
          time: secondPourMid,
          message: '观察滤杯水位，保持稳定注水'
        });
      }
    }
    
    // 根据总冲泡时间添加中点提醒
    const totalTime = this.data.targetTotalTime;
    
    if (totalTime > 120) {
      const midTime = Math.floor(totalTime / 2);
      reminderTimes.push({
        time: midTime,
        message: '冲泡进行中，注意观察咖啡液颜色'
      });
    }
    
    // 排序并去重
    reminderTimes.sort((a, b) => a.time - b.time);
    
    // 去除时间点重复的提醒
    let uniqueReminders = [];
    let timeSet = new Set();
    
    for (const reminder of reminderTimes) {
      if (!timeSet.has(reminder.time)) {
        timeSet.add(reminder.time);
        uniqueReminders.push(reminder);
      }
    }
    
    console.log('生成的提醒时间点:', uniqueReminders);
    return uniqueReminders;
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
  },

  // 修改函数：点击专业模式按钮直接显示时间自定义窗口
  toggleProfessionalMode() {
    // 直接调用显示时间自定义窗口函数
    this.showTimeCustomizeDialog();
  },
  
  // 专业模式开关状态更新
  toggleProfessionalModeState(e) {
    const newMode = e.detail.value;
    console.log('切换专业模式:', newMode);
    
    this.setData({
      isProfessionalMode: newMode
    });
    
    // 保存设置到本地存储
    wx.setStorageSync('isProfessionalMode', newMode);
    
    // 如果退出专业模式，重新生成默认步骤
    if (!newMode) {
      this.resetTimeRatios();
    }
  },
  
  // 修改函数：显示时间自定义窗口，无需检查专业模式状态
  showTimeCustomizeDialog() {
    // 确保当前方法的自定义时间比例对象存在
    const methodName = this.data.brewParams.methodName;
    let customTimeRatios = this.data.customTimeRatios || {};
    let stepSeconds = [];
    
    if (!customTimeRatios[methodName]) {
      customTimeRatios[methodName] = {};
    }
    
    // 初始化每个步骤的秒数
    this.data.steps.forEach((step, index) => {
      // 如果已有自定义值，使用自定义值；否则使用当前步骤时间
      const ratio = customTimeRatios[methodName][index] || step.timeRatio;
      const seconds = Math.round(ratio * this.data.targetTotalTime);
      stepSeconds[index] = seconds;
      
      // 更新比例
      customTimeRatios[methodName][index] = ratio;
    });
    
    this.setData({
      customTimeRatios,
      stepSeconds,
      showTimeCustomizeModal: true
    });
    
    console.log('显示自定义时间面板:', {
      customTimeRatios: this.data.customTimeRatios,
      stepSeconds: this.data.stepSeconds,
      isProfessionalMode: this.data.isProfessionalMode
    });
  },
  
  // 修改函数：关闭时间自定义弹窗
  closeTimeCustomizeModal() {
    // 不保存当前修改，恢复之前的状态
    this.setData({
      showTimeCustomizeModal: false
    });
    
    console.log('关闭自定义时间窗口，未保存修改');
  },
  
  // 修改函数：处理时间秒数输入
  onTimeRatioInput(e) {
    const { index } = e.currentTarget.dataset;
    const inputValue = e.detail.value;
    
    // 允许空值输入，方便用户删除现有值
    let seconds = inputValue === '' ? '' : parseInt(inputValue) || 0;
    
    // 只对非空值进行上限限制
    if (seconds !== '' && seconds > 300) {
      seconds = 300;
    }
    
    // 更新秒数数组
    let stepSeconds = [...this.data.stepSeconds];
    stepSeconds[index] = seconds;
    
    // 更新自定义比例 (只有非空值才更新比例)
    const methodName = this.data.brewParams.methodName;
    let customTimeRatios = {...this.data.customTimeRatios};
    
    if (!customTimeRatios[methodName]) {
      customTimeRatios[methodName] = {};
    }
    
    if (seconds !== '') {
      customTimeRatios[methodName][index] = seconds / this.data.targetTotalTime;
    } else {
      // 如果输入为空，设置为0或保持之前的值
      customTimeRatios[methodName][index] = 0;
    }
    
    this.setData({
      stepSeconds,
      customTimeRatios
    });
    
    console.log('输入更新:', {
      index,
      inputValue,
      seconds,
      stepSeconds: this.data.stepSeconds
    });
  },
  
  // 修改函数：保存自定义时间比例
  saveCustomTimeRatios() {
    const methodName = this.data.brewParams.methodName;
    let customRatios = {...this.data.customTimeRatios[methodName]};
    let stepSeconds = [...this.data.stepSeconds];
    
    // 检查并修正所有步骤的时间（在保存时强制设置最小值）
    let hasEmptyFields = false;
    
    for (let i = 0; i < stepSeconds.length; i++) {
      // 如果有空值或值小于1，设为最小值1秒
      if (stepSeconds[i] === '' || stepSeconds[i] < 1) {
        hasEmptyFields = true;
        stepSeconds[i] = 1;
        customRatios[i] = 1 / this.data.targetTotalTime;
      }
    }
    
    // 如果有空字段，提示用户并更新显示
    if (hasEmptyFields) {
      wx.showToast({
        title: '空值已自动设为1秒',
        icon: 'none',
        duration: 2000
      });
      
      this.setData({
        stepSeconds,
        customTimeRatios: {
          ...this.data.customTimeRatios,
          [methodName]: customRatios
        }
      });
    }
    
    // 计算总时间（秒）
    let totalSeconds = 0;
    for (let i = 0; i < stepSeconds.length; i++) {
      totalSeconds += parseInt(stepSeconds[i]) || 0;
    }
    
    // 如果总时间太短，提示用户
    if (totalSeconds < 30) {
      wx.showToast({
        title: '总时间太短，请增加各步骤时间',
        icon: 'none'
      });
      return;
    }
    
    // 保存到本地存储
    wx.setStorageSync(`customTimeRatios_${methodName}`, customRatios);
    
    // 重新生成步骤
    this.generateSteps(this.data.brewParams);
    
    // 关闭弹窗
    this.setData({
      showTimeCustomizeModal: false
    });
    
    wx.showToast({
      title: '自定义时间已保存',
      icon: 'success'
    });
    
    console.log('保存自定义时间:', {
      customRatios,
      totalSeconds,
      stepSeconds
    });
  },
  
  // 修改函数：重置时间比例为默认值
  resetTimeRatios() {
    const methodName = this.data.brewParams.methodName;
    
    // 清除自定义时间比例
    let customTimeRatios = {...this.data.customTimeRatios};
    if (customTimeRatios[methodName]) {
      delete customTimeRatios[methodName];
    }
    
    // 从本地存储中删除
    wx.removeStorageSync(`customTimeRatios_${methodName}`);
    
    // 初始化每个步骤的默认秒数
    let stepSeconds = [];
    this.data.steps.forEach((step, index) => {
      const seconds = Math.round(step.timeRatio * this.data.targetTotalTime);
      stepSeconds[index] = seconds;
    });
    
    // 重新生成步骤
    this.generateSteps(this.data.brewParams);
    
    // 更新数据
    this.setData({
      customTimeRatios,
      stepSeconds
    });
    
    wx.showToast({
      title: '已恢复默认设置',
      icon: 'success'
    });
    
    console.log('重置为默认时间:', {
      methodName,
      stepSeconds
    });
  },
}); 