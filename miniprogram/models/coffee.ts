// 咖啡记录的数据模型

// 咖啡豆类型
export interface CoffeeBean {
  name: string;       // 咖啡豆名称
  origin: string;     // 产地
  roastLevel: string; // 烘焙程度
  process: string;    // 处理方式
}

// 冲泡参数
export interface BrewingParameter {
  grindSize: string;  // 研磨度
  waterTemp: number;  // 水温
  ratio: string;      // 粉水比
  totalWeight: number; // 总重量
}

// 冲泡阶段
export interface BrewingStage {
  name: string;       // 阶段名称
  startTime: number;  // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
  waterAmount: number; // 注水量
  description?: string; // 描述
}

// 咖啡记录
export interface CoffeeRecord {
  id: string;         // 记录ID
  date: number;       // 记录日期时间戳
  bean: CoffeeBean;   // 咖啡豆信息
  parameter: BrewingParameter; // 冲泡参数
  stages: BrewingStage[]; // 冲泡阶段
  totalTime: number;  // 总时间（秒）
  flavor: {           // 风味评分
    acidity: number;  // 酸度
    sweetness: number; // 甜度
    body: number;     // 醇厚度
    aftertaste: number; // 余韵
  };
  notes: string;      // 备注
  rating: number;     // 总体评分（1-5）
  imageUrl?: string;  // 图片URL
}

// 存储相关方法
class CoffeeService {
  private readonly STORAGE_KEY = 'coffee_records';

  // 获取所有记录
  getAllRecords(): CoffeeRecord[] {
    const records = wx.getStorageSync(this.STORAGE_KEY) || [];
    return records;
  }

  // 获取单条记录
  getRecord(id: string): CoffeeRecord | null {
    const records = this.getAllRecords();
    return records.find(record => record.id === id) || null;
  }

  // 保存记录
  saveRecord(record: CoffeeRecord): boolean {
    try {
      let records = this.getAllRecords();
      const index = records.findIndex(r => r.id === record.id);
      
      if (index >= 0) {
        // 更新现有记录
        records[index] = record;
      } else {
        // 添加新记录
        records.push(record);
      }
      
      wx.setStorageSync(this.STORAGE_KEY, records);
      return true;
    } catch (error) {
      console.error('保存记录失败:', error);
      return false;
    }
  }

  // 删除记录
  deleteRecord(id: string): boolean {
    try {
      let records = this.getAllRecords();
      const newRecords = records.filter(record => record.id !== id);
      
      wx.setStorageSync(this.STORAGE_KEY, newRecords);
      return true;
    } catch (error) {
      console.error('删除记录失败:', error);
      return false;
    }
  }

  // 生成唯一ID
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}

export const coffeeService = new CoffeeService(); 