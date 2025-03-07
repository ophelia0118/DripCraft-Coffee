// help.js
Page({
  data: {
    methodName: '',
    source: '',
    guideImageUrl: '',
    imageLoadFailed: true,
    useBase64: false, // 禁用base64图片
    showPlaceholder: true, // 使用占位图
    imagePathRetried: false // 标记是否已经尝试过替代路径
  },

  onLoad: function (options) {
    console.log('帮助页面接收参数:', options);
    
    if (options.method) {
      // 处理不同名称格式的映射
      let methodName = options.method;
      
      // 处理可能的名称变体
      if (methodName === 'Kalita Wave' || methodName === 'Kalita') {
        methodName = 'Kalita';
      }
      
      this.setData({
        methodName: methodName,
        source: options.source || '',
        showPlaceholder: true,
        // 默认显示步骤而不是尝试加载不存在的图片
        imageLoadFailed: true
      });
      
      // 使用绝对路径，简化文件名
      const methodImages = {
        'V60': '/miniprogram/assets/guides/v60.jpg',
        'Kalita': '/miniprogram/assets/guides/kalita.jpg',
        'Chemex': '/miniprogram/assets/guides/chemex.jpg',
        'Melitta': '/miniprogram/assets/guides/melitta.jpg',
        'Bee House': '/miniprogram/assets/guides/beehouse.jpg',
        'Kono': '/miniprogram/assets/guides/kono.jpg'
      };
      
      /* 暂时禁用图片加载尝试，因为图片文件是空的
      if (methodImages[options.method]) {
        console.log('设置指南图片URL:', methodImages[options.method]);
        this.setData({
          guideImageUrl: methodImages[options.method],
          showPlaceholder: false // 有正确的图片路径时不显示占位图
        });
      } else {
        console.warn('未找到对应的图片:', options.method);
        this.setData({
          imageLoadFailed: true
        });
      }
      */
    }
    
    // 设置页面标题
    if (options.method) {
      wx.setNavigationBarTitle({
        title: `${options.method}冲泡指南`
      });
    }
  },
  
  // 处理图片加载错误
  handleImageError: function(e) {
    console.error('图片加载失败详情:', e.detail);
    
    // 尝试使用不同路径格式的图片
    const method = this.data.methodName;
    let newImagePath = '';
    
    // 根据不同方法尝试不同的图片路径
    if (method === 'V60') {
      newImagePath = '/miniprogram/assets/guides/v60.jpg';
    } else if (method === 'Kalita') {
      newImagePath = '/miniprogram/assets/guides/kalita.jpg';
    } else if (method === 'Chemex') {
      newImagePath = '/miniprogram/assets/guides/chemex.jpg';
    } else if (method === 'Melitta') {
      newImagePath = '/miniprogram/assets/guides/melitta.jpg';
    } else if (method === 'Bee House') {
      newImagePath = '/miniprogram/assets/guides/beehouse.jpg';
    } else if (method === 'Kono') {
      newImagePath = '/miniprogram/assets/guides/kono.jpg';
    }
    
    if (newImagePath && this.data.guideImageUrl !== newImagePath) {
      console.log('尝试使用替代图片路径:', newImagePath);
      this.setData({
        guideImageUrl: newImagePath,
        imagePathRetried: true  // 标记已经尝试过替代路径
      });
      return;
    }
    
    // 如果之前已经尝试过替代路径，或者没有可用的替代路径，则使用SVG作为兜底方案
    if (this.data.imagePathRetried || !newImagePath) {
      console.log('使用SVG作为兜底方案');
      this.useInlineSVG();
    }
    
    // 记录更多调试信息
    console.log('加载失败的图片路径:', this.data.guideImageUrl);
  },
  
  // 使用内联SVG作为备选方案
  useInlineSVG: function() {
    // 使用简单的SVG作为兜底方案
    const method = this.data.methodName;
    let svgUrl = '';
    
    // 根据不同的冲泡方法生成不同的SVG
    if (method === 'V60') {
      svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8f8f8"/><text x="100" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="#333">V60冲泡指南</text><text x="100" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">简易版</text></svg>');
    } else if (method === 'Kalita') {
      svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8f8f8"/><text x="100" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="#333">Kalita冲泡指南</text><text x="100" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">简易版</text></svg>');
    } else {
      svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8f8f8"/><text x="100" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="#333">' + method + '冲泡指南</text><text x="100" y="120" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">简易版</text></svg>');
    }
    
    console.log('使用SVG作为兜底方案');
    // 设置SVG作为图片源
    this.setData({
      guideImageUrl: svgUrl,
      imageLoadFailed: false,
      showPlaceholder: false
    });
  },
  
  // 尝试加载临时图片
  tryLoadTempImage: function() {
    // 此功能暂时保留但不使用，因为域名未在白名单内
    
    // 改为直接使用SVG内联图片
    this.useInlineSVG();
  },
  
  // 预览指南图片
  previewGuideImage: function() {
    if (this.data.guideImageUrl && !this.data.imageLoadFailed) {
      wx.previewImage({
        urls: [this.data.guideImageUrl],
        current: this.data.guideImageUrl,
        fail: (err) => {
          console.error('预览图片失败:', err);
          wx.showToast({
            title: '图片加载失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '无法预览图片',
        icon: 'none'
      });
    }
  },

  onUnload() {
    // 页面卸载时的逻辑
  }
}); 