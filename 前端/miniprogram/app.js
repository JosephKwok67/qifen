App({
  globalData: {
    theme: 'light',
    userInfo: null,
    todayMeals: []
  },

  onLaunch() {
    const sys = wx.getSystemInfoSync()
    this.globalData.theme = sys.theme || 'light'
    this.checkUpdate()
  },

  onThemeChange({ theme }) {
    this.globalData.theme = theme
  },

  checkUpdate() {
    if (!wx.getUpdateManager) return
    const um = wx.getUpdateManager()
    um.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success(res) { if (res.confirm) um.applyUpdate() }
      })
    })
  }
})
