/**
 * 确认订单页逻辑。
 * 处理订单金额、优惠券、积分抵扣和提交订单。
 */
// 确认订单页逻辑
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
    leafIcon: 'http://localhost:2544/images/miniprogram/cart/leaf-icon.png',
    deleteIcon: 'http://localhost:2544/images/miniprogram/cart/delete-icon.png',
    locationIcon: 'http://localhost:2544/images/miniprogram/confirm-order/location.png',
    couponIcon: 'http://localhost:2544/images/miniprogram/confirm-order/coupon.png',
    pointsIcon: 'http://localhost:2544/images/miniprogram/confirm-order/points.png',
    remarkIcon: 'http://localhost:2544/images/miniprogram/confirm-order/remark.png',
    storeImage: 'http://localhost:2544/images/miniprogram/confirm-order/store.png',
    serviceMode: 'pickup',
    usePoints: true,
    orderItems: [],
    selectedCartItemIds: [],
    orderRemark: '',
    orderRemarkText: '口味、包装、取餐说明等',
    couponLabel: '请选择可用优惠券',
    couponAmount: 0,
    selectedCoupon: null,
    serviceModes: [
      {
        id: 'pickup',
        name: '自提',
        desc: '到店自取',
        icon: 'http://localhost:2544/images/miniprogram/confirm-order/pickup.png'
      },
      {
        id: 'dinein',
        name: '堂食',
        desc: '店内用餐',
        icon: 'http://localhost:2544/images/miniprogram/confirm-order/dine-in.png'
      },
      {
        id: 'delivery',
        name: '外卖',
        desc: '配送到家',
        icon: 'http://localhost:2544/images/miniprogram/confirm-order/delivery.png'
      }
    ],
    goodsAmount: 0,
    pointsAmount: 0,
    totalAmount: 0,
    goodsAmountText: '0.00',
    couponAmountText: '0.00',
    pointsAmountText: '0.00',
    totalAmountText: '0.00',
    currentPoints: 0,
    pointsLabel: '可用 0 积分（抵 ¥0.00）'
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadOrder()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadOrder()
  },

  /**
   * 统一后端返回字段。
   */
  normalizeOrderItems(orderItems) {
    return (orderItems || []).map((item) => ({
      ...item,
      subtotal: item.unitPrice * item.quantity,
      remarkText: item.remark ? `备注：${item.remark}` : ''
    }))
  },

  /**
   * 读取页面需要的数据。
   */
  getCouponAmount(coupon, orderItems, goodsAmount) {
    if (!coupon || goodsAmount <= 0) return 0
    const threshold = Number(coupon.threshold || 0)
    if (threshold > 0 && goodsAmount < threshold) return 0
    if (coupon.discountType === 'percent') {
      const percent = Number(coupon.percent || 1)
      const drinkAmount = orderItems.reduce((sum, item) => {
        const product = store.getProduct(item.productId)
        return product.type === 'drink' ? sum + item.unitPrice * item.quantity : sum
      }, 0)
      return Math.min(goodsAmount, Math.max(0, drinkAmount * (1 - percent)))
    }
    if (coupon.discountType === 'bundle') {
      const hasDrink = orderItems.some((item) => store.getProduct(item.productId).type === 'drink')
      const hasDessert = orderItems.some((item) => store.getProduct(item.productId).type === 'dessert')
      if (!hasDrink || !hasDessert) return 0
    }
    return Math.min(goodsAmount, Number(coupon.amount || 0))
  },

  /**
   * 读取页面需要的数据。
   */
  getCouponLabel(coupon, couponAmount) {
    if (!coupon) return '请选择可用优惠券'
    if (couponAmount > 0) return `${coupon.title}（-¥${store.formatMoney(couponAmount)}）`
    return `${coupon.title}（暂不可用）`
  },

  /**
   * 从后端或本地加载数据。
   */
  loadOrder() {
    const draft = store.readOrderDraft()
    const cartItems = store.readCartItems()
    const selectedCartItemIds = Array.isArray(draft.selectedCartItemIds) && draft.selectedCartItemIds.length
      ? draft.selectedCartItemIds
      : cartItems.map((item) => item.cartItemId)
    const idMap = selectedCartItemIds.reduce((map, id) => {
      map[id] = true
      return map
    }, {})
    const draftItems = Array.isArray(draft.items) && draft.items.length ? draft.items : cartItems.filter((item) => idMap[item.cartItemId])
    const selectedCoupon = store.getSelectedCoupon()
    const member = api.getCurrentMember() || {}
    const currentPoints = Number(member.points || 0)
    this.setData({
      selectedCartItemIds,
      orderItems: this.normalizeOrderItems(draftItems),
      serviceMode: draft.serviceMode || this.data.serviceMode,
      usePoints: typeof draft.usePoints === 'boolean' ? draft.usePoints : this.data.usePoints,
      orderRemark: draft.orderRemark || this.data.orderRemark,
      orderRemarkText: draft.orderRemark || this.data.orderRemarkText,
      selectedCoupon: selectedCoupon || null,
      couponLabel: this.getCouponLabel(selectedCoupon, 0),
      couponAmount: 0,
      currentPoints,
      pointsLabel: this.getPointsLabel(currentPoints)
    }, () => this.syncOrder(this.data.orderItems))
  },

  /**
   * 读取页面需要的数据。
   */
  getPointsLabel(points) {
    const count = Number(points || 0)
    const pointValue = count / 20
    return '可用 ' + count + ' 积分（抵 ¥' + store.formatMoney(pointValue) + '）'
  },

  /**
   * 同步页面最新展示数据。
   */
  syncOrder(orderItems) {
    const normalizedItems = this.normalizeOrderItems(orderItems)
    const goodsAmount = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const couponAmount = this.getCouponAmount(this.data.selectedCoupon, normalizedItems, goodsAmount)
    const availablePointsAmount = Number(this.data.currentPoints || 0) / 20
    const pointsAmount = this.data.usePoints && goodsAmount > 0 ? Math.min(availablePointsAmount, Math.max(0, goodsAmount - couponAmount)) : 0
    const totalAmount = Math.max(0, goodsAmount - couponAmount - pointsAmount)
    this.setData({
      orderItems: normalizedItems,
      goodsAmount,
      couponAmount,
      couponLabel: this.getCouponLabel(this.data.selectedCoupon, couponAmount),
      pointsAmount,
      totalAmount,
      goodsAmountText: store.formatMoney(goodsAmount),
      couponAmountText: store.formatMoney(couponAmount),
      pointsAmountText: store.formatMoney(pointsAmount),
      totalAmountText: store.formatMoney(totalAmount)
    })
    this.persistDraft(normalizedItems)
  },

  /**
   * 处理当前业务数据。
   */
  persistDraft(orderItems = this.data.orderItems) {
    store.writeOrderDraft({
      selectedCartItemIds: this.data.selectedCartItemIds,
      items: orderItems,
      usePoints: this.data.usePoints,
      serviceMode: this.data.serviceMode,
      orderRemark: this.data.orderRemark
    })
  },

  /**
   * 跳转到目标页面。
   */
  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/bag/bag' }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTitleTap() {
    wx.showToast({ title: '确认订单', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleSloganTap() {
    wx.showToast({ title: '慢享好时光', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleClearTap() {
    this.setData({ orderItems: [], selectedCartItemIds: [] })
    store.writeOrderDraft({ selectedCartItemIds: [], items: [] })
    this.syncOrder([])
  },

  /**
   * 处理用户点击或输入。
   */
  handleItemRemarkTap(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.orderItems.find((orderItem) => orderItem.cartItemId === id)
    if (!item) return
    wx.showModal({
      title: '单品备注',
      editable: true,
      placeholderText: '例如：少冰、不要奶盖',
      content: item.remark || '',
      success: (res) => {
        if (!res.confirm) return
        const remark = (res.content || '').trim()
        const orderItems = this.data.orderItems.map((orderItem) => orderItem.cartItemId === id ? { ...orderItem, remark } : orderItem)
        this.syncOrder(orderItems)
      }
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleMinusTap(event) {
    const id = event.currentTarget.dataset.id
    const orderItems = this.data.orderItems.map((item) => (
      item.cartItemId === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
    )).filter((item) => item.quantity > 0)
    this.setData({ selectedCartItemIds: orderItems.map((item) => item.cartItemId) })
    this.syncOrder(orderItems)
  },

  /**
   * 处理用户点击或输入。
   */
  handlePlusTap(event) {
    const id = event.currentTarget.dataset.id
    const orderItems = this.data.orderItems.map((item) => (
      item.cartItemId === id ? { ...item, quantity: item.quantity + 1 } : item
    ))
    this.syncOrder(orderItems)
  },

  /**
   * 处理用户点击或输入。
   */
  handleServiceTitleTap() {
    wx.showToast({ title: '选择服务方式', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleServiceTap(event) {
    this.setData({ serviceMode: event.currentTarget.dataset.id }, () => this.persistDraft())
  },

  /**
   * 处理用户点击或输入。
   */
  handleStoreTap() {
    wx.navigateTo({ url: '/pages/storeDetail/storeDetail' })
  },

  /**
   * 处理当前业务数据。
   */
  openCouponPage() {
    wx.navigateTo({ url: '/pages/coupons/coupons?from=confirm', fail: () => wx.redirectTo({ url: '/pages/coupons/coupons?from=confirm' }) })
  },

  /**
   * 清理本地缓存数据。
   */
  clearSelectedCoupon() {
    store.setSelectedCoupon(null)
    this.setData({
      selectedCoupon: null,
      couponAmount: 0,
      couponLabel: '请选择可用优惠券'
    }, () => this.syncOrder(this.data.orderItems))
  },

  /**
   * 处理用户点击或输入。
   */
  handleCouponTap() {
    this.openCouponPage()
  },

  /**
   * 处理用户点击或输入。
   */
  handlePointsTap() {
    this.setData({ usePoints: !this.data.usePoints }, () => this.syncOrder(this.data.orderItems))
  },

  /**
   * 处理用户点击或输入。
   */
  handlePointsChange(event) {
    this.setData({ usePoints: event.detail.value }, () => this.syncOrder(this.data.orderItems))
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
  handleRemarkTap() {
    wx.showModal({
      title: '订单备注',
      editable: true,
      placeholderText: '口味、包装、取餐说明等',
      content: this.data.orderRemark,
      success: (res) => {
        if (!res.confirm) return
        const orderRemark = (res.content || '').trim()
        this.setData({
          orderRemark,
          orderRemarkText: orderRemark || '口味、包装、取餐说明等'
        }, () => this.persistDraft())
      }
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleStoreImageTap() {
    wx.navigateTo({ url: '/pages/storeDetail/storeDetail' })
  },


  /**
   * 生成页面需要的数据。
   */
  buildBackendOrderPayload(status) {
    const member = api.getCurrentMember()
    if (!member || !member.id) throw new Error('请先登录')
    const orderItems = this.data.orderItems.map((item) => {
      const product = store.getProduct(item.productId)
      const productId = Number(product.backendId || item.productId)
      if (!Number.isFinite(productId)) throw new Error('购物袋中存在未同步商品，请从菜单重新选择')
      return {
        productId,
        productName: item.name,
        productImagePath: item.image,
        unitPrice: Number(item.unitPrice || item.price || 0),
        quantity: Number(item.quantity || 1),
        specText: item.spec || '',
        itemAmount: Number(item.unitPrice || item.price || 0) * Number(item.quantity || 1)
      }
    })
    const orderTypeMap = { pickup: 'PICKUP', dinein: 'DINE_IN', delivery: 'DELIVERY' }
    return {
      memberId: member.id,
      storeId: 1,
      orderType: orderTypeMap[this.data.serviceMode] || 'PICKUP',
      status: 'PENDING_PAYMENT',
      totalAmount: Number(this.data.goodsAmount || 0),
      couponAmount: Number(this.data.couponAmount || 0),
      pointsAmount: Number(this.data.pointsAmount || 0),
      payAmount: Number(this.data.totalAmount || 0),
      usePoints: this.data.usePoints ? Math.round(Number(this.data.pointsAmount || 0) * 20) : 0,
      memberCouponId: this.data.selectedCoupon && Number(this.data.selectedCoupon.id) ? Number(this.data.selectedCoupon.id) : null,
      remark: this.data.orderRemark || '',
      orderItems
    }
  },

  /**
   * 提交当前表单数据。
   */
  async submitBackendOrder(status) {
    const created = await api.createOrder(this.buildBackendOrderPayload(status))
    const finalOrder = status === 'making' ? await api.payOrder(created.id) : created
    const order = store.buildOrderFromBackend(finalOrder)
    this.finishSubmit(order)
    return order
  },
  /**
   * 生成页面需要的数据。
   */
  buildSubmitOrder(status) {
    return store.buildOrder({
      items: this.data.orderItems,
      serviceMode: this.data.serviceMode,
      goodsAmount: this.data.goodsAmount,
      couponAmount: this.data.couponAmount,
      pointsAmount: this.data.pointsAmount,
      paidAmount: this.data.totalAmount,
      remark: this.data.orderRemark
    }, status)
  },

  /**
   * 处理当前业务数据。
   */
  finishSubmit(order) {
    store.saveOrder(order)
    store.removeCartItems(this.data.selectedCartItemIds)
    store.clearOrderDraft()
    store.setSelectedCoupon(null)
  },

  /**
   * 跳转到目标页面。
   */
  goSubmitTarget(url) {
    setTimeout(() => {
      wx.navigateTo({
        url,
        fail: () => wx.redirectTo({ url, fail: () => wx.reLaunch({ url }) })
      })
    }, 80)
  },

  /**
   * 处理当前业务数据。
   */
  async payNow() {
    wx.showLoading({ title: '提交中' })
    try {
      const paidOrder = await this.submitBackendOrder('making')
      wx.hideLoading()
      this.goSubmitTarget('/pages/paySuccess/paySuccess?orderId=' + encodeURIComponent(paidOrder.id))
    } catch (error) {
      console.warn('提交支付订单接口失败，使用本地订单兜底', error)
      const paidOrder = this.buildSubmitOrder('making')
      this.finishSubmit(paidOrder)
      wx.hideLoading()
      this.goSubmitTarget('/pages/paySuccess/paySuccess?orderId=' + encodeURIComponent(paidOrder.id))
    }
  },

  /**
   * 处理当前业务数据。
   */
  async payLater() {
    wx.showLoading({ title: '提交中' })
    try {
      await this.submitBackendOrder('pending')
      wx.hideLoading()
      this.goSubmitTarget('/pages/myOrders/myOrders?status=pending')
    } catch (error) {
      console.warn('提交待付款订单接口失败，使用本地订单兜底', error)
      const pendingOrder = this.buildSubmitOrder('pending')
      this.finishSubmit(pendingOrder)
      wx.hideLoading()
      this.goSubmitTarget('/pages/myOrders/myOrders?status=pending')
    }
  },
  /**
   * 处理用户点击或输入。
   */
  handleSubmitTap() {
    if (this.data.orderItems.length === 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' })
      return
    }
    wx.showModal({
      title: '选择支付方式',
      content: '请选择立即支付或稍后付款',
      cancelText: '稍后付款',
      confirmText: '立即支付',
      confirmColor: '#74805d',
      success: (res) => {
        if (res.confirm) {
          this.payNow()
          return
        }
        if (res.cancel) this.payLater()
      }
    })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('确认订单页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadOrder()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})