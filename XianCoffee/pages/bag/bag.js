/**
 * 购物袋页逻辑。
 * 维护购物袋商品、数量、优惠和结算入口。
 */
// 购物袋页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')

/**

 * 页面入口配置。

 */

Page({
  // 页面数据配置
  /**
   * 页面状态数据。
   */
  data: {
    leafImage: 'http://localhost:2544/images/miniprogram/cart/leaf-icon.png',
    backIcon: 'http://localhost:2544/images/miniprogram/cart/back-arrow.png',
    locationIcon: 'http://localhost:2544/images/miniprogram/cart/location-icon.png',
    bellIcon: 'http://localhost:2544/images/miniprogram/cart/bell-icon.png',
    deliveryImage: 'http://localhost:2544/images/miniprogram/cart/delivery-scooter.png',
    deleteIcon: 'http://localhost:2544/images/miniprogram/cart/delete-icon.png',
    couponIcon: 'http://localhost:2544/images/miniprogram/cart/coupon-icon.png',
    pointsIcon: 'http://localhost:2544/images/miniprogram/cart/points-icon.png',
    safeIcon: 'http://localhost:2544/images/miniprogram/cart/safe-icon.png',
    usePoints: true,
    currentPoints: 0,
    pointsText: '可用 0 积分',
    checkedMap: {},
    cartItems: [],
    needCartScroll: false,
    recommendItems: [
      {
        id: 'americano',
        name: '美式',
        desc: '中杯 / 热 / 标准糖',
        price: 22,
        image: 'http://localhost:2544/images/miniprogram/cart/americano.png'
      },
      {
        id: 'matchaCake',
        name: '抹茶芝士蛋糕',
        desc: '轻盈绵密，清新回甘',
        price: 28,
        image: 'http://localhost:2544/images/miniprogram/cart/matcha-cake.png'
      }
    ],
    allChecked: true,
    selectedCount: 0,
    totalPrice: 0,
    totalPriceText: '0.00',
    deliveryGap: 68,
    activeNav: 'bag',
    navItems: [
      {
        id: 'home',
        name: '首页',
        icon: 'http://localhost:2544/images/miniprogram/my-orders/tab-home.png',
        activeIcon: 'http://localhost:2544/images/miniprogram/my-orders/tab-home-active.png'
      },
      {
        id: 'menu',
        name: '菜单',
        icon: 'http://localhost:2544/images/miniprogram/my-orders/tab-menu.png',
        activeIcon: 'http://localhost:2544/images/miniprogram/my-orders/tab-menu-active.png'
      },
      {
        id: 'member',
        name: '会员',
        icon: 'http://localhost:2544/images/miniprogram/my-orders/tab-member.png',
        activeIcon: 'http://localhost:2544/images/miniprogram/my-orders/tab-member-active.png'
      },
      {
        id: 'bag',
        name: '购物袋',
        icon: 'http://localhost:2544/images/miniprogram/my-orders/tab-bag.png',
        activeIcon: 'http://localhost:2544/images/miniprogram/my-orders/tab-bag-active.png'
      },
      {
        id: 'mine',
        name: '我的',
        icon: 'http://localhost:2544/images/miniprogram/my-orders/tab-mine.png',
        activeIcon: 'http://localhost:2544/images/miniprogram/my-orders/tab-mine-active.png'
      }
    ]
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadCart()
    this.loadMemberPoints()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadCart()
    this.loadMemberPoints()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadMemberPoints() {
    let member = api.getCurrentMember() || {}
    try {
      member = await api.refreshCurrentMember() || member
    } catch (error) {
      console.warn('购物袋会员积分加载失败，使用本地会员缓存', error)
    }
    const currentPoints = Number(member.points || 0)
    this.setData({
      currentPoints,
      pointsText: '可用 ' + currentPoints + ' 积分',
      usePoints: currentPoints > 0 ? this.data.usePoints : false
    })
  },
  /**
   * 从后端或本地加载数据。
   */
  loadCart() {
    const cartItems = store.readCartItems()
    const checkedMap = { ...this.data.checkedMap }
    cartItems.forEach((item) => {
      if (typeof checkedMap[item.cartItemId] !== 'boolean') checkedMap[item.cartItemId] = true
    })
    Object.keys(checkedMap).forEach((id) => {
      if (!cartItems.some((item) => item.cartItemId === id)) delete checkedMap[id]
    })
    this.syncCart(cartItems, checkedMap, false)
  },

  /**
   * 同步页面最新展示数据。
   */
  syncCart(cartItems, checkedMap = this.data.checkedMap, shouldSave = true) {
    const nextItems = cartItems.map((item) => ({ ...item, checked: checkedMap[item.cartItemId] !== false }))
    const selectedItems = nextItems.filter((item) => item.checked)
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const allChecked = nextItems.length > 0 && selectedItems.length === nextItems.length
    this.setData({
      checkedMap,
      cartItems: nextItems,
      needCartScroll: nextItems.length > 2,
      allChecked,
      selectedCount: selectedItems.length,
      totalPrice,
      totalPriceText: store.formatMoney(totalPrice),
      deliveryGap: Math.max(0, 68 - totalPrice)
    })
    if (shouldSave) store.writeCartItems(nextItems)
  },

  /**
   * 跳转到目标页面。
   */
  goMenuPage() {
    const url = '/pages/menu/menu'
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const previousPage = pages.length > 1 ? pages[pages.length - 2] : null
    if (previousPage && previousPage.route === 'pages/menu/menu') {
      wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url }) })
      return
    }
    wx.redirectTo({ url })
  },

  /**
   * 处理用户点击或输入。
   */
  handleBrandTap() {
    this.goMenuPage()
  },

  /**
   * 处理用户点击或输入。
   */
  handleTitleTap() {
    wx.showToast({ title: '购物袋', icon: 'none' })
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
  handleBellTap() {
    wx.showToast({ title: '通知功能后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleDeliveryTap() {
    this.goMenuPage()
  },

  /**
   * 处理用户点击或输入。
   */
  handleSelectTap(event) {
    const id = event.currentTarget.dataset.id
    const checkedMap = { ...this.data.checkedMap, [id]: !this.data.checkedMap[id] }
    this.syncCart(this.data.cartItems, checkedMap, false)
  },

  /**
   * 处理用户点击或输入。
   */
  handleSelectAllTap() {
    const nextChecked = !this.data.allChecked
    const checkedMap = this.data.cartItems.reduce((map, item) => {
      map[item.cartItemId] = nextChecked
      return map
    }, {})
    this.syncCart(this.data.cartItems, checkedMap, false)
  },

  /**
   * 处理用户点击或输入。
   */
  handleProductTap(event) {
    const productId = event.currentTarget.dataset.productId || event.currentTarget.dataset.id
    if (!productId) return
    wx.navigateTo({ url: `/pages/productDetail/productDetail?id=${productId}` })
  },

  /**
   * 处理用户点击或输入。
   */
  handleDeleteTap(event) {
    const id = event.currentTarget.dataset.id
    const nextItems = store.removeCartItem(id)
    const checkedMap = { ...this.data.checkedMap }
    delete checkedMap[id]
    this.syncCart(nextItems, checkedMap, false)
  },

  /**
   * 处理用户点击或输入。
   */
  handleMinusTap(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.cartItems.find((cartItem) => cartItem.cartItemId === id)
    if (!item) return
    const nextItems = store.updateCartItemQuantity(id, Math.max(0, item.quantity - 1))
    this.syncCart(nextItems, this.data.checkedMap, false)
  },

  /**
   * 处理用户点击或输入。
   */
  handlePlusTap(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.cartItems.find((cartItem) => cartItem.cartItemId === id)
    if (!item) return
    const nextItems = store.updateCartItemQuantity(id, item.quantity + 1)
    this.syncCart(nextItems, this.data.checkedMap, false)
  },

  /**
   * 处理用户点击或输入。
   */
  handleLikeTitleTap() {
    wx.showToast({ title: '猜你喜欢', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleRecommendTap(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/productDetail/productDetail?id=${id}` })
  },

  /**
   * 处理用户点击或输入。
   */
  handleRecommendAddTap(event) {
    const id = event.currentTarget.dataset.id
    store.addCartItem(id, 1, store.getDefaultOptions(id))
    this.loadCart()
  },

  /**
   * 处理用户点击或输入。
   */
  handleCouponTap() {
    wx.navigateTo({ url: '/pages/coupons/coupons?from=cart' })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePointsTap() {
    this.setData({ usePoints: !this.data.usePoints })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePointsChange(event) {
    this.setData({ usePoints: event.detail.value })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePointsSwitchTap() {
    this.handlePointsTap()
  },

  /**
   * 处理用户点击或输入。
   */
  handleTotalTap() {
    wx.showToast({ title: `合计 ¥${this.data.totalPriceText}`, icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleCheckoutTap() {
    if (this.data.selectedCount <= 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' })
      return
    }
    const selectedItems = this.data.cartItems.filter((item) => this.data.checkedMap[item.cartItemId] !== false)
    store.writeOrderDraft({
      selectedCartItemIds: selectedItems.map((item) => item.cartItemId),
      items: selectedItems,
      usePoints: this.data.usePoints,
      serviceMode: 'pickup',
      orderRemark: ''
    })
    wx.navigateTo({ url: '/pages/confirmOrder/confirmOrder', fail: () => wx.redirectTo({ url: '/pages/confirmOrder/confirmOrder' }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleGoMenuTap() {
    this.goMenuPage()
  },

  /**
   * 处理用户点击或输入。
   */
  handleSafeTap() {
    wx.showToast({ title: '安全保障', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleNavTap(event) {
    const id = event.currentTarget.dataset.id
    if (id === this.data.activeNav) return
    const routeMap = {
      home: '/pages/entry/entry',
      menu: '/pages/menu/menu',
      member: '/pages/memberCenter/memberCenter',
      bag: '/pages/bag/bag',
      mine: '/pages/profile/profile'
    }
    const url = routeMap[id]
    if (!url) return
    wx.redirectTo({ url, fail: () => wx.navigateTo({ url }) })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('购物袋页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadCart()
    this.loadMemberPoints()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})