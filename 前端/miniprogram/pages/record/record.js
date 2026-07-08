Page({
  data: {
    currentType: 'lunch',
    content: '',
    photo: '',
    mealTypes: [
      { type: 'breakfast', icon: '🌅', label: '早餐' },
      { type: 'lunch', icon: '☀️', label: '午餐' },
      { type: 'dinner', icon: '🌙', label: '晚餐' },
      { type: 'snack', icon: '🍵', label: '加餐' }
    ]
  },
  onLoad(opts) {
    if (opts.type) this.setData({ currentType: opts.type })
  },
  selectType(e) {
    this.setData({ currentType: e.currentTarget.dataset.type })
  },
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({ photo: res.tempFiles[0].tempFilePath })
      }
    })
  },
  removePhoto() {
    this.setData({ photo: '' })
  },
  submit() {
    if (!this.data.content.trim()) return
    const app = getApp()
    const meal = {
      type: this.data.currentType,
      content: this.data.content.trim(),
      photo: this.data.photo,
      time: new Date().toISOString()
    }
    const meals = app.globalData.todayMeals || []
    meals.push(meal)
    app.globalData.todayMeals = meals
    wx.showToast({ title: '已记录', icon: 'success', duration: 1500 })
    setTimeout(() => wx.navigateBack(), 1500)
  }
})
