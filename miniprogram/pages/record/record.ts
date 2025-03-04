// record.ts
Page({
  data: {
    records: [] as any[],
    showDetailModal: false,
    currentRecord: null as any
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    // 从本地存储获取记录
    const records = wx.getStorageSync('coffeeRecords') || [];
    
    // 格式化日期显示
    const formattedRecords = records.map((record: any) => {
      const date = new Date(record.date);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      return {
        ...record,
        formattedDate
      };
    });
    
    this.setData({
      records: formattedRecords
    });
  },

  viewRecordDetail(e: any) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    
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

  deleteRecord(e: any) {
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

  shareRecord(e: any) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    
    this.shareRecordData(record);
  },

  shareCurrentRecord() {
    if (this.data.currentRecord) {
      this.shareRecordData(this.data.currentRecord);
    }
  },

  shareRecordData(record: any) {
    // 构建分享文本
    const shareText = `
我用DripCraft Coffee冲了一杯咖啡！

咖啡种类：${record.coffeeType}
咖啡粉重量：${record.coffeeWeight}g
水重量：${record.waterWeight}g
比例：1:${record.ratio}
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
    wx.switchTab({
      url: '../timer/timer'
    });
  }
}); 