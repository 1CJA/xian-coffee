/**
 * 门店详情页逻辑。
 * 加载门店信息、图片和门店视频。
 */
const api = require('../../utils/api.js')
// 门店详情页逻辑
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
    storeImage: 'http://localhost:2544/images/miniprogram/store-detail/storefront.png',
    starIcon: 'http://localhost:2544/images/miniprogram/store-detail/star.png',
    storeVideo: 'http://localhost:2544/images/miniprogram/store-detail/store-video.mp4',
    store: {
      name: '栖岸咖啡 · 望江路店',
      rating: '4.9',
      distance: '1.2km',
      openTime: '08:00 - 21:30',
      phone: '0571-88886666',
      address: '杭州市上城区望江路98号',
      intro: '临近江岸的安静咖啡空间，供应现磨咖啡、轻食甜点与当季特调。适合堂食小坐，也支持自提与外卖。'
    },
    serviceTags: [
      {
        id: 'pickup',
        name: '自提',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/pickup.png'
      },
      {
        id: 'dine',
        name: '堂食',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/dine.png'
      },
      {
        id: 'delivery',
        name: '外卖',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/delivery.png'
      }
    ],
    infoRows: [
      {
        id: 'time',
        label: '营业时间',
        value: '08:00 - 21:30',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/time.png'
      },
      {
        id: 'phone',
        label: '联系电话',
        value: '0571-88886666',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/phone.png'
      },
      {
        id: 'address',
        label: '门店地址',
        value: '杭州市上城区望江路98号',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/location.png'
      }
    ],
    introIcon: 'http://localhost:2544/images/miniprogram/store-detail/intro.png',
    actionItems: [
      {
        id: 'nav',
        name: '导航',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/nav.png'
      },
      {
        id: 'call',
        name: '拨号',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/call.png'
      },
      {
        id: 'favorite',
        name: '收藏',
        icon: 'http://localhost:2544/images/miniprogram/store-detail/heart.png'
      }
    ],
    envImages: [
      {
        id: 'env1',
        image: 'http://localhost:2544/images/miniprogram/store-detail/env-1.png'
      },
      {
        id: 'env2',
        image: 'http://localhost:2544/images/miniprogram/store-detail/env-2.png'
      }
    ],
    favorite: false
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadStore()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadStore()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadStore() {
    try {
      const stores = await api.getStores()
      const store = (stores || [])[0]
      if (!store) return
      const nextStore = {
        ...this.data.store,
        name: store.name || this.data.store.name,
        openTime: store.businessHours || this.data.store.openTime,
        phone: store.phone || this.data.store.phone,
        address: store.address || this.data.store.address,
        intro: store.intro || this.data.store.intro
      }
      const infoRows = this.data.infoRows.map((row) => {
        if (row.id === 'time') return { ...row, value: nextStore.openTime }
        if (row.id === 'phone') return { ...row, value: nextStore.phone }
        if (row.id === 'address') return { ...row, value: nextStore.address }
        return row
      })
      this.setData({ store: nextStore, storeImage: store.imageUrl || this.data.storeImage, storeVideo: store.videoUrl || store.videoPath || this.data.storeVideo, infoRows })
    } catch (error) {
      console.warn('门店接口加载失败，使用本地数据兜底', error)
    }
  },
  /**
   * 处理用户点击或输入。
   */
  handleBackTap() {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    if (pages.length > 1) {
      wx.navigateBack()
      return
    }
    wx.redirectTo({ url: '/pages/menu/menu' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStoreImageTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleRatingTap() {
    wx.showToast({ title: '门店评分 4.9', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTagTap(event) {
    const name = event.currentTarget.dataset.name || '服务'
    wx.showToast({ title: `${name}可用`, icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleInfoTap(event) {
    const id = event.currentTarget.dataset.id
    if (id === 'phone') {
      this.handleCallTap()
      return
    }
    if (id === 'address') {
      this.handleNavigateTap()
      return
    }
    wx.showToast({ title: '今日正常营业', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleIntroTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleNavigateTap() {
    wx.showToast({ title: '导航功能待接入地图', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleCallTap() {
    wx.showToast({ title: '拨号功能待接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleFavoriteTap() {
    const favorite = !this.data.favorite
    this.setData({ favorite })
    wx.showToast({ title: favorite ? '已收藏门店' : '已取消收藏', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleActionTap(event) {
    const id = event.currentTarget.dataset.id
    if (id === 'nav') {
      this.handleNavigateTap()
      return
    }
    if (id === 'call') {
      this.handleCallTap()
      return
    }
    this.handleFavoriteTap()
  },


  /**
   * 处理用户点击或输入。
   */
  handleEnvTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleVideoPlay() {
    console.log('门店视频开始播放')
  },

  /**
   * 处理用户点击或输入。
   */
  handleVideoPause() {
    console.log('门店视频暂停播放')
  },

  /**
   * 处理用户点击或输入。
   */
  handleVideoError(event) {
    console.log('门店视频加载失败', event.detail)
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('门店详情页预留上拉触底')
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