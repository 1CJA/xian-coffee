/**
 * 小程序入口逻辑。
 * 初始化全局数据和启动状态。
 */
function installSafeNavigation() {
  if (wx.__xianCoffeeSafeNavigationInstalled) return
  wx.__xianCoffeeSafeNavigationInstalled = true

  const nativeNavigateTo = wx.navigateTo.bind(wx)
  const nativeRedirectTo = wx.redirectTo.bind(wx)

  wx.navigateTo = function safeNavigateTo(options = {}) {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    if (pages.length >= 9) {
      return nativeRedirectTo({
        ...options,
        fail(error) {
          if (typeof options.fail === 'function') {
            options.fail(error)
            return
          }
          console.warn('页面栈接近上限，redirectTo 跳转失败', error)
        }
      })
    }
    return nativeNavigateTo(options)
  }
}

installSafeNavigation()
App({
  globalData: {
    userInfo: null,
    cartCount: 2
  }
})
