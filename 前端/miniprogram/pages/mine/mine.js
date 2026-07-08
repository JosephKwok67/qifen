Page({
  data: {
    nickname: '七分用户',
    avatarLetter: '七',
    isDark: false
  },
  onShow() {
    const sys = wx.getSystemInfoSync()
    this.setData({ isDark: sys.theme === 'dark' })
  },
  toggleTheme(e) {
    const isDark = e.detail ? e.detail.value : !this.data.isDark
    this.setData({ isDark })
    wx.showToast({ title: isDark ? '深色模式' : '浅色模式', icon: 'none', duration: 1000 })
  },
  goHistory() {
    wx.showToast({ title: '即将上线', icon: 'none' })
  },
  about() {
    wx.showModal({
      title: '关于七分',
      content: '十分太满，七分刚好。\n吃饭是这样，生活也是。\n\n一个懂你的饮食记录伙伴。',
      showCancel: false
    })
  }
})
