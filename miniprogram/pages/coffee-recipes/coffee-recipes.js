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
      { id: 'hario-v60', name: 'Hario V60' },
      { id: 'kalita-wave', name: 'Kalita Wave' },
      { id: 'chemex', name: 'Chemex' },
      { id: 'melitta', name: 'Melitta' },
      { id: 'bee-house', name: 'Bee House' },
      { id: 'kono', name: 'Kono' },
      { id: 'custom', name: '自定义滤杯...' }
    ]
  },

  onLoad() {
    console.log('咖啡配方页面加载');
    this.loadRecipes();
  },

  onShow() {
    console.log('咖啡配方页面显示');
    this.loadRecipes();
  },

  // 加载保存的配方
  loadRecipes() {
    try {
      const recipes = wx.getStorageSync('coffeeRecipes') || [];
      console.log('加载配方数据:', recipes);
      this.setData({
        recipes: recipes
      });
    } catch (e) {
      console.error('加载配方数据失败:', e);
      wx.showToast({
        title: '加载配方失败',
        icon: 'none'
      });
    }
  },

  // 显示添加表单
  showAddForm() {
    this.setData({
      showAddForm: true,
      brewMethodIndex: 0,
      showBrewMethodOptions: false, // 确保选项列表隐藏
      showCustomInput: false, // 确保自定义输入框隐藏
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

  // 切换冲泡方法选项列表显示
  toggleBrewMethodOptions() {
    console.log('切换冲泡方法选项列表');
    this.setData({
      showBrewMethodOptions: !this.data.showBrewMethodOptions
    });
  },

  // 选择冲泡方法
  selectBrewMethod(e) {
    console.log('选择冲泡方法', e);
    const { id, name, index } = e.currentTarget.dataset;
    
    this.setData({
      'newRecipe.brewMethod': name,
      brewMethodIndex: index,
      showBrewMethodOptions: false, // 选择后隐藏选项列表
      showCustomInput: false // 确保自定义输入框隐藏
    });
  },

  // 切换自定义输入框
  toggleCustomInput() {
    console.log('切换自定义输入框');
    this.setData({
      showCustomInput: true,
      showBrewMethodOptions: false, // 隐藏选项列表
      'newRecipe.brewMethod': '' // 清空已选择的冲泡方法
    });
  },

  // 停止事件冒泡
  stopPropagation(e) {
    // 阻止事件向上冒泡
    return;
  },
  
  // 点击表单时隐藏选项列表
  hideOptionsOnFormClick(e) {
    // 检查是否应该隐藏选项列表
    if (this.data.showBrewMethodOptions) {
      console.log('点击表单区域，隐藏选项列表');
      this.setData({
        showBrewMethodOptions: false
      });
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

  // 保存配方（添加点击外部隐藏选项列表的逻辑）
  saveRecipe() {
    // 隐藏选项列表和自定义输入框
    this.setData({
      showBrewMethodOptions: false
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
      // 获取现有配方
      const recipes = wx.getStorageSync('coffeeRecipes') || [];
      
      // 创建新配方对象，添加ID和创建时间
      const recipe = {
        ...newRecipe,
        id: Date.now().toString(), // 使用时间戳作为ID
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      // 添加到配方列表
      recipes.unshift(recipe);
      
      // 保存回本地存储
      wx.setStorageSync('coffeeRecipes', recipes);
      
      // 更新页面数据
      this.setData({
        recipes: recipes,
        showAddForm: false
      });
      
      wx.showToast({
        title: '配方保存成功',
        icon: 'success'
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
            // 获取现有配方
            const recipes = wx.getStorageSync('coffeeRecipes') || [];
            
            // 过滤掉要删除的配方
            const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
            
            // 保存回本地存储
            wx.setStorageSync('coffeeRecipes', updatedRecipes);
            
            // 更新页面数据
            this.setData({
              recipes: updatedRecipes
            });
            
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
  }
}); 