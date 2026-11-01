/**
 * 商品详情页逻辑。
 * 处理商品规格选择、数量和加入购物袋。
 */
// 商品详情页逻辑
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
    heroImage: 'http://localhost:2544/images/miniprogram/product-detail/main-coffee.png',
    aboutImage: 'http://localhost:2544/images/miniprogram/product-detail/about-beans.png',
    cartIcon: 'http://localhost:2544/images/miniprogram/product-detail/cart-icon.png',
    shareIcon: 'http://localhost:2544/images/miniprogram/product-detail/share-icon.png',
    productId: 'latte',
    product: store.getProduct('latte'),
    quantity: 1,
    currentPrice: 32,
    showMoreExtra: false,
    selectedOptions: store.getDefaultOptions('latte'),
    extraMoreOptions: [
      {
        label: '椰乳 +3',
        value: 'coconutMilk',
        price: 3
      },
      {
        label: '奶盖 +4',
        value: 'milkFoam',
        price: 4
      },
      {
        label: '浓缩 +5',
        value: 'espressoShot',
        price: 5
      }
    ],
    optionGroups: [
      {
        key: 'temperature',
        title: '温度',
        en: 'TEMPERATURE',
        options: [
          {
            label: '热',
            value: 'hot',
            price: 0,
            icon: 'http://localhost:2544/images/miniprogram/product-detail/hot-icon.png'
          },
          {
            label: '温',
            value: 'warm',
            price: 0
          },
          {
            label: '冰',
            value: 'ice',
            price: 0,
            icon: 'http://localhost:2544/images/miniprogram/product-detail/cold-icon.png'
          }
        ]
      },
      {
        key: 'cup',
        title: '杯型',
        en: 'CUP TYPE',
        options: [
          {
            label: '中杯',
            value: 'middle',
            price: 0
          },
          {
            label: '大杯',
            value: 'large',
            price: 4
          },
          {
            label: '超大杯',
            value: 'extraLarge',
            price: 6,
            wide: true
          }
        ]
      },
      {
        key: 'sugar',
        title: '糖度',
        en: 'SUGAR LEVEL',
        options: [
          {
            label: '无糖',
            value: 'none',
            price: 0
          },
          {
            label: '少糖',
            value: 'light',
            price: 0
          },
          {
            label: '半糖',
            value: 'half',
            price: 0
          },
          {
            label: '标准糖',
            value: 'normal',
            price: 0,
            wide: true
          }
        ]
      },
      {
        key: 'extra',
        title: '加料',
        en: 'EXTRA',
        options: [
          {
            label: '不加料',
            value: 'none',
            price: 0
          },
          {
            label: '燕麦奶 +3',
            value: 'oatMilk',
            price: 3,
            wide: true
          },
          {
            label: '香草糖浆 +3',
            value: 'vanilla',
            price: 3,
            wide: true
          },
          {
            label: '更多',
            value: 'more',
            price: 0,
            more: true
          }
        ]
      }
    ]
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad(options) {
    const id = options && options.id ? decodeURIComponent(options.id) : 'latte'
    this.loadProduct(id)
  },
  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.updatePrice()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadProduct(id) {
    try {
      const productData = await api.getProduct(id)
      store.setBackendProducts([productData])
    } catch (error) {
      console.warn('商品详情接口加载失败，使用本地数据兜底', error)
    }
    const product = store.getProduct(id)
    const selectedOptions = store.getDefaultOptions(product.id)
    this.setData({
      productId: product.id,
      product,
      heroImage: product.detailImage || product.cartImage || product.image || this.data.heroImage,
      selectedOptions,
      quantity: 1
    })
    this.updatePrice()
  },
  /**
   * 更新当前页面数据。
   */
  updatePrice() {
    this.setData({ currentPrice: store.getUnitPrice(this.data.productId, this.data.selectedOptions) })
  },

  /**
   * 跳转到目标页面。
   */
  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/menu/menu' }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleShareTap() {
    wx.showToast({ title: '分享功能后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleHeroTap() {
    wx.showToast({ title: this.data.product.shortName || this.data.product.name, icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleAboutTap() {
    wx.showToast({ title: '精选咖啡豆与新鲜原料制作', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleOptionTap(event) {
    const { group, value } = event.currentTarget.dataset
    if (group === 'extra' && value === 'more') {
      this.setData({ showMoreExtra: !this.data.showMoreExtra })
      return
    }
    this.setData({
      [`selectedOptions.${group}`]: value,
      showMoreExtra: group === 'extra' ? false : this.data.showMoreExtra
    })
    this.updatePrice()
  },

  /**
   * 处理用户点击或输入。
   */
  handleExtraMoreTap(event) {
    const value = event.currentTarget.dataset.value
    this.setData({
      'selectedOptions.extra': value,
      showMoreExtra: true
    })
    this.updatePrice()
  },

  /**
   * 处理用户点击或输入。
   */
  handleMinusTap() {
    this.setData({ quantity: Math.max(1, this.data.quantity - 1) })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePlusTap() {
    this.setData({ quantity: this.data.quantity + 1 })
  },

  /**
   * 处理用户点击或输入。
   */
  handleAddCartTap() {
    store.addCartItem(this.data.productId, this.data.quantity, this.data.selectedOptions)
    wx.showToast({ title: '已加入购物袋', icon: 'success' })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('商品详情页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.updatePrice()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})
