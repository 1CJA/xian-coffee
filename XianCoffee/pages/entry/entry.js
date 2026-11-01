/**
 * 功能入口页逻辑。
 * 处理轮播图、功能入口、门店视频和底部导航。
 */
const api = require('../../utils/api.js')
// 功能入口页逻辑
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
    storefrontImage: 'http://localhost:2544/images/miniprogram/entry/storefront-cutout.png',
    memberImage: 'http://localhost:2544/images/miniprogram/entry/vip-cutout.png',
    stampImage: 'http://localhost:2544/images/miniprogram/entry/stamp-cutout.png',
    carouselImages: [
      { id: 1, image: 'http://localhost:2544/images/miniprogram/entry/banner-latte.jpg' },
      { id: 2, image: 'http://localhost:2544/images/miniprogram/entry/banner-dessert.jpg' },
      { id: 3, image: 'http://localhost:2544/images/miniprogram/entry/banner-member.jpg' }
    ],
    orderTypes: [
      {
        id: 1,
        name: '自提',
        en: 'TAKE AWAY',
        image: 'http://localhost:2544/images/miniprogram/entry/takeaway-cutout.png'
      },
      {
        id: 2,
        name: '堂食',
        en: 'DINE IN',
        image: 'http://localhost:2544/images/miniprogram/entry/dinein-cutout.png'
      },
      {
        id: 3,
        name: '外卖',
        en: 'DELIVERY',
        image: 'http://localhost:2544/images/miniprogram/entry/delivery-cutout.png'
      }
    ],
    activeNav: 'home',
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
    ]  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadBanners()
    console.log('功能入口页加载完成')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadBanners()
    console.log('功能入口页显示')
  },

  /**
   * 从后端或本地加载数据。
   */
  async loadBanners() {
    try {
      const banners = await api.getBanners()
      const carouselImages = (banners || [])
        .filter((item) => Number(item.status) !== 0)
        .map((item) => ({
          id: item.id,
          image: item.imageUrl || item.imagePath || item.image,
          title: item.title || ''
        }))
        .filter((item) => item.image)
      if (carouselImages.length) this.setData({ carouselImages })
    } catch (error) {
      console.warn('轮播图接口加载失败，使用本地轮播图兜底', error)
    }
  },
  /**
   * 处理用户点击或输入。
   */
  handleBannerTap() {
    wx.showToast({ title: '欢迎光临栖岸咖啡', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleOrderTypeTap(event) {
    const mode = event.currentTarget.dataset.name || '堂食'
    wx.navigateTo({ url: `/pages/menu/menu?mode=${encodeURIComponent(mode)}` })
  },

  /**
   * 处理用户点击或输入。
   */
  handleMemberTap() {
    wx.navigateTo({ url: '/pages/memberCenter/memberCenter' })
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
    console.log('功能入口页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadBanners()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})