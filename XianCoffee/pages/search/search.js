/**
 * 搜索页面逻辑。
 * 处理商品关键字搜索和分类快捷筛选。
 */
// 搜索页面逻辑
const store = require('../../utils/mockStore.js')
const api = require('../../utils/api.js')

/**
 * 生成页面需要的数据。
 */
function buildSearchProducts() {
  return store.getProducts().map((product) => ({
    id: product.id,
    name: product.shortName || product.name,
    desc: product.desc,
    price: product.price,
    image: product.image,
    categoryId: product.categoryId,
    tag: product.type === 'drink' ? '饮品' : '甜点'
  }))
}

const categoryProductIds = {
  latte: ['latte', 'coconutLatte', 'matchaLatte'],
  americano: ['americano', 'latte'],
  dessert: ['tiramisu', 'matchaCake'],
  snack: ['tiramisu', 'coffeeCheese'],
  tea: ['matchaLatte', 'matchaCream']
}

/**
 * 读取页面需要的数据。
 */
function getProductsByCategory(categoryId) {
    // 商品数据：保存当前页面展示的商品列表。
const products = buildSearchProducts()
  const ids = categoryProductIds[categoryId] || products.filter((item) => String(item.categoryId) === String(categoryId)).map((item) => item.id)
  return ids.map((id) => products.find((item) => item.id === id) || (() => {
    const product = store.getProduct(id)
    return { id, name: product.shortName || product.name, desc: product.desc, price: product.price, image: product.image }
  })()).filter(Boolean)
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
    keyword: '',
    brandLeaf: 'http://localhost:2544/images/miniprogram/search/brand-leaf.png',
    trashIcon: 'http://localhost:2544/images/miniprogram/search/trash.png',
    fireIcon: 'http://localhost:2544/images/miniprogram/search/fire.png',
    recentKeywords: ['拿铁', '提拉米苏', '抹茶拿铁', '栖岸拿铁'],
    hotKeywords: ['生椰拿铁', '焦糖玛奇朵', '卡布奇诺', '巴斯克芝士蛋糕'],
    categories: [
      {
        id: 'latte',
        name: '拿铁',
        icon: 'http://localhost:2544/images/miniprogram/search/cat-latte.png'
      },
      {
        id: 'americano',
        name: '美式',
        icon: 'http://localhost:2544/images/miniprogram/search/cat-americano.png'
      },
      {
        id: 'dessert',
        name: '甜点',
        icon: 'http://localhost:2544/images/miniprogram/search/cat-dessert.png'
      },
      {
        id: 'snack',
        name: '轻食',
        icon: 'http://localhost:2544/images/miniprogram/search/cat-snack.png'
      },
      {
        id: 'tea',
        name: '茶饮',
        icon: 'http://localhost:2544/images/miniprogram/search/cat-tea.png'
      }
    ],
    products: buildSearchProducts(),
    resultCount: buildSearchProducts().length
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadBackendData()
    console.log('搜索页加载完成')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadBackendData()
    console.log('搜索页显示')
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadBackendData() {
    try {
      const [products, categories] = await Promise.all([api.getProducts(), api.getCategories()])
      store.setBackendProducts(products || [])
      const nextCategories = (categories || []).filter((item) => Number(item.status) !== 0).map((item) => ({
        id: String(item.id),
        name: item.name,
        icon: 'http://localhost:2544/images/miniprogram/search/cat-latte.png'
      }))
      const nextProducts = buildSearchProducts()
      this.setData({ categories: nextCategories.length ? nextCategories : this.data.categories, products: nextProducts, resultCount: nextProducts.length })
    } catch (error) {
      console.warn('搜索接口加载失败，使用本地数据兜底', error)
    }
  },
  /**
   * 处理用户点击或输入。
   */
  handleInput(event) {
        // 搜索关键字：用于筛选列表数据。
const keyword = event.detail.value || ''
    const allProducts = buildSearchProducts()
    const nextProducts = keyword ? allProducts.filter((item) => item.name.indexOf(keyword) >= 0 || item.desc.indexOf(keyword) >= 0) : allProducts
    this.setData({ keyword, products: nextProducts, resultCount: nextProducts.length })
  },

  /**
   * 处理用户点击或输入。
   */
  handleSearchConfirm(event) {
    const keyword = event.detail.value || this.data.keyword
    if (!keyword) return
    this.addRecent(keyword)
  },

  /**
   * 处理当前业务数据。
   */
  addRecent(keyword) {
    const nextKeywords = [keyword].concat(this.data.recentKeywords.filter((item) => item !== keyword)).slice(0, 4)
    const allProducts = buildSearchProducts()
    const nextProducts = allProducts.filter((item) => item.name.indexOf(keyword) >= 0 || item.desc.indexOf(keyword) >= 0)
    this.setData({ recentKeywords: nextKeywords, keyword, products: nextProducts.length ? nextProducts : allProducts, resultCount: nextProducts.length || allProducts.length })
  },

  /**
   * 处理用户点击或输入。
   */
  handleCancelTap() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/menu/menu' }) })
  },

  /**
   * 处理用户点击或输入。
   */
  handleClearRecentTap() {
    this.setData({ recentKeywords: [] })
  },

  /**
   * 处理用户点击或输入。
   */
  handleKeywordTap(event) {
    const keyword = event.currentTarget.dataset.keyword || ''
    this.addRecent(keyword)
  },

  /**
   * 处理用户点击或输入。
   */
  handleCategoryTap(event) {
    const categoryId = event.currentTarget.dataset.id
    const name = event.currentTarget.dataset.name || ''
    if (categoryId) {
      const nextProducts = getProductsByCategory(categoryId)
      this.setData({ products: nextProducts, resultCount: nextProducts.length, keyword: name })
      return
    }
    if (name) this.addRecent(name)
  },

  /**
   * 处理用户点击或输入。
   */
  handleProductTap(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/productDetail/productDetail?id=${id}` })
  },

  /**
   * 处理用户点击或输入。
   */
  handleAddTap(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    store.addCartItem(id, 1, store.getDefaultOptions(id))
    wx.showToast({ title: '已加入购物袋', icon: 'success' })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('搜索页预留上拉触底')
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