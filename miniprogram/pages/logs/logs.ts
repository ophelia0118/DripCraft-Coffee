// logs.ts
// const util = require('../../utils/util.js')
import { formatTime } from '../../utils/util'

Page({
  data: {
    logs: [],
  },
  
  onLoad() {
    // @ts-ignore
    const logs = (wx.getStorageSync('logs') || []).map((log: string) => {
      return {
        date: formatTime(new Date(log)),
        timeStamp: log
      }
    })
    this.setData({
      logs
    })
  }
});
