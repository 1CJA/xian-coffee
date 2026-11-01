/**
 * 小程序本地数据工具。
 * 维护购物袋、订单、会员和页面共享数据。
 */
const CART_ITEMS_KEY = 'xianCoffeeCartItems'
const LEGACY_CART_KEY = 'xianCoffeeMenuCart'
const ORDER_DRAFT_KEY = 'xianCoffeeOrderDraft'
const ORDERS_KEY = 'xianCoffeeOrders'
const LATEST_ORDER_KEY = 'xianCoffeeLatestOrder'
const SELECTED_COUPON_KEY = 'xianCoffeeSelectedCoupon'

const PRODUCT_ORDER = ['latte', 'americano', 'cappuccino', 'matchaLatte', 'matchaCream', 'tiramisu', 'coffeeCheese', 'matchaCake', 'coconutLatte']

const PRODUCT_MAP = {
  latte: { id: 'latte', name: '栖岸拿铁', shortName: '拿铁', desc: '香醇浓郁，奶香顺滑', detailDesc: '经典意式浓缩融合丝滑奶香，口感醇厚顺滑，回味绵长。', price: 32, image: 'http://localhost:2544/images/miniprogram/menu/latte.png', cartImage: 'http://localhost:2544/images/miniprogram/cart/latte.png', detailImage: 'http://localhost:2544/images/miniprogram/product-detail/main-coffee.png', type: 'drink' },
  americano: { id: 'americano', name: '美式咖啡', shortName: '美式', desc: '醇厚清爽，回归本味', detailDesc: '清爽咖啡香气，保留浓缩本味，适合需要轻盈提神的时刻。', price: 22, image: 'http://localhost:2544/images/miniprogram/menu/americano.png', cartImage: 'http://localhost:2544/images/miniprogram/cart/americano.png', type: 'drink' },
  cappuccino: { id: 'cappuccino', name: '卡布奇诺', shortName: '卡布奇诺', desc: '绵密奶泡，平衡柔和', detailDesc: '绵密奶泡覆盖浓缩咖啡，入口柔和，咖啡香与奶香平衡。', price: 26, image: 'http://localhost:2544/images/miniprogram/menu/cappuccino.png', cartImage: 'http://localhost:2544/images/miniprogram/menu/cappuccino.png', type: 'drink' },
  matchaLatte: { id: 'matchaLatte', name: '抹茶拿铁', shortName: '抹茶拿铁', desc: '清新抹茶，香浓顺滑', detailDesc: '清新抹茶与顺滑牛奶融合，茶香轻盈，口感细腻。', price: 30, image: 'http://localhost:2544/images/miniprogram/menu/matcha-latte.png', cartImage: 'http://localhost:2544/images/miniprogram/cart/matcha-latte.png', type: 'drink' },
  matchaCream: { id: 'matchaCream', name: '抹茶奶霜', shortName: '抹茶奶霜', desc: '茶香轻盈，奶霜细腻', detailDesc: '茶香清雅，奶霜细腻，层次轻盈。', price: 29, image: 'http://localhost:2544/images/miniprogram/menu/matcha-latte.png', cartImage: 'http://localhost:2544/images/miniprogram/cart/matcha-latte.png', type: 'drink' },
  tiramisu: { id: 'tiramisu', name: '提拉米苏', shortName: '提拉米苏', desc: '经典意式，入口即化', detailDesc: '经典意式风味，咖啡香与奶酪香交织，入口即化。', price: 32, image: 'http://localhost:2544/images/miniprogram/menu/tiramisu.png', cartImage: 'http://localhost:2544/images/miniprogram/cart/tiramisu.png', type: 'dessert' },
  coffeeCheese: { id: 'coffeeCheese', name: '咖啡奶酪杯', shortName: '咖啡奶酪杯', desc: '咖啡微苦，奶酪柔滑', detailDesc: '咖啡微苦搭配柔滑奶酪，甜度温和。', price: 26, image: 'http://localhost:2544/images/miniprogram/menu/cappuccino.png', cartImage: 'http://localhost:2544/images/miniprogram/menu/cappuccino.png', type: 'dessert' },
  matchaCake: { id: 'matchaCake', name: '抹茶芝士蛋糕', shortName: '抹茶芝士蛋糕', desc: '轻盈绵密，清新回甘', detailDesc: '抹茶清香和芝士奶香融合，适合搭配咖啡。', price: 28, image: 'http://localhost:2544/images/miniprogram/cart/matcha-cake.png', cartImage: 'http://localhost:2544/images/miniprogram/cart/matcha-cake.png', type: 'dessert' },
  coconutLatte: { id: 'coconutLatte', name: '生椰拿铁', shortName: '生椰拿铁', desc: '椰香清甜，清爽不腻', detailDesc: '椰乳香气与咖啡融合，清甜轻盈。', price: 30, image: 'http://localhost:2544/images/miniprogram/search/coconut-latte.png', cartImage: 'http://localhost:2544/images/miniprogram/search/coconut-latte.png', type: 'drink' }
}


/**
 * 处理当前业务数据。
 */
function inferProductType(product = {}) {
  const text = `${product.categoryName || ''}${product.name || ''}${product.shortName || ''}`
  return /甜|蛋糕|提拉米苏|轻食|点心|芝士/.test(text) ? 'dessert' : 'drink'
}

/**
 * 统一后端返回字段。
 */
function normalizeBackendProduct(product = {}) {
  const id = String(product.id || product.productId || product.name || 'latte')
  return {
    id,
    backendId: product.id,
    name: product.name || '栖岸咖啡',
    shortName: product.shortName || product.name || '咖啡',
    desc: product.description || product.desc || '',
    detailDesc: product.detailDescription || product.description || product.desc || '',
    price: Number(product.price || 0),
    image: product.imageUrl || product.imagePath || product.image || 'http://localhost:2544/images/miniprogram/menu/latte.png',
    cartImage: product.imageUrl || product.imagePath || product.cartImage || product.image || 'http://localhost:2544/images/miniprogram/cart/latte.png',
    detailImage: product.detailImageUrl || product.detailImagePath || product.imageUrl || product.imagePath || product.detailImage || 'http://localhost:2544/images/miniprogram/product-detail/main-coffee.png',
    type: product.type || inferProductType(product),
    categoryId: product.categoryId,
    categoryName: product.categoryName || '',
    specOptions: product.specOptions || {}
  }
}

/**
 * 写入页面或缓存数据。
 */
function setBackendProducts(products = []) {
  const nextOrder = []
  ;(products || []).forEach((product) => {
    if (Number(product.status) === 0) return
    const nextProduct = normalizeBackendProduct(product)
    PRODUCT_MAP[nextProduct.id] = nextProduct
    nextOrder.push(nextProduct.id)
  })
  if (nextOrder.length) PRODUCT_ORDER.splice(0, PRODUCT_ORDER.length, ...nextOrder)
  return getProducts()
}

/**
 * 转换后端状态字段。
 */
function mapBackendStatus(status) {
  const statusMap = {
    PENDING_PAYMENT: 'pending',
    PENDING: 'pending',
    PAID: 'making',
    MAKING: 'making',
    COMPLETED: 'done',
    DONE: 'done',
    CANCELLED: 'cancelled'
  }
  return statusMap[status] || status || 'making'
}

/**
 * 生成页面需要的数据。
 */
function buildOrderFromBackend(order = {}) {
  const status = mapBackendStatus(order.status)
  const items = (order.orderItems || order.items || []).map((item) => {
    const productId = String(item.productId || item.id || 'latte')
    return normalizeCartItem({
      productId,
      name: item.productName || item.name,
      image: item.productImageUrl || item.productImagePath || item.image,
      unitPrice: Number(item.unitPrice || item.price || 0),
      quantity: Number(item.quantity || 1),
      spec: item.specText || item.spec || '',
      options: item.options || {}
    })
  })
  return buildOrder({
    id: String(order.id || order.orderNo || ''),
    orderNo: order.orderNo,
    storeName: order.storeName,
    orderTime: String(order.createdAt || order.orderTime || '').replace('T', ' ').slice(0, 16),
    time: String(order.createdAt || order.orderTime || '').replace('T', ' ').slice(5, 16),
    sortTime: order.createdAt ? new Date(String(order.createdAt).replace(/-/g, '/')).getTime() : Date.now(),
    pickupCode: order.pickupCode,
    items,
    goodsAmount: Number(order.totalAmount || 0),
    couponAmount: Number(order.couponAmount || 0),
    pointsAmount: Number(order.pointsAmount || 0),
    paidAmount: Number(order.payAmount || order.totalAmount || 0),
    remark: order.remark || '',
    serviceMode: order.orderType === 'DELIVERY' ? 'delivery' : (order.orderType === 'DINE_IN' ? 'dinein' : 'pickup')
  }, status)
}
const OPTION_LABELS = {
  temperature: { hot: '热', warm: '温', ice: '冰' },
  cup: { middle: '中杯', large: '大杯', extraLarge: '超大杯' },
  sugar: { none: '无糖', light: '少糖', half: '半糖', normal: '标准糖' },
  extra: { none: '不加料', oatMilk: '燕麦奶', vanilla: '香草糖浆', coconutMilk: '椰乳', milkFoam: '奶盖', espressoShot: '浓缩' }
}

const OPTION_PRICES = {
  cup: { middle: 0, large: 4, extraLarge: 6 },
  extra: { none: 0, oatMilk: 3, vanilla: 3, coconutMilk: 3, milkFoam: 4, espressoShot: 5 }
}

/**
 * 复制本地缓存数据。
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * 处理当前业务数据。
 */
function readStorage(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
  } catch (error) {
    return fallback
  }
}

/**
 * 处理当前业务数据。
 */
function writeStorage(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (error) {
    console.log('mock storage write failed', key, error)
  }
}

/**
 * 读取页面需要的数据。
 */
function getProduct(id) {
  return PRODUCT_MAP[id] ? clone(PRODUCT_MAP[id]) : clone(PRODUCT_MAP.latte)
}

/**
 * 读取页面需要的数据。
 */
function getProducts(ids) {
  return (ids || PRODUCT_ORDER).map((id) => PRODUCT_MAP[id]).filter(Boolean).map(clone)
}

/**
 * 读取页面需要的数据。
 */
function getDefaultOptions(productId) {
  const product = getProduct(productId)
  if (product.type === 'dessert') {
    return { temperature: '', cup: '', sugar: '', extra: 'none' }
  }
  return { temperature: 'hot', cup: 'middle', sugar: 'light', extra: 'none' }
}

/**
 * 统一后端返回字段。
 */
function normalizeOptions(productId, options = {}) {
  return { ...getDefaultOptions(productId), ...(options || {}) }
}

/**
 * 读取页面需要的数据。
 */
function getOptionLabel(group, value) {
  return (OPTION_LABELS[group] && OPTION_LABELS[group][value]) || ''
}

/**
 * 读取页面需要的数据。
 */
function getOptionPrice(group, value) {
  return Number((OPTION_PRICES[group] && OPTION_PRICES[group][value]) || 0)
}

/**
 * 读取页面需要的数据。
 */
function getSpecText(productId, options = {}) {
  const product = getProduct(productId)
  if (product.type === 'dessert') return '经典口味'
  const nextOptions = normalizeOptions(productId, options)
  const labels = [
    getOptionLabel('cup', nextOptions.cup),
    getOptionLabel('temperature', nextOptions.temperature),
    getOptionLabel('sugar', nextOptions.sugar)
  ].filter(Boolean)
  const extraLabel = getOptionLabel('extra', nextOptions.extra)
  if (extraLabel && extraLabel !== '不加料') labels.push(extraLabel)
  return labels.join(' / ')
}

/**
 * 读取页面需要的数据。
 */
function getUnitPrice(productId, options = {}) {
  const product = getProduct(productId)
  const nextOptions = normalizeOptions(productId, options)
  return product.price + getOptionPrice('cup', nextOptions.cup) + getOptionPrice('extra', nextOptions.extra)
}

/**
 * 读取页面需要的数据。
 */
function getCartItemId(productId, options = {}) {
  const nextOptions = normalizeOptions(productId, options)
  return [productId, nextOptions.temperature || 'none', nextOptions.cup || 'none', nextOptions.sugar || 'none', nextOptions.extra || 'none'].join('__')
}

/**
 * 统一后端返回字段。
 */
function normalizeCartItem(item) {
  const productId = item.productId || item.id || 'latte'
  const product = getProduct(productId)
  const options = normalizeOptions(productId, item.options || item.specs || {})
  const cartItemId = item.cartItemId || getCartItemId(productId, options)
  const unitPrice = Number(item.unitPrice || item.price || getUnitPrice(productId, options))
  const quantity = Math.max(0, Number(item.quantity) || 0)
  return {
    id: cartItemId,
    cartItemId,
    productId,
    name: item.name || product.name,
    shortName: product.shortName,
    image: item.image || product.cartImage || product.image,
    options,
    spec: item.spec || getSpecText(productId, options),
    remark: item.remark || '',
    unitPrice,
    price: unitPrice,
    priceText: unitPrice.toFixed(2),
    quantity,
    subtotal: unitPrice * quantity,
    checked: item.checked !== false
  }
}

/**
 * 处理当前业务数据。
 */
function migrateLegacyCart() {
  const legacy = readStorage(LEGACY_CART_KEY, {}) || {}
  if (Array.isArray(legacy)) return legacy.map(normalizeCartItem).filter((item) => item.quantity > 0)
  return Object.keys(legacy).map((productId) => {
    const quantity = Number(legacy[productId]) || 0
    if (!PRODUCT_MAP[productId] || quantity <= 0) return null
    return normalizeCartItem({ productId, quantity, options: getDefaultOptions(productId) })
  }).filter(Boolean)
}

/**
 * 处理当前业务数据。
 */
function readCartItems() {
  const stored = readStorage(CART_ITEMS_KEY, null)
  const items = Array.isArray(stored) ? stored : migrateLegacyCart()
  return items.map(normalizeCartItem).filter((item) => item.quantity > 0)
}

/**
 * 同步页面最新展示数据。
 */
function syncLegacyCart(items) {
  const map = {}
  items.forEach((item) => {
    map[item.productId] = (map[item.productId] || 0) + Number(item.quantity || 0)
  })
  writeStorage(LEGACY_CART_KEY, map)
}

/**
 * 处理当前业务数据。
 */
function writeCartItems(items) {
  const nextItems = (items || []).map(normalizeCartItem).filter((item) => item.quantity > 0)
  writeStorage(CART_ITEMS_KEY, nextItems)
  syncLegacyCart(nextItems)
  return nextItems
}

/**
 * 处理当前业务数据。
 */
function addCartItem(productId, quantity = 1, options = {}, remark = '') {
  const nextOptions = normalizeOptions(productId, options)
  const cartItemId = getCartItemId(productId, nextOptions)
  const items = readCartItems()
  const index = items.findIndex((item) => item.cartItemId === cartItemId)
  if (index >= 0) {
    items[index].quantity += Number(quantity) || 1
    if (remark) items[index].remark = remark
  } else {
    items.push(normalizeCartItem({ productId, quantity, options: nextOptions, remark }))
  }
  return writeCartItems(items)
}

/**
 * 处理当前业务数据。
 */
function decrementProduct(productId) {
  const items = readCartItems()
  const index = items.findIndex((item) => item.productId === productId)
  if (index >= 0) {
    items[index].quantity -= 1
  }
  return writeCartItems(items)
}

/**
 * 更新当前页面数据。
 */
function updateCartItemQuantity(cartItemId, quantity) {
  const items = readCartItems().map((item) => item.cartItemId === cartItemId ? { ...item, quantity } : item)
  return writeCartItems(items)
}

/**
 * 删除当前选中数据。
 */
function removeCartItem(cartItemId) {
  return writeCartItems(readCartItems().filter((item) => item.cartItemId !== cartItemId))
}

/**
 * 删除当前选中数据。
 */
function removeCartItems(cartItemIds = []) {
  const idMap = cartItemIds.reduce((map, id) => ({ ...map, [id]: true }), {})
  return writeCartItems(readCartItems().filter((item) => !idMap[item.cartItemId]))
}

/**
 * 处理当前业务数据。
 */
function countCartByProduct() {
  return readCartItems().reduce((map, item) => {
    map[item.productId] = (map[item.productId] || 0) + item.quantity
    return map
  }, {})
}

/**
 * 读取页面需要的数据。
 */
function getCartSummary(items = readCartItems()) {
  return items.reduce((summary, item) => {
    summary.count += Number(item.quantity) || 0
    summary.total += Number(item.unitPrice || item.price || 0) * (Number(item.quantity) || 0)
    return summary
  }, { count: 0, total: 0 })
}

/**
 * 处理当前业务数据。
 */
function writeOrderDraft(draft) {
  writeStorage(ORDER_DRAFT_KEY, draft || {})
}

/**
 * 处理当前业务数据。
 */
function readOrderDraft() {
  return readStorage(ORDER_DRAFT_KEY, {}) || {}
}

/**
 * 清理本地缓存数据。
 */
function clearOrderDraft() {
  try { wx.removeStorageSync(ORDER_DRAFT_KEY) } catch (error) {}
}

/**
 * 格式化页面展示文本。
 */
function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

/**
 * 处理当前业务数据。
 */
function pad(value) {
  return String(value).padStart(2, '0')
}

/**
 * 读取页面需要的数据。
 */
function getTimeInfo() {
  const now = new Date()
  return {
    value: now.getTime(),
    shortText: `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    fullText: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  }
}

/**
 * 读取页面需要的数据。
 */
function getTakeMethod(serviceMode) {
  if (serviceMode === 'delivery') return '外卖'
  if (serviceMode === 'dinein') return '堂食'
  return '自提'
}

/**
 * 生成页面需要的数据。
 */
function buildOrder(payload = {}, status = 'making') {
  const time = getTimeInfo()
  const orderNo = payload.orderNo || ('QC' + time.value)
  const statusMap = {
    pending: { statusText: '待付款', statusClass: 'pending', pickupText: '请在 15 分钟内完成支付', canPay: true, canReorder: false },
    making: { statusText: '制作中', statusClass: 'making', pickupText: '预计 10:40 可取餐', canPay: false, canReorder: true },
    done: { statusText: '已完成', statusClass: 'done', pickupText: '已取餐', canPay: false, canReorder: true },
    cancelled: { statusText: '已取消', statusClass: 'cancelled', pickupText: '订单已取消', canPay: false, canReorder: false }
  }
  const statusInfo = statusMap[status] || statusMap.making
  const items = (payload.items || []).map(normalizeCartItem)
  const goodsAmount = Number(payload.goodsAmount || items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))
  const couponAmount = Number(payload.couponAmount || 0)
  const pointsAmount = Number(payload.pointsAmount || 0)
  const paidAmount = Number(payload.paidAmount != null ? payload.paidAmount : Math.max(0, goodsAmount - couponAmount - pointsAmount))
  const takeMethod = payload.takeMethod || getTakeMethod(payload.serviceMode)
  const pickupCode = payload.pickupCode || String(1000 + (time.value % 9000))
  const goods = items.map((item) => ({
    name: item.name,
    spec: item.spec,
    priceText: formatMoney(item.unitPrice),
    quantity: item.quantity,
    image: item.image,
    remark: item.remark || ''
  }))
  return {
    id: payload.id || `${status}-${orderNo}`,
    orderNo,
    status,
    statusText: statusInfo.statusText,
    statusClass: statusInfo.statusClass,
    storeName: payload.storeName || '栖岸咖啡 · 望江路店',
    time: payload.time || time.shortText,
    orderTime: payload.orderTime || time.fullText,
    sortTime: payload.sortTime || time.value,
    pickupText: payload.pickupText || statusInfo.pickupText,
    pickupTime: payload.pickupTime || statusInfo.pickupText,
    pickupCode,
    pickupMode: takeMethod + '取餐',
    takeMethod,
    serviceMode: payload.serviceMode || 'pickup',
    remark: payload.remark || '',
    remarkText: payload.remark || '无备注',
    items,
    goods,
    totalCount: goods.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    goodsAmount,
    couponAmount,
    pointsAmount,
    paidAmount,
    amount: formatMoney(paidAmount),
    amountText: formatMoney(paidAmount),
    goodsAmountText: formatMoney(goodsAmount),
    couponText: formatMoney(couponAmount),
    pointsText: formatMoney(pointsAmount),
    paidAmountText: formatMoney(paidAmount),
    canPay: statusInfo.canPay,
    canReorder: statusInfo.canReorder
  }
}

/**
 * 统一后端返回字段。
 */
function normalizeOrder(order) {
  if (!order) return null
  return buildOrder(order, order.status || 'making')
}

/**
 * 处理当前业务数据。
 */
function readOrders() {
  const stored = readStorage(ORDERS_KEY, [])
  return (Array.isArray(stored) ? stored : []).map(normalizeOrder).filter(Boolean).sort((a, b) => Number(b.sortTime || 0) - Number(a.sortTime || 0))
}

/**
 * 处理当前业务数据。
 */
function writeOrders(orders) {
  const seen = {}
  const nextOrders = (orders || []).map(normalizeOrder).filter(Boolean).filter((order) => {
    if (seen[order.id]) return false
    seen[order.id] = true
    return true
  }).sort((a, b) => Number(b.sortTime || 0) - Number(a.sortTime || 0))
  writeStorage(ORDERS_KEY, nextOrders)
  if (nextOrders[0]) writeStorage(LATEST_ORDER_KEY, nextOrders[0])
  return nextOrders
}

/**
 * 保存当前编辑内容。
 */
function saveOrder(order) {
  const nextOrder = normalizeOrder(order)
    // 订单数据：保存当前页面展示的订单列表。
const orders = readOrders().filter((item) => item.id !== nextOrder.id && item.orderNo !== nextOrder.orderNo)
  writeStorage(LATEST_ORDER_KEY, nextOrder)
  return writeOrders([nextOrder].concat(orders))
}

/**
 * 处理当前业务数据。
 */
function findOrder(id) {
  const orders = readOrders()
  return orders.find((order) => order.id === id || order.orderNo === id) || null
}

/**
 * 读取页面需要的数据。
 */
function getLatestOrder() {
  return normalizeOrder(readStorage(LATEST_ORDER_KEY, null)) || readOrders()[0] || null
}

/**
 * 更新当前页面数据。
 */
function updateOrderStatus(id, status) {
  const orders = readOrders()
  const index = orders.findIndex((order) => order.id === id || order.orderNo === id)
  if (index < 0) return null
  const updated = buildOrder({ ...orders[index], status, sortTime: getTimeInfo().value, time: getTimeInfo().shortText }, status)
  orders[index] = updated
  writeOrders(orders)
  writeStorage(LATEST_ORDER_KEY, updated)
  return updated
}

/**
 * 读取页面需要的数据。
 */
function getSelectedCoupon() {
  return readStorage(SELECTED_COUPON_KEY, null)
}

/**
 * 写入页面或缓存数据。
 */
function setSelectedCoupon(coupon) {
  writeStorage(SELECTED_COUPON_KEY, coupon)
}

module.exports = {
  CART_ITEMS_KEY,
  ORDER_DRAFT_KEY,
  ORDERS_KEY,
  PRODUCT_ORDER,
  PRODUCT_MAP,
  setBackendProducts,
  buildOrderFromBackend,
  getProduct,
  getProducts,
  getDefaultOptions,
  normalizeOptions,
  getOptionLabel,
  getSpecText,
  getUnitPrice,
  readCartItems,
  writeCartItems,
  addCartItem,
  decrementProduct,
  updateCartItemQuantity,
  removeCartItem,
  removeCartItems,
  countCartByProduct,
  getCartSummary,
  writeOrderDraft,
  readOrderDraft,
  clearOrderDraft,
  buildOrder,
  readOrders,
  writeOrders,
  saveOrder,
  findOrder,
  getLatestOrder,
  updateOrderStatus,
  getSelectedCoupon,
  setSelectedCoupon,
  formatMoney
}