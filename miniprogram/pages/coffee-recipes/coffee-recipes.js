// coffee-recipes.js
Page({
  data: {
    recipes: [],
    showAddForm: false,
    showCustomInput: false, // 添加标志控制是否显示自定义输入框
    showBrewMethodOptions: false, // 控制选项列表的显示
    brewMethodIndex: 0, // 添加brewMethodIndex来跟踪选中项
    newRecipe: {
      name: '',
      coffeeBean: '',
      brewMethod: '',
      ratio: '',
      grindSize: '',
      brewTime: '',
      notes: ''
    },
    brewMethods: [
      { id: 1, name: 'Hario V60' },
      { id: 2, name: 'Kalita Wave' },
      { id: 3, name: 'Chemex' },
      { id: 4, name: 'Melitta' },
      { id: 5, name: 'French Press' },
      { id: 6, name: 'AeroPress' },
      { id: 7, name: 'Moka Pot' },
      { id: 8, name: 'Siphon' }
    ]
  },

  onLoad() {
    console.log('页面加载');
    console.log('brewMethods:', this.data.brewMethods);
    this.loadRecipes();
    
    // 监听页面显示状态
    wx.onAppShow(() => {
      console.log('应用程序前台显示，刷新配方');
      this.loadRecipes();
    });
  },

  onShow() {
    console.log('咖啡配方页面显示');
    // 每次页面显示时获取并排序配方
    this.loadRecipes();
    
    // 延迟执行一次排序，以防初始渲染有问题
    setTimeout(() => {
      this.loadRecipes();
    }, 300);
  },

  // 加载保存的配方
  loadRecipes() {
    try {
      // 从本地存储获取配方数据
      const recipesData = wx.getStorageSync('coffeeRecipes') || [];
      
      // 排序：最新添加的配方显示在顶部
      const sortedRecipes = recipesData.sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
      });
      
      this.setData({
        recipes: sortedRecipes
      });
      
      console.log('加载配方成功', this.data.recipes);
    } catch (e) {
      console.error('加载配方失败', e);
    }
  },

  // 显示添加表单
  showAddForm: function() {
    this.setData({
      showAddForm: true,
      newRecipe: {
        name: '',
        coffeeBean: '',
        brewMethod: '',
        ratio: '',
        grindSize: '',
        brewTime: '',
        notes: ''
      }
    });
  },

  // 隐藏添加表单
  hideAddForm() {
    this.setData({
      showAddForm: false,
      showBrewMethodOptions: false,
      showCustomInput: false
    });
  },

  // 切换冲泡方法选项显示
  toggleBrewMethodOptions() {
    console.log('toggleBrewMethodOptions 被调用');
    console.log('当前状态:', this.data.showBrewMethodOptions);
    console.log('可用的冲泡方法:', this.data.brewMethods);
    
    // 简单切换显示状态
    this.setData({
      showBrewMethodOptions: !this.data.showBrewMethodOptions
    }, () => {
      console.log('切换后状态:', this.data.showBrewMethodOptions);
    });
  },

  // 选择冲泡方法
  selectBrewMethod(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      'newRecipe.brewMethod': name,
      showBrewMethodOptions: false
    });
  },

  // 切换自定义输入框
  toggleCustomInput() {
    this.setData({
      showCustomInput: !this.data.showCustomInput,
      showBrewMethodOptions: false,
      'newRecipe.brewMethod': ''
    });
    
    // 确保自定义输入框可见
    if (this.data.showCustomInput) {
      wx.nextTick(() => {
        // 滚动到合适位置
        const query = wx.createSelectorQuery();
        query.select('.custom-input').boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res && res[0] && res[1]) {
            const elementTop = res[0].top;
            const scrollTop = res[1].scrollTop;
            const windowHeight = wx.getSystemInfoSync().windowHeight;
            
            if (elementTop + 200 > windowHeight) {
              wx.pageScrollTo({
                scrollTop: scrollTop + (elementTop + 200 - windowHeight),
                duration: 200
              });
            }
          }
        });
      });
    }
  },

  // 处理表单点击事件
  hideOptionsOnFormClick: function(e) {
    // 检查是否点击在下拉菜单外部
    if (this.data.showBrewMethodOptions) {
      // 获取点击事件的路径
      const path = e.target.dataset.role;
      
      // 如果点击的不是选择器相关元素，则隐藏选项列表
      if (path !== 'selector' && path !== 'option') {
        this.setData({
          showBrewMethodOptions: false
        });
      }
    }
  },

  // 输入框变化处理
  inputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`newRecipe.${field}`]: value
    });
  },
  
  // 处理冲泡方法选择 (保留此方法以兼容之前的picker使用)
  onBrewMethodChange(e) {
    const index = parseInt(e.detail.value);
    if (!isNaN(index) && index >= 0 && index < this.data.brewMethods.length) {
      const selectedMethod = this.data.brewMethods[index].name;
      console.log('选择了冲泡方法:', selectedMethod, '索引:', index);
      
      this.setData({
        'newRecipe.brewMethod': selectedMethod,
        'brewMethodIndex': index
      });
    }
  },

  // 处理自定义滤杯输入
  customBrewMethodInput(e) {
    const value = e.detail.value;
    this.setData({
      'newRecipe.brewMethod': value
    });
  },

  // 保存配方
  saveRecipe() {
    // 隐藏选项列表
    this.setData({
      showBrewMethodOptions: false,
      showCustomInput: false
    });
    
    const newRecipe = this.data.newRecipe;
    
    // 验证必填字段
    if (!newRecipe.name.trim()) {
      wx.showToast({
        title: '请输入配方名称',
        icon: 'none'
      });
      return;
    }
    
    if (!newRecipe.coffeeBean.trim()) {
      wx.showToast({
        title: '请输入咖啡豆信息',
        icon: 'none'
      });
      return;
    }
    
    if (!newRecipe.brewMethod.trim()) {
      wx.showToast({
        title: '请选择冲泡方法',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 直接从存储获取现有配方
      let recipes = wx.getStorageSync('coffeeRecipes') || [];
      
      // 创建新配方对象，使用当前时间戳作为ID
      const timestamp = Date.now();
      const recipe = {
        ...newRecipe,
        id: timestamp.toString(),
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      console.log('保存新配方:', recipe);
      
      // 添加到配方列表开头
      recipes.unshift(recipe);
      
      // 确保最新的配方在前面
      recipes.sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
      });
      
      // 保存到本地存储
      wx.setStorageSync('coffeeRecipes', recipes);
      
      // 更新页面状态
      this.setData({
        recipes: recipes,
        showAddForm: false
      });
      
      // 保存成功后滚动到顶部以查看新配方
      wx.nextTick(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 300
        });
        
        // 显示保存成功提示
        wx.showToast({
          title: '配方保存成功',
          icon: 'success'
        });
      });
    } catch (e) {
      console.error('保存配方失败:', e);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },

  // 删除配方
  deleteRecipe(e) {
    const recipeId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个咖啡配方吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 直接从本地存储获取配方数据
            let recipes = wx.getStorageSync('coffeeRecipes') || [];
            
            // 过滤掉要删除的配方
            const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
            
            // 保存到本地存储
            wx.setStorageSync('coffeeRecipes', updatedRecipes);
            
            // 更新页面数据
            this.setData({
              recipes: updatedRecipes
            });
            
            // 显示成功提示
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (e) {
            console.error('删除配方失败:', e);
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 阻止事件冒泡
  stopPropagation(e) {
    // 简单阻止事件冒泡
    return;
  }
}); 