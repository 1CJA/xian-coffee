/**
 * 我的订单页逻辑。
 * 加载订单列表并处理支付、取消和详情跳转。
 */
// 我的订单页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')

const mockOrders = [
  store.buildOrder({
    id: 'order-making',
    orderNo: '2025051512001234',
    storeName: '栖岸咖啡 · 望江路店',
    orderTime: '2025-05-15 12:00',
    time: '05-15 12:00',
    sortTime: 1747281600000,
    pickupCode: '3287',
    items: [
      {
        productId: 'americano',
        quantity: 1,
        options: store.getDefaultOptions('americano')
      },
      {
        productId: 'cappuccino',
        quantity: 1,
        options: store.getDefaultOptions('cappuccino')
      },
      {
        productId: 'matchaLatte',
        quantity: 1,
        options: store.getDefaultOptions('matchaLatte')
      }
    ],
    goodsAmount: 78,
    couponAmount: 5,
    paidAmount: 73
  }, 'making'),
  store.buildOrder({
    id: 'order-done',
    orderNo: '2025051310455678',
    status: 'done',
    statusText: '已完成',
    statusClass: 'done',
    storeName: '栖岸咖啡 · 望江路店',
    orderTime: '2025-05-13 10:45',
    time: '05-13 10:45',
    sortTime: 1747104356000,
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
  store.buildOrder({
    id: 'order-cancelled',
    orderNo: '2025051210309987',
    storeName: '栖岸咖啡 · 望江路店',
    orderTime: '2025-05-12 10:30',
    time: '05-12 10:30',
    sortTime: 1747017099000,
    pickupCode: '----',
    pickupText: '订单已取消',
    items: [{ productId: 'cappuccino', quantity: 1, options: store.getDefaultOptions('cappuccino') }],
    goodsAmount: 26,
    paidAmount: 26
  }, 'cancelled')
]

/**

 * 页面入口配置。

 */

Page({
  // 页面数据配置
  /**
   * 页面状态数据。
   */
  data: {
    backIcon: 'http://localhost:2544/images/miniprogram/my-orders/back-green.png',
    leafIcon: 'http://localhost:2544/images/miniprogram/pay-success/leaf.png',
    storeIcon: 'http://localhost:2544/images/miniprogram/my-orders/store-icon.png',
    pickupIcon: 'http://localhost:2544/images/miniprogram/my-orders/pickup-icon.png',
    activeTab: 'all',
    tabs: [
      {
        id: 'all',
        name: '全部'
      },
      {
        id: 'pending',
        name: '待付款'
      },
      {
        id: 'making',
        name: '制作中'
      },
      {
        id: 'done',
        name: '已完成'
      },
      {
        id: 'cancelled',
        name: '已取消'
      }
    ],
    orders: [],
    displayOrders: [],
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
  onLoad(options) {
    const activeTab = this.normalizeTabId(options && options.status)
    this.setData({ activeTab }, () => this.loadOrders())
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadOrders()
  },

  /**
   * 统一后端返回字段。
   */
  normalizeTabId(status) {
    const tabId = status === 'pendingPay' ? 'pending' : (status || 'all')
    return this.data.tabs.some((tab) => tab.id === tabId) ? tabId : 'all'
  },

  /**
   * 从后端或本地加载数据。
   */
  async loadOrders() {
    const storedOrders = store.readOrders()
    let orders = []
    try {
      const result = await api.getOrders({ page: 1, pageSize: 100 })
      const list = Array.isArray(result) ? result : (result && result.list) || []
      const member = api.getCurrentMember()
      const backendOrders = list
        .filter((order) => !member || !member.id || !order.memberId || Number(order.memberId) === Number(member.id))
        .map(store.buildOrderFromBackend)
      backendOrders.forEach((order) => store.saveOrder(order))
      orders = backendOrders
    } catch (error) {
      console.warn('订单列表接口加载失败，使用本地订单兜底', error)
      const seen = {}
      orders = storedOrders.concat(mockOrders).filter((order) => {
        const key = order.id || order.orderNo
        if (!key || seen[key]) return false
        seen[key] = true
        return true
      })
    }
    orders = orders.sort((a, b) => Number(b.sortTime || 0) - Number(a.sortTime || 0))
    this.setData({ orders }, () => this.filterOrders(this.data.activeTab))
  },
  /**
   * 处理当前业务数据。
   */
  filterOrders(tabId) {
    const displayOrders = tabId === 'all' ? this.data.orders : this.data.orders.filter((order) => order.status === tabId)
    this.setData({ activeTab: tabId, displayOrders })
  },

  /**
   * 处理当前业务数据。
   */
  findDisplayOrder(id) {
    return this.data.orders.find((order) => order.id === id || order.orderNo === id)
  },

  /**
   * 处理用户点击或输入。
   */
  handleHeaderTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleSubtitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleBackTap() {
    wx.redirectTo({ url: '/pages/profile/profile', fail: () => wx.navigateTo({ url: '/pages/profile/profile' }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTabTap(event) {
    this.filterOrders(event.currentTarget.dataset.id)
  },

  /**
   * 处理用户点击或输入。
   */
  handleOrderTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStatusTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleOrderNoTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleVisualTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleGoodsTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleSummaryTap() {},

  /**
   * 处理用户点击或输入。
   */
  handlePickupTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleDetailTap(event) {
    const id = event.currentTarget.dataset.id || 'order-making'
    wx.navigateTo({ url: '/pages/orderDetail/orderDetail?id=' + encodeURIComponent(id) })
  },

  /**
   * 处理用户点击或输入。
   */
  async handlePayTap(event) {
    const id = event.currentTarget.dataset.id
    wx.showLoading({ title: '支付中' })
    let paidOrder = null
    try {
      paidOrder = store.buildOrderFromBackend(await api.payOrder(id))
      store.saveOrder(paidOrder)
    } catch (error) {
      console.warn('订单支付接口失败，使用本地订单兜底', error)
      paidOrder = store.updateOrderStatus(id, 'making')
    }
    wx.hideLoading()
    if (!paidOrder) {
      wx.showToast({ title: '暂无待支付订单', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/paySuccess/paySuccess?orderId=' + encodeURIComponent(paidOrder.id) })
  },
  /**
   * 处理用户点击或输入。
   */
  handleCancelTap(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这笔待付款订单吗？',
      cancelText: '再想想',
      confirmText: '确认取消',
      confirmColor: '#74805d',
      success: async (res) => {
        if (!res.confirm) return
        const cancelledOrder = await api.cancelOrder(id).then(store.buildOrderFromBackend).catch(() => store.updateOrderStatus(id, 'cancelled'))
        if (!cancelledOrder) {
          wx.showToast({ title: '暂无可取消订单', icon: 'none' })
          return
        }
        wx.showToast({ title: '订单已取消', icon: 'success' })
        this.loadOrders()
      }
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleReorderTap(event) {
    const id = event.currentTarget.dataset.id
    const order = this.findDisplayOrder(id)
    if (order && Array.isArray(order.items)) {
      order.items.forEach((item) => store.addCartItem(item.productId, item.quantity, item.options, item.remark))
      wx.showToast({ title: '已加入购物袋', icon: 'success' })
      setTimeout(() => wx.navigateTo({ url: '/pages/bag/bag' }), 300)
      return
    }
    wx.navigateTo({ url: '/pages/menu/menu' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleNavTap(event) {
    const id = event.currentTarget.dataset.id
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
    console.log('我的订单页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadOrders()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})