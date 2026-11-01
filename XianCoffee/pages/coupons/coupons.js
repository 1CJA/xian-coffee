/**
 * 优惠券页逻辑。
 * 加载用户优惠券并处理选择或返回。
 */
// 优惠券页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')
const allCoupons = [
  {
    id: 'new-user',
    status: 'available',
    statusText: '可使用',
    theme: 'green',
    sideText: '新人专享',
    title: '新人饮品券',
    offerPrefix: '满',
    offerMain: '20',
    offerSuffix: '元减 8 元',
    validDate: '2025.06.30',
    condition: '仅限饮品使用，不可与其他优惠同享',
    threshold: 20,
    amount: 8,
    discountType: 'fixed',
    image: 'http://localhost:2544/images/miniprogram/coupons/coffee.png'
  },
  {
    id: 'member-vip',
    status: 'available',
    statusText: '可使用',
    theme: 'gold',
    sideText: '会员专享',
    title: '会员专享券',
    offerPrefix: '全场饮品',
    offerMain: '9',
    offerSuffix: '折',
    validDate: '2025.07.15',
    condition: '仅限会员使用，不可与其他优惠同享',
    percent: 0.9,
    discountType: 'percent',
    sideIcon: 'http://localhost:2544/images/miniprogram/coupons/crown.png',
    image: 'http://localhost:2544/images/miniprogram/coupons/member.png'
  },
  {
    id: 'dessert-match',
    status: 'available',
    statusText: '可使用',
    theme: 'green',
    sideText: '甜点搭配',
    title: '甜点搭配券',
    offerPrefix: '购买咖啡加',
    offerMain: '1',
    offerSuffix: '元可换购指定甜点',
    validDate: '2025.06.20',
    condition: '需同时购买任意款咖啡，每单限用 1 张',
    amount: 6,
    discountType: 'bundle',
    sideIcon: 'http://localhost:2544/images/miniprogram/coupons/leaf-side.png',
    image: 'http://localhost:2544/images/miniprogram/coupons/cake.png'
  },
  {
    id: 'used-latte',
    status: 'used',
    statusText: '已使用',
    theme: 'green',
    sideText: '饮品券',
    title: '拿铁优惠券',
    offerPrefix: '满',
    offerMain: '25',
    offerSuffix: '元减 5 元',
    validDate: '2025.06.10',
    condition: '已在订单中使用',
    image: 'http://localhost:2544/images/miniprogram/coupons/coffee.png'
  },
  {
    id: 'used-member',
    status: 'used',
    statusText: '已使用',
    theme: 'gold',
    sideText: '会员专享',
    title: '会员饮品券',
    offerPrefix: '第二杯',
    offerMain: '5',
    offerSuffix: '折',
    validDate: '2025.06.18',
    condition: '已在订单中使用',
    sideIcon: 'http://localhost:2544/images/miniprogram/coupons/crown.png',
    image: 'http://localhost:2544/images/miniprogram/coupons/member.png'
  },
  {
    id: 'expired-dessert',
    status: 'expired',
    statusText: '已过期',
    theme: 'green',
    sideText: '甜点搭配',
    title: '甜点搭配券',
    offerPrefix: '甜点立减',
    offerMain: '6',
    offerSuffix: '元',
    validDate: '2025.05.30',
    condition: '优惠券已超过有效期',
    sideIcon: 'http://localhost:2544/images/miniprogram/coupons/leaf-side.png',
    image: 'http://localhost:2544/images/miniprogram/coupons/cake.png'
  }
]


/**
 * 统一后端返回字段。
 */
function normalizeBackendCoupon(item = {}) {
  const status = Number(item.status) === 1 ? 'available' : 'expired'
  const amount = Number(item.amount || 0)
  const minAmount = Number(item.minAmount || 0)
  const type = item.type || 'FULL_REDUCTION'
  return {
    id: String(item.id),
    status,
    statusText: status === 'available' ? '可使用' : '已过期',
    theme: type === 'DISCOUNT' ? 'gold' : 'green',
    sideText: type === 'FREE_DRINK' ? '免单券' : '优惠券',
    title: item.name || item.title || '栖岸优惠券',
    offerPrefix: type === 'DISCOUNT' ? '全场饮品' : (minAmount ? `满${minAmount}` : '立减'),
    offerMain: type === 'DISCOUNT' ? String(amount || 9) : String(amount || 0),
    offerSuffix: type === 'DISCOUNT' ? '折' : '元',
    validDate: String(item.endDate || item.validDate || '').replace(/-/g, '.'),
    condition: item.ruleText || item.rule || '以门店实际规则为准',
    threshold: minAmount,
    amount,
    discountType: type === 'DISCOUNT' ? 'percent' : (type === 'FREE_DRINK' ? 'fixed' : 'fixed'),
    percent: type === 'DISCOUNT' ? Number(amount || 9) / 10 : 1,
    image: item.imageUrl || item.imagePath || 'http://localhost:2544/images/miniprogram/coupons/coffee.png'
  }
}
/**
 * 生成页面需要的数据。
 */
function buildTabs(coupons = allCoupons) {
  return [
    {
      id: 'available',
      name: '可使用',
      count: coupons.filter((item) => item.status === 'available').length
    },
    {
      id: 'used',
      name: '已使用',
      count: coupons.filter((item) => item.status === 'used').length
    },
    {
      id: 'expired',
      name: '已过期',
      count: coupons.filter((item) => item.status === 'expired').length
    }
  ]
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
    leafIcon: 'http://localhost:2544/images/miniprogram/coupons/leaf-title.png',
    activeTab: 'available',
    tabs: buildTabs([]),
    coupons: [],
    displayCoupons: []
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad(options) {
    this.setData({ fromPage: options && options.from ? options.from : '' })
    this.loadCoupons()
    this.updateCoupons(this.data.activeTab)
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadCoupons()
    this.updateCoupons(this.data.activeTab)
  },
  /**
   * 从后端或本地加载数据。
   */
  async loadCoupons() {
    try {
      const member = await api.refreshCurrentMember().catch(() => api.getCurrentMember())
      if (!member || !member.id) {
        const coupons = []
        this.setData({ coupons, tabs: buildTabs(coupons) }, () => this.updateCoupons(this.data.activeTab))
        return
      }
      const [backendCoupons, memberCoupons] = await Promise.all([
        api.getCoupons().catch(() => []),
        api.getMemberCoupons(member.id).catch(() => [])
      ])
      const couponMap = (backendCoupons || []).reduce((map, item) => {
        map[String(item.id)] = item
        return map
      }, {})
      const coupons = (memberCoupons || []).map((record) => {
        const base = normalizeBackendCoupon(couponMap[String(record.couponId)] || {})
        const recordStatus = String(record.status || '').toUpperCase()
        const status = recordStatus === 'UNUSED' ? 'available' : (recordStatus === 'USED' ? 'used' : 'expired')
        return {
          ...base,
          id: String(record.id),
          couponId: String(record.couponId),
          status,
          statusText: status === 'available' ? '可使用' : (status === 'used' ? '已使用' : '已过期')
        }
      })
      this.setData({ coupons, tabs: buildTabs(coupons) }, () => this.updateCoupons(this.data.activeTab))
    } catch (error) {
      console.warn('优惠券接口加载失败', error)
      const coupons = []
      this.setData({ coupons, tabs: buildTabs(coupons) }, () => this.updateCoupons(this.data.activeTab))
    }
  },

  /**
   * 更新当前页面数据。
   */
  updateCoupons(tabId) {
    const displayCoupons = this.data.coupons.filter((item) => item.status === tabId)
    this.setData({ activeTab: tabId, displayCoupons })
  },

  /**
   * 跳转到目标页面。
   */
  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/profile/profile' }) })
  },

  /**
   * 跳转到目标页面。
   */
  goMenuPage() {
    const url = '/pages/menu/menu'
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const method = pages.length >= 9 ? 'redirectTo' : 'navigateTo'
    wx[method]({ url, fail: () => wx.redirectTo({ url }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleSubtitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleTabTap(event) {
    this.updateCoupons(event.currentTarget.dataset.id)
  },

  /**
   * 处理用户点击或输入。
   */
  handleCouponTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleArtTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleNoCouponTap() {
    store.setSelectedCoupon(null)
    wx.showToast({ title: '已取消优惠券', icon: 'success' })
    setTimeout(() => wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/confirmOrder/confirmOrder' }) }), 300)
  },

  /**
   * 处理用户点击或输入。
   */
  handleUseTap(event) {
    const id = event.currentTarget.dataset.id
    const coupon = this.data.coupons.find((item) => item.id === id)
    if (!coupon || coupon.status !== 'available') return
    if (this.data.fromPage === 'confirm') {
      store.setSelectedCoupon({
        id: coupon.id,
        title: coupon.title,
        amount: Number(coupon.amount || 0),
        threshold: Number(coupon.threshold || 0),
        discountType: coupon.discountType || 'fixed',
        percent: Number(coupon.percent || 1)
      })
      wx.showToast({ title: '已选择优惠券', icon: 'success' })
      setTimeout(() => wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/confirmOrder/confirmOrder' }) }), 300)
      return
    }
    wx.showToast({ title: '已选择优惠券', icon: 'success' })
    setTimeout(() => this.goMenuPage(), 500)
  },

  /**
   * 处理用户点击或输入。
   */
  handleStatusTap(event) {
    const id = event.currentTarget.dataset.id
    const coupon = this.data.coupons.find((item) => item.id === id)
    wx.showToast({ title: coupon ? coupon.statusText : '不可使用', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleRuleTap() {
    wx.showToast({ title: '以门店实际规则为准', icon: 'none' })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('优惠券页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadCoupons()
    this.updateCoupons(this.data.activeTab)
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})