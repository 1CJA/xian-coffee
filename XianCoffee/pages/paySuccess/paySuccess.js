/**
 * 支付成功页逻辑。
 * 展示支付结果并处理查看订单和返回首页。
 */
// 支付成功页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')

/**

 * 页面入口配置。

 */

Page({
  hasShownPayToast: false,

  // 页面数据配置
  /**
   * 页面状态数据。
   */
  data: {
    leafIcon: 'http://localhost:2544/images/miniprogram/pay-success/leaf.png',
    checkIcon: 'http://localhost:2544/images/miniprogram/pay-success/check.png',
    heroImage: 'http://localhost:2544/images/miniprogram/pay-success/hero.png',
    storeIcon: 'http://localhost:2544/images/miniprogram/pay-success/store.png',
    pickupIcon: 'http://localhost:2544/images/miniprogram/pay-success/pickup.png',
    timeIcon: 'http://localhost:2544/images/miniprogram/pay-success/time.png',
    orderId: '',
    pickupCode: 'A108',
    amountText: '0.00',
    storeName: '栖岸咖啡 · 望江路店',
    takeMethod: '自提',
    pickupTime: '10:40'
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad(options) {
    this.syncPaidOrder(options || {})
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.syncPaidOrder()
    this.showPaySuccessToast()
  },

  /**
   * 处理当前业务数据。
   */
  showPaySuccessToast() {
    if (this.hasShownPayToast) return
    this.hasShownPayToast = true
    wx.showToast({ title: '支付成功', icon: 'success' })
  },

  /**
   * 同步页面最新展示数据。
   */
  async syncPaidOrder(options = {}) {
    const orderId = options.orderId ? decodeURIComponent(options.orderId) : this.data.orderId
    let paidOrder = null
    if (orderId) {
      try {
        paidOrder = store.buildOrderFromBackend(await api.getOrder(orderId))
        store.saveOrder(paidOrder)
      } catch (error) {
        console.warn('支付成功页订单接口加载失败，使用本地订单兜底', error)
      }
    }
    paidOrder = paidOrder || (orderId && store.findOrder(orderId)) || store.getLatestOrder() || {}
    this.setData({
      orderId: paidOrder.id || orderId || '',
      pickupCode: paidOrder.pickupCode || 'A108',
      amountText: paidOrder.amountText || paidOrder.paidAmountText || this.data.amountText,
      storeName: paidOrder.storeName || '栖岸咖啡 · 望江路店',
      takeMethod: paidOrder.takeMethod || '自提',
      pickupTime: paidOrder.pickupText || paidOrder.pickupTime || '10:40'
    })
  },
  /**
   * 处理用户点击或输入。
   */
  handleBrandTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleCheckTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleStatusTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleThanksTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleHeroTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleCodeTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleInfoCardTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleStoreTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleMethodTap() {},
  /**
   * 处理用户点击或输入。
   */
  handleTimeTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleViewOrderTap() {
    wx.navigateTo({ url: '/pages/myOrders/myOrders' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleContinueTap() {
    wx.reLaunch({ url: '/pages/menu/menu' })
  }
})