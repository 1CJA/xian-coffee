/**
 * 菜单点单页逻辑。
 * 加载分类商品并处理加入购物袋。
 */
// 菜单点单页逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')

const categoryProductIds = {
  hot: ['latte', 'americano', 'cappuccino', 'matchaLatte', 'tiramisu'],
  coffee: ['latte', 'americano', 'cappuccino', 'coconutLatte'],
  tea: ['matchaLatte', 'matchaCream'],
  dessert: ['tiramisu', 'coffeeCheese', 'matchaCake']
}

const categoryTags = {
  hot: { latte: '人气' },
  coffee: { latte: '推荐', coconutLatte: '新品' },
  tea: { matchaLatte: '新品' },
  dessert: { tiramisu: '人气' }
}

/**
 * 生成页面需要的数据。
 */
function buildProducts(categoryId) {
  const allProducts = store.getProducts()
  const tags = categoryTags[categoryId] || {}
  const countMap = store.countCartByProduct()
  let products = []
  if (categoryId === 'hot') {
    products = allProducts.slice(0, 6)
  } else {
    products = allProducts.filter((product) => String(product.categoryId) === String(categoryId))
    if (!products.length && categoryProductIds[categoryId]) {
      products = categoryProductIds[categoryId].map((id) => store.getProduct(id))
    }
  }
  if (!products.length) products = allProducts.slice(0, 6)
  return products.map((product) => ({
    id: product.id,
    name: product.shortName || product.name,
    desc: product.desc,
    price: product.price,
    image: product.image,
    quantity: countMap[product.id] || 0,
    tag: tags[product.id] || ''
  }))
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
    leafImage: 'http://localhost:2544/images/miniprogram/home/leaf.png',
    heroImage: 'http://localhost:2544/images/miniprogram/menu/hero-store.png',
    orderType: '堂食',
    activeCategory: 'hot',
    categories: [
      {
        id: 'hot',
        name: '热门'
      },
      {
        id: 'coffee',
        name: '咖啡'
      },
      {
        id: 'tea',
        name: '茶饮'
      },
      {
        id: 'dessert',
        name: '甜点'
      }
    ],
    products: [],
    cartCount: 0,
    cartTotal: '0.00',
    activeNav: 'menu',
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
    const orderType = options && options.mode ? decodeURIComponent(options.mode) : '堂食'
    this.setData({ orderType })
    this.loadBackendData()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadBackendData()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadBackendData() {
    try {
      const [products, categories] = await Promise.all([api.getProducts(), api.getCategories()])
      store.setBackendProducts(products || [])
      const nextCategories = [{ id: 'hot', name: '热门' }].concat((categories || []).filter((item) => Number(item.status) !== 0).map((item) => ({ id: String(item.id), name: item.name })))
      const activeCategory = nextCategories.some((item) => item.id === this.data.activeCategory) ? this.data.activeCategory : nextCategories[0].id
      this.setData({ categories: nextCategories, activeCategory }, () => this.refreshCartView(activeCategory))
    } catch (error) {
      console.warn('菜单接口加载失败，使用本地数据兜底', error)
      this.refreshCartView()
    }
  },  refreshCartView(categoryId = this.data.activeCategory) {
    const summary = store.getCartSummary()
    this.setData({
      activeCategory: categoryId,
      products: buildProducts(categoryId),
      cartCount: summary.count,
      cartTotal: store.formatMoney(summary.total)
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleBrandTap() {
    wx.showToast({ title: '栖岸咖啡', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleLocationTap() {
    wx.navigateTo({ url: '/pages/storeDetail/storeDetail' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleNotifyTap() {
    wx.showToast({ title: '通知功能后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleHeroTap() {
    wx.navigateTo({ url: '/pages/storeDetail/storeDetail' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTabTap(event) {
    this.refreshCartView(event.currentTarget.dataset.id)
  },

  /**
   * 处理用户点击或输入。
   */
  handleProductTap(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/productDetail/productDetail?id=${id}` })
  },

  /**
   * 处理用户点击或输入。
   */
  handleMinusTap(event) {
    const id = event.currentTarget.dataset.id
    store.decrementProduct(id)
    this.refreshCartView()
  },

  /**
   * 处理用户点击或输入。
   */
  handlePlusTap(event) {
    const id = event.currentTarget.dataset.id
    store.addCartItem(id, 1, store.getDefaultOptions(id))
    this.refreshCartView()
  },

  /**
   * 处理用户点击或输入。
   */
  handleAddTap(event) {
    const id = event.currentTarget.dataset.id
    store.addCartItem(id, 1, store.getDefaultOptions(id))
    this.refreshCartView()
  },

  /**
   * 跳转到目标页面。
   */
  goBagPage() {
    const url = '/pages/bag/bag'
    wx.navigateTo({ url, fail: () => wx.redirectTo({ url }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleCartTap() {
    this.goBagPage()
  },

  /**
   * 处理用户点击或输入。
   */
  handleCheckoutTap() {
    if (this.data.cartCount <= 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' })
      return
    }
    this.goBagPage()
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
    console.log('菜单点单页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadBackendData()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})