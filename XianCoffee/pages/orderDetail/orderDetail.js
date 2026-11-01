/**
 * 订单详情页逻辑。
 * 展示订单明细、金额、状态和取餐信息。
 */
// 订单详情页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')

const mockOrders = {
  'order-making': store.buildOrder({
    id: 'order-making',
    orderNo: '2025051512001234',
    orderTime: '2025-05-15 12:00',
    time: '05-15 12:00',
    pickupCode: '3287',
    items: [
      { productId: 'latte', quantity: 1, options: { temperature: 'hot', cup: 'large', sugar: 'light', extra: 'none' } },
      {
        productId: 'tiramisu',
        quantity: 1,
        options: store.getDefaultOptions('tiramisu')
      },
      {
        productId: 'matchaCake',
        quantity: 1,
        options: store.getDefaultOptions('matchaCake')
      }
    ],
    goodsAmount: 92,
    couponAmount: 6,
    paidAmount: 86,
    remark: '请放在门店自取柜，谢谢'
  }, 'making'),
  'order-done': store.buildOrder({
    id: 'order-done',
    orderNo: '2025051310455678',
    orderTime: '2025-05-13 10:45',
    time: '05-13 10:45',
    pickupCode: '1208',
    pickupText: '05-13 11:05 已取餐',
    items: [
      {
        productId: 'americano',
        quantity: 1,
        options: store.getDefaultOptions('americano')
      },
      {
        productId: 'matchaCake',
        quantity: 1,
        options: store.getDefaultOptions('matchaCake')
      }
    ],
    goodsAmount: 50,
    couponAmount: 14,
    paidAmount: 36
  }, 'done'),
  'order-cancelled': store.buildOrder({
    id: 'order-cancelled',
    orderNo: '2025051210309987',
    orderTime: '2025-05-12 10:30',
    time: '05-12 10:30',
    pickupCode: '----',
    pickupText: '订单已取消',
    items: [{ productId: 'cappuccino', quantity: 1, options: store.getDefaultOptions('cappuccino') }],
    goodsAmount: 26,
    paidAmount: 26
  }, 'cancelled')
}

/**

 * 页面入口配置。

 */

Page({
  // 页面数据配置
  /**
   * 页面状态数据。
   */
  data: {
    backIcon: 'http://localhost:2544/images/miniprogram/cart/back-arrow.png',
    leafIcon: 'http://localhost:2544/images/miniprogram/pay-success/leaf.png',
    storeHero: 'http://localhost:2544/images/miniprogram/order-detail/store-hero.png',
    storeIcon: 'http://localhost:2544/images/miniprogram/order-detail/store-icon.png',
    timeIcon: 'http://localhost:2544/images/miniprogram/order-detail/time-icon.png',
    pickupIcon: 'http://localhost:2544/images/miniprogram/order-detail/pickup-icon.png',
    phoneIcon: 'http://localhost:2544/images/miniprogram/order-detail/phone-icon.png',
    mapIcon: 'http://localhost:2544/images/miniprogram/order-detail/map-icon.png',
    noteIcon: 'http://localhost:2544/images/miniprogram/order-detail/note-icon.png',
    orderId: 'order-making',
    orderNo: '',
    status: 'making',
    statusText: '制作中',
    statusDescLine1: '咖啡师正在精心制作中，',
    statusDescLine2: '请耐心等待～',
    orderTime: '',
    pickupMode: '',
    pickupCode: '',
    pickupTime: '',
    totalCount: 0,
    goods: [],
    goodsAmountText: '0.00',
    couponText: '0.00',
    paidAmountText: '0.00',
    remarkText: '无备注',
    primaryActionText: '再来一单',
    secondaryActionText: '联系客服'
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad(options) {
    this.loadOrder(options && options.id ? decodeURIComponent(options.id) : 'order-making')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {},

  /**
   * 读取页面需要的数据。
   */
  getStatusDesc(order) {
    if (order.status === 'pending') return ['订单待支付，', '请尽快完成付款～']
    if (order.status === 'cancelled') return ['订单已经取消，', '可以重新选购喜欢的商品～']
    if (order.status === 'done') return ['订单已完成，', '欢迎再次光临～']
    return ['咖啡师正在精心制作中，', '请耐心等待～']
  },

  /**
   * 从后端或本地加载数据。
   */
  async loadOrder(id) {
    let order = store.findOrder(id) || mockOrders[id] || mockOrders['order-making']
    try {
      const backendOrder = await api.getOrder(id)
      order = store.buildOrderFromBackend(backendOrder)
      store.saveOrder(order)
    } catch (error) {
      console.warn('订单详情接口加载失败，使用本地数据兜底', error)
    }
    const desc = this.getStatusDesc(order)
    this.setData({
      orderId: order.id,
      orderNo: order.orderNo,
      status: order.status,
      statusText: order.statusText,
      statusDescLine1: desc[0],
      statusDescLine2: desc[1],
      orderTime: order.orderTime,
      pickupMode: order.pickupMode,
      pickupCode: order.pickupCode,
      pickupTime: order.pickupText || order.pickupTime,
      totalCount: order.totalCount,
      goods: order.goods,
      goodsAmountText: order.goodsAmountText,
      couponText: order.couponText,
      paidAmountText: order.paidAmountText,
      remarkText: order.remarkText || '无备注',
      primaryActionText: order.status === 'pending' ? '立即支付' : '再来一单',
      secondaryActionText: order.status === 'pending' ? '取消订单' : '联系客服'
    })
  },

  /**
   * 跳转到目标页面。
   */
  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/myOrders/myOrders' }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleCapsuleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStatusCardTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStatusTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStoreHeroTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleOrderNoTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleOrderTimeTap() {},

  /**
   * 处理用户点击或输入。
   */
  handlePickupModeTap() {},

  /**
   * 处理用户点击或输入。
   */
  handlePickupCodeTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleCopyTap() {
    wx.setClipboardData({ data: this.data.pickupCode })
  },

  /**
   * 处理用户点击或输入。
   */
  handleStoreTap() {
    wx.navigateTo({ url: '/pages/storeDetail/storeDetail' })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePhoneTap() {
    wx.showToast({ title: '电话功能后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleMapTap() {
    wx.showToast({ title: '门店导航后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleGoodsTitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleGoodsTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleAmountTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleRemarkTap() {},

  /**
   * 处理用户点击或输入。
   */
  async handlePrimaryAction() {
    if (this.data.status === 'pending') {
      wx.showLoading({ title: '支付中' })
      let paidOrder = null
      try {
        paidOrder = store.buildOrderFromBackend(await api.payOrder(this.data.orderId))
        store.saveOrder(paidOrder)
      } catch (error) {
        console.warn('订单详情支付接口失败，使用本地订单兜底', error)
        paidOrder = store.updateOrderStatus(this.data.orderId, 'making')
      }
      wx.hideLoading()
      if (paidOrder) wx.navigateTo({ url: '/pages/paySuccess/paySuccess?orderId=' + encodeURIComponent(paidOrder.id) })
      return
    }
    const order = store.findOrder(this.data.orderId) || mockOrders[this.data.orderId]
    if (order && Array.isArray(order.items)) {
      order.items.forEach((item) => store.addCartItem(item.productId, item.quantity, item.options, item.remark))
      wx.navigateTo({ url: '/pages/bag/bag' })
      return
    }
    wx.navigateTo({ url: '/pages/menu/menu' })
  },
  /**
   * 处理用户点击或输入。
   */
  async handleSecondaryAction() {
    if (this.data.status === 'pending') {
      const cancelled = await api.cancelOrder(this.data.orderId).then(store.buildOrderFromBackend).catch(() => store.updateOrderStatus(this.data.orderId, 'cancelled'))
      if (cancelled) {
        wx.showToast({ title: '订单已取消', icon: 'success' })
        this.loadOrder(cancelled.id)
      }
      return
    }
    wx.showToast({ title: '客服功能后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleReorderTap() {
    this.handlePrimaryAction()
  },

  /**
   * 处理用户点击或输入。
   */
  handleServiceTap() {
    this.handleSecondaryAction()
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('订单详情页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadOrder(this.data.orderId)
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})