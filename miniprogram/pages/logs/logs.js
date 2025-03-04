// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
  },
  
  onLoad() {
    const logs = (wx.getStorageSync('logs') || []).map(log => {
      return {
        date: util.formatTime(new Date(log)),
        timeStamp: log
      }
    })
    this.setData({
      logs
    })
  }
}); 