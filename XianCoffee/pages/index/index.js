/**
 * 欢迎首页逻辑。
 * 展示欢迎页并处理进入系统跳转。
 */
// 首页欢迎页逻辑
/**
 * 页面入口配置。
 */
Page({
  // 页面数据配置
  /**
   * 页面状态数据。
   */
  data: {
    leafImage: 'http://localhost:2544/images/miniprogram/home/leaf.png',
    shopImage: 'http://localhost:2544/images/miniprogram/home/shop-transparent.png',
    cupLogoImage: 'http://localhost:2544/images/miniprogram/home/cup-logo.png'
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    console.log('首页欢迎页加载完成')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    console.log('首页欢迎页显示')
  },

  /**
   * 跳转到目标页面。
   */
  goEntry() {
    const loggedIn = !!wx.getStorageSync('xianCoffeeLoggedIn')
    if (!loggedIn) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    wx.navigateTo({ url: '/pages/entry/entry' })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('首页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})