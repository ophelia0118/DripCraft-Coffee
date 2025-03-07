// record.js
Page({
  data: {
    records: [],
    showDetailModal: false,
    currentRecord: null
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    // 从本地存储获取记录
    let records = wx.getStorageSync('coffeeRecords') || [];
    let needsUpdate = false;
    
    // 格式化日期显示并修复水粉比
    const formattedRecords = records.map((record) => {
      const date = new Date(record.date);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      // 检查并修复水粉比
      if (record.ratio === null || record.ratio === undefined || record.ratio === 'null' || record.ratio === 'undefined') {
        needsUpdate = true;
        
        // 解析水量和咖啡粉量
        const waterWeight = parseInt(record.waterWeight);
        const coffeeWeight = parseFloat(record.coffeeWeight);
        
        // 计算水粉比
        if (waterWeight && coffeeWeight && coffeeWeight > 0) {
          record.ratio = Math.round(waterWeight / coffeeWeight);
        } else {
          record.ratio = 15; // 默认值
        }
      }
      
      return {
        ...record,
        formattedDate
      };
    });
    
    // 如果有记录需要更新，保存回本地存储
    if (needsUpdate) {
      wx.setStorageSync('coffeeRecords', records);
    }
    
    this.setData({
      records: formattedRecords
    });
  },

  viewRecordDetail(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    
    // 确保记录中的水粉比有效
    if (record.ratio === null || record.ratio === undefined || record.ratio === 'null' || record.ratio === 'undefined') {
      // 从水量和咖啡粉量计算水粉比
      const waterWeight = parseInt(record.waterWeight);
      const coffeeWeight = parseFloat(record.coffeeWeight);
      if (waterWeight && coffeeWeight && coffeeWeight > 0) {
        record.ratio = Math.round(waterWeight / coffeeWeight);
      } else {
        record.ratio = 15; // 默认值
      }
    }
    
    this.setData({
      showDetailModal: true,
      currentRecord: record
    });
  },

  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      currentRecord: null
    });
  },

  deleteRecord(e) {
    const index = e.currentTarget.dataset.index;
    const records = wx.getStorageSync('coffeeRecords') || [];
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 删除记录
          records.splice(index, 1);
          
          // 保存回本地存储
          wx.setStorageSync('coffeeRecords', records);
          
          // 重新加载记录
          this.loadRecords();
          
          wx.showToast({
            title: '记录已删除',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  shareRecord(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    
    this.shareRecordData(record);
  },

  shareCurrentRecord() {
    if (this.data.currentRecord) {
      this.shareRecordData(this.data.currentRecord);
    }
  },

  shareRecordData(record) {
    // 确保水粉比有效
    let ratio = record.ratio;
    if (ratio === null || ratio === undefined || ratio === 'null' || ratio === 'undefined') {
      // 解析水量和咖啡粉量
      const waterWeight = parseInt(record.waterWeight);
      const coffeeWeight = parseFloat(record.coffeeWeight);
      
      // 计算水粉比
      if (waterWeight && coffeeWeight && coffeeWeight > 0) {
        ratio = Math.round(waterWeight / coffeeWeight);
      } else {
        ratio = 15; // 默认值
      }
    }
    
    // 构建分享文本
    const shareText = `
我用DripCraft Coffee冲了一杯咖啡！

咖啡种类：${record.coffeeType}
咖啡粉重量：${record.coffeeWeight}g
水重量：${record.waterWeight}g
比例：1:${ratio}
冲泡时间：${record.time}
日期：${record.formattedDate}
    `.trim();
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  goToTimer() {
    wx.navigateTo({
      url: '../brew-methods/brew-methods'
    });
  }
}); 