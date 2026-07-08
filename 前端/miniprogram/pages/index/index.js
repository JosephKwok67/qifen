Page({
  data: {
    todayDate: '',
    mealSlots: [
      { type: 'breakfast', icon: '🌅', label: '早餐', time: '06:00-09:00', hasContent: false, content: '' },
      { type: 'lunch', icon: '☀️', label: '午餐', time: '11:00-14:00', hasContent: false, content: '' },
      { type: 'dinner', icon: '🌙', label: '晚餐', time: '17:00-20:00', hasContent: false, content: '' },
      { type: 'snack', icon: '🍵', label: '加餐', time: '随时', hasContent: false, content: '' }
    ]
  },
  onShow() {
    this.setData({ todayDate: this.formatDate(new Date()) })
  },
  formatDate(d) {
    const mm = d.getMonth() + 1, dd = d.getDate()
    const week = ['日','一','二','三','四','五','六']
    return mm + '月' + dd + '日 周' + week[d.getDay()]
  },
  goRecord(e) {
    const type = e.currentTarget.dataset.type || ''
    wx.navigateTo({ url: type ? '/pages/record/record?type=' + type : '/pages/record/record' })
  }
})
