/**
 * 个人中心页逻辑。
 * 加载会员信息、头像上传和功能入口。
 */
// 个人中心页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')
const DEFAULT_AVATAR = 'http://localhost:2544/images/miniprogram/profile/avatar.png'
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
    leafIcon: 'http://localhost:2544/images/miniprogram/pay-success/leaf.png',
    bellIcon: 'http://localhost:2544/images/miniprogram/cart/bell-icon.png',
    avatarImage: DEFAULT_AVATAR,
    sceneImage: 'http://localhost:2544/images/miniprogram/profile/profile-scene.png',
    benefitImage: 'http://localhost:2544/images/miniprogram/profile/benefit-gift.png',
    userInfo: {
      nickname: '咖啡旅人',
      points: 0
    },
    orderStatus: [
      {
        id: 'pendingPay',
        name: '待付款',
        count: 2,
        icon: 'http://localhost:2544/images/miniprogram/profile/order-pay.png'
      },
      {
        id: 'pendingUse',
        name: '待使用',
        count: 1,
        icon: 'http://localhost:2544/images/miniprogram/profile/order-use.png'
      },
      {
        id: 'delivery',
        name: '配送中',
        count: 0,
        icon: 'http://localhost:2544/images/miniprogram/profile/order-delivery.png'
      },
      {
        id: 'done',
        name: '已完成',
        count: 0,
        icon: 'http://localhost:2544/images/miniprogram/profile/order-done.png'
      },
      {
        id: 'refund',
        name: '退款/售后',
        count: 0,
        icon: 'http://localhost:2544/images/miniprogram/profile/order-refund.png'
      }
    ],
    serviceItems: [
      {
        id: 'coupon',
        name: '优惠券',
        extra: '0 张可用',
        icon: 'http://localhost:2544/images/miniprogram/profile/coupon.png'
      },
      {
        id: 'memberCard',
        name: '会员卡',
        extra: '尊享会员',
        icon: 'http://localhost:2544/images/miniprogram/profile/member-card.png'
      },
      {
        id: 'address',
        name: '地址管理',
        extra: '2 个地址',
        icon: 'http://localhost:2544/images/miniprogram/profile/address.png'
      },
      {
        id: 'service',
        name: '联系客服',
        extra: '7×12 小时在线',
        icon: 'http://localhost:2544/images/miniprogram/profile/service.png'
      },
      {
        id: 'setting',
        name: '设置',
        extra: '',
        icon: 'http://localhost:2544/images/miniprogram/profile/setting.png'
      }
    ],
    activeNav: 'mine',
    navItems
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadUserProfile()
    console.log('个人中心页加载完成')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadUserProfile()
    this.refreshUserStats()
    console.log('个人中心页显示')
  },

  /**
   * 同步页面最新展示数据。
   */
  async refreshUserStats() {
    let orders = store.readOrders()
    try {
      const result = await api.getOrders({ page: 1, pageSize: 100 })
      const list = Array.isArray(result) ? result : (result && result.list) || []
      const member = api.getCurrentMember()
      orders = list
        .filter((order) => !member || !member.id || !order.memberId || Number(order.memberId) === Number(member.id))
        .map(store.buildOrderFromBackend)
    } catch (error) {
      console.warn('个人中心订单统计接口加载失败，使用本地订单兜底', error)
    }
    const pendingCount = orders.filter((order) => order.status === 'pending').length
    const makingCount = orders.filter((order) => order.status === 'making').length
    const doneCount = orders.filter((order) => order.status === 'done').length
    const cancelledCount = orders.filter((order) => order.status === 'cancelled').length
    const orderStatus = this.data.orderStatus.map((item) => {
      if (item.id === 'pendingPay') return { ...item, count: pendingCount }
      if (item.id === 'pendingUse') return { ...item, count: makingCount }
      if (item.id === 'done') return { ...item, count: doneCount }
      if (item.id === 'refund') return { ...item, count: cancelledCount }
      return item
    })
    this.setData({ orderStatus })
  },  async loadUserProfile() {
    const savedAvatar = wx.getStorageSync('xianCoffeeAvatar')
    const savedUserInfo = wx.getStorageSync('xianCoffeeUserInfo') || {}
    let member = api.getCurrentMember() || {}
    try {
      member = await api.refreshCurrentMember() || member
    } catch (error) {
      console.warn('会员信息接口加载失败，使用本地数据兜底', error)
    }
    const hasMember = !!(member && member.id)
    const couponCount = hasMember ? Number(member.coupons || 0) : 0
    const serviceItems = this.data.serviceItems.map((item) => {
      if (item.id === 'coupon') return { ...item, extra: `${couponCount} 张可用` }
      if (item.id === 'memberCard' && hasMember) return { ...item, extra: api.normalizeLevelName(member.levelName) }
      return item
    })
    this.setData({
      avatarImage: savedAvatar || member.avatarUrl || DEFAULT_AVATAR,
      serviceItems,
      userInfo: {
        ...this.data.userInfo,
        ...savedUserInfo,
        nickname: hasMember ? (member.nickname || '咖啡旅人') : (savedUserInfo.nickname || this.data.userInfo.nickname),
        phone: hasMember ? (member.phone || '') : (savedUserInfo.phone || ''),
        points: hasMember ? Number(member.points || 0) : Number(savedUserInfo.points || 0),
        stampCount: hasMember ? Number(member.stampCount || 0) : 0,
        couponCount
      }
    })
  },

  /**
   * 处理当前业务数据。
   */
  chooseAvatarFromSource(sourceType) {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: [sourceType],
        sizeType: ['compressed'],
        success: (res) => {
          const tempFilePath = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
          if (tempFilePath) this.saveAvatarFile(tempFilePath)
        },
        fail: (err) => {
          if (!err || err.errMsg.indexOf('cancel') === -1) {
            wx.showToast({ title: '选择头像失败', icon: 'none' })
          }
        }
      })
      return
    }
    wx.chooseImage({
      count: 1,
      sourceType: [sourceType],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths && res.tempFilePaths[0]
        if (tempFilePath) this.saveAvatarFile(tempFilePath)
      },
      fail: (err) => {
        if (!err || err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '选择头像失败', icon: 'none' })
        }
      }
    })
  },

  /**
   * 保存当前编辑内容。
   */
  saveAvatarFile(tempFilePath) {
    if (!wx.saveFile) {
      this.applyAvatar(tempFilePath)
      return
    }
    wx.saveFile({
      tempFilePath,
      success: (res) => {
        this.applyAvatar(res.savedFilePath || tempFilePath)
      },
      fail: () => {
        this.applyAvatar(tempFilePath)
      }
    })
  },

  /**
   * 处理当前业务数据。
   */
  async applyAvatar(filePath) {
    this.setData({ avatarImage: filePath })
    wx.setStorageSync('xianCoffeeAvatar', filePath)
    try {
      const upload = await api.uploadImage(filePath)
      const member = api.getCurrentMember()
      if (member && member.id) {
        await api.updateMember({ ...member, avatarUrl: upload.imagePath || upload.filename || upload.url })
        await this.loadUserProfile()
      }
    } catch (error) {
      console.warn('头像上传接口失败，保留本地头像', error)
    }
    wx.showToast({ title: '头像已更新', icon: 'success' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleHeaderTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleNoticeTap() {
    wx.showToast({ title: '暂无新消息', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleUserTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleAvatarTap() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 1 ? 'camera' : 'album'
        this.chooseAvatarFromSource(sourceType)
      }
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleNameTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleWelcomeTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleSceneTap() {},

  /**
   * 处理用户点击或输入。
   */
  handlePointsTap() {
    wx.showToast({ title: '积分明细页下一步制作', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleOrderCardTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleViewAllOrdersTap() {
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
  handleServiceTap(event) {
    const id = event.currentTarget.dataset.id
    const actionMap = {
      coupon: '/pages/coupons/coupons',
      memberCard: '/pages/memberCenter/memberCenter',
      address: '/pages/addressManage/addressManage',
      service: '客服功能下一步接入',
      setting: '/pages/settings/settings'
    }
    const target = actionMap[id]
    if (target && target.indexOf('/pages/') === 0) {
      wx.navigateTo({ url: target, fail: () => wx.redirectTo({ url: target }) })
      return
    }
    wx.showToast({ title: target || '功能下一步制作', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleBenefitCardTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleBenefitTap() {
    wx.showToast({ title: '会员福利已领取', icon: 'success' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleBenefitImageTap() {},

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
    console.log('个人中心页预留上拉触底')
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