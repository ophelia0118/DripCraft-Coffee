// navigation-bar.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    delta: {
      type: Number,
      value: 1
    },
  },
  data: {
    displayStyle: ''
  },
  lifetimes: {
    attached() {
      // 使用新API代替废弃的wx.getSystemInfoSync
      try {
        const rect = wx.getMenuButtonBoundingClientRect();
        const windowInfo = wx.getWindowInfo();
        const deviceInfo = wx.getDeviceInfo();
        
        const isAndroid = deviceInfo.platform === 'android';
        const isDevtools = deviceInfo.platform === 'devtools';
        
        this.setData({
          ios: !isAndroid,
          innerPaddingRight: `padding-right: ${windowInfo.windowWidth - rect.left}px`,
          leftWidth: `width: ${windowInfo.windowWidth - rect.left}px`,
          safeAreaTop: isDevtools || isAndroid ? 
            `height: calc(var(--height) + ${windowInfo.safeArea.top}px); padding-top: ${windowInfo.safeArea.top}px` : ``
        });
      } catch (error) {
        console.error('获取系统信息失败', error);
      }
    },
  },
  methods: {
    _showChange(show) {
      const animated = this.data.animated;
      let displayStyle = '';
      if (animated) {
        displayStyle = `opacity: ${
          show ? '1' : '0'
        };transition:opacity 0.5s;`;
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`;
      }
      this.setData({
        displayStyle
      });
    },
    back() {
      const data = this.data;
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta
        });
      }
      this.triggerEvent('back', { delta: data.delta }, {});
    },
    home() {
      wx.switchTab({
        url: '/pages/index/index'
      });
      this.triggerEvent('home', {}, {});
    }
  }
}) 