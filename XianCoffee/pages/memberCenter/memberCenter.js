/**
 * 会员中心页逻辑。
 * 展示会员积分、余额、优惠券和权益信息。
 */
const api = require('../../utils/api.js')
// 会员中心页逻辑
const navItems = [
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
    coffeeImage: 'http://localhost:2544/images/miniprogram/member-center/coffee-card.png',
    walletIcon: 'http://localhost:2544/images/miniprogram/member-center/wallet.png',
    pointsIcon: 'http://localhost:2544/images/miniprogram/member-center/points-bean.png',
    couponIcon: 'http://localhost:2544/images/miniprogram/member-center/coupon-ticket.png',
    stampImage: 'http://localhost:2544/images/miniprogram/member-center/stamp-card.png',
    benefitImage: 'http://localhost:2544/images/miniprogram/member-center/benefit-gift.png',
    memberDayImage: 'http://localhost:2544/images/miniprogram/member-center/member-day.png',
    activeNav: 'member',
    memberInfo: {
      cardNo: 'NO. 8888 8888 8888',
      name: '栖岸咖啡',
      enName: "QI'AN COFFEE",
      level: 'VIP',
      levelText: '',
      points: 0,
      balance: '0.00',
      couponCount: 0
    },
    assets: [
      {
        id: 'balance',
        label: '余额(元)',
        value: '0.00',
        icon: 'http://localhost:2544/images/miniprogram/member-center/wallet.png'
      },
      {
        id: 'points',
        label: '积分(分)',
        value: '0',
        icon: 'http://localhost:2544/images/miniprogram/member-center/points-bean.png'
      },
      {
        id: 'coupon',
        label: '优惠券(张)',
        value: '0',
        icon: 'http://localhost:2544/images/miniprogram/member-center/coupon-ticket.png'
      }
    ],
    orderStatus: [
      {
        id: 'pendingPay',
        name: '待付款',
        icon: 'http://localhost:2544/images/miniprogram/member-center/order-pay.png'
      },
      {
        id: 'pendingUse',
        name: '待使用',
        icon: 'http://localhost:2544/images/miniprogram/member-center/order-use.png'
      },
      {
        id: 'delivery',
        name: '配送中',
        icon: 'http://localhost:2544/images/miniprogram/member-center/order-delivery.png'
      },
      {
        id: 'done',
        name: '已完成',
        icon: 'http://localhost:2544/images/miniprogram/member-center/order-done.png'
      },
      {
        id: 'refund',
        name: '退款/售后',
        icon: 'http://localhost:2544/images/miniprogram/member-center/order-refund.png'
      }
    ],
    navItems
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadMemberInfo()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadMemberInfo()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadMemberInfo() {
    let member = api.getCurrentMember() || {}
    try {
      member = await api.refreshCurrentMember() || member
    } catch (error) {
      console.warn('会员中心接口加载失败，使用本地数据兜底', error)
    }
    let couponList = Array.isArray(member.couponList) ? member.couponList : []
    try {
      if (member.id) couponList = await api.getMemberCoupons(member.id)
    } catch (error) {
      console.warn('会员优惠券数量加载失败，使用会员接口数量', error)
    }
    const points = Number(member.points || 0)
    const balance = Number(member.balance || 0)
    const coupons = couponList.length ? couponList.filter((item) => String(item.status || '').toUpperCase() === 'UNUSED').length : Number(member.coupons || 0)
    const rawLevel = api.normalizeLevelName(member.levelName || this.data.memberInfo.levelText)
    const shortLevel = api.getLevelShortName(rawLevel)
    const nextInfo = {
      ...this.data.memberInfo,
      cardNo: member.memberNo || `NO. ${String(member.id || 8888).padStart(4, '0')} 8888 8888`,
      level: shortLevel,
      levelText: '',
      points,
      balance: balance.toFixed(2),
      couponCount: coupons
    }
    const assets = this.data.assets.map((item) => {
      if (item.id === 'balance') return { ...item, value: balance.toFixed(2) }
      if (item.id === 'points') return { ...item, value: String(points) }
      if (item.id === 'coupon') return { ...item, value: String(coupons) }
      return item
    })
    this.setData({ memberInfo: nextInfo, assets })
  },
  /**
   * 处理用户点击或输入。
   */
  handleBackTap() {
    wx.redirectTo({
      url: '/pages/profile/profile',
      fail: () => wx.navigateTo({ url: '/pages/profile/profile' })
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleVipCardTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleCardPointsTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleAssetTap(event) {
    const id = event.currentTarget.dataset.id
    const routeMap = {
      coupon: '/pages/coupons/coupons'
    }
    const url = routeMap[id]
    if (url) {
      wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
    }
  },

  /**
   * 处理用户点击或输入。
   */
  handleStampTap() {
    wx.navigateTo({ url: '/pages/stampCard/stampCard' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleBenefitTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleMemberDayTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleMemberDayDetailTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleAllOrdersTap() {
    wx.navigateTo({ url: '/pages/myOrders/myOrders' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleOrderStatusTap(event) {
    const status = event.currentTarget.dataset.id || 'all'
    wx.navigateTo({ url: `/pages/myOrders/myOrders?status=${status}` })
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
    console.log('会员中心页预留上拉触底')
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