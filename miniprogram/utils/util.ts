// 格式化时间为 YYYY-MM-DD HH:mm:ss 格式
export const formatTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 格式化时间为 YYYY-MM-DD 格式
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

// 格式化数字，保证两位数
const formatNumber = (n: number): string => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

// 格式化秒数为 mm:ss 格式
export const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`
}

// 格式化秒数为 mm:ss.S 格式（带毫秒）
export const formatSecondsWithMs = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  
  return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}.${ms}`
}

// 生成随机颜色
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// 防抖函数
export const debounce = (func: Function, wait: number = 500): Function => {
  let timeout: number | null = null
  return function(this: any, ...args: any[]) {
    const context = this
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait) as unknown as number
  }
}

// 节流函数
export const throttle = (func: Function, wait: number = 500): Function => {
  let previous = 0
  return function(this: any, ...args: any[]) {
    const now = Date.now()
    const context = this
    if (now - previous > wait) {
      func.apply(context, args)
      previous = now
    }
  }
}
