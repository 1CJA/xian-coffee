/**
 * 后台接口封装模块。
 * 统一封装后端请求、字段转换和图片地址处理。
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const BACKEND_ORIGIN = 'http://localhost:2544'
const backendHttp = axios.create({
  baseURL: `${BACKEND_ORIGIN}/api`,
  timeout: 8000
})

backendHttp.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && body.code === 0) {
      throw new Error(body.message || '后端接口请求失败')
    }
    return body?.data ?? body
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '后端接口请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

const imageHost = `${BACKEND_ORIGIN}/images/`
const enabledText = '启用'
const disabledText = '停用'
const onlineText = '上架'
const offlineText = '下架'
const activeText = '可使用'
const expiredText = '已过期'
const normalText = '正常'
const frozenText = '冻结'
const runningText = '营业中'
const restingText = '休息中'

const specLabelMap = {
  temperature: '温度',
  cup: '杯型',
  sugar: '糖度',
  extra: '加料'
}

const orderStatusMap = {
  PENDING_PAYMENT: { value: 'pending', text: '待付款' },
  PENDING: { value: 'pending', text: '待付款' },
  PAID: { value: 'making', text: '制作中' },
  MAKING: { value: 'making', text: '制作中' },
  COMPLETED: { value: 'done', text: '已完成' },
  DONE: { value: 'done', text: '已完成' },
  CANCELLED: { value: 'cancelled', text: '已取消' }
}

const backendOrderStatusMap = {
  pending: 'PENDING_PAYMENT',
  making: 'MAKING',
  done: 'COMPLETED',
  cancelled: 'CANCELLED'
}

const couponTypeMap = {
  FULL_REDUCTION: '满减',
  DISCOUNT: '折扣',
  FREE_DRINK: '搭配',
  MATCH: '搭配'
}

const backendCouponTypeMap = {
  满减: 'FULL_REDUCTION',
  折扣: 'DISCOUNT',
  搭配: 'FREE_DRINK'
}

const bannerPageMap = [
  { label: '功能入口页', route: 'pages/entry/entry' },
  { label: '菜单点单页', route: 'pages/menu/menu' },
  { label: '会员中心页', route: 'pages/memberCenter/memberCenter' },
  { label: '优惠券页', route: 'pages/coupons/coupons' },
  { label: '门店详情页', route: 'pages/storeDetail/storeDetail' },
  { label: '集点卡页', route: 'pages/stampCard/stampCard' }
]

/**
 * 转换为数字主键。
 */
function numericId(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/**
 * 转换启用状态数值。
 */
function statusNumber(value, activeLabel = enabledText) {
  return value === activeLabel || value === 1 || value === true ? 1 : 0
}

/**
 * 拼接图片访问地址。
 */
function toImageUrl(imagePath) {
  if (!imagePath) return ''
  const value = String(imagePath)
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/admin-assets/')) return value
  if (value.startsWith('admin-assets/')) return '/' + value
  return `${imageHost}${value.replace(/^\/?images\//, '').replace(/^\//, '')}`
}

/**
 * 保存图片相对路径。
 */
function toImagePath(value) {
  if (!value) return ''
  return String(value)
    .replace(`${BACKEND_ORIGIN}/images/`, '')
    .replace(/^http:\/\/localhost:2544\/images\//, '')
    .replace(/^\/images\//, '')
    .replace(/^\//, '')
}

/**
 * 格式化页面展示文本。
 */
function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

/**
 * 格式化页面展示文本。
 */
function formatDateTime(value) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 16)
}

/**
 * 处理当前业务数据。
 */
function cleanOptionName(label) {
  return String(label || '').trim().replace(/\s*\+\d+(\.\d+)?$/, '')
}

/**
 * 处理当前业务数据。
 */
function parseOptionLabel(label) {
  const text = String(label || '').trim()
  const match = text.match(/^(.*?)\s*\+(\d+(?:\.\d+)?)$/)
  return {
    name: match ? match[1].trim() : text,
    priceDelta: match ? Number(match[2]) : 0
  }
}

/**
 * 格式化页面展示文本。
 */
function formatSpecOption(option = {}) {
  const price = Number(option.priceDelta || 0)
  return price > 0 ? `${option.name} +${price}` : option.name
}

/**
 * 生成页面需要的数据。
 */
function buildSpecSummary(specOptions = {}) {
  const labels = Object.entries(specOptions)
    .filter(([, options]) => Array.isArray(options) && options.length)
    .map(([key]) => specLabelMap[key] || key)
  return labels.length ? labels.join('、') : '经典口味'
}

/**
 * 处理当前业务数据。
 */
function toAdminProduct(item = {}) {
  return {
    ...item,
    image: item.imageUrl || toImageUrl(item.imagePath),
    imagePath: item.imagePath || toImagePath(item.imageUrl),
    detailImagePath: item.detailImagePath || toImagePath(item.detailImageUrl),
    detailImageUrl: item.detailImageUrl || toImageUrl(item.detailImagePath),
    desc: item.description || '',
    detailDescription: item.detailDescription || '',
    sales: item.salesCount || 0,
    status: Number(item.status) === 1 ? onlineText : offlineText,
    tag: item.salesCount > 200 ? '人气' : '',
    specs: buildSpecSummary(item.specOptions || {}),
    miniPage: '菜单点单页 / 商品详情页 / 搜索页',
    specOptions: item.specOptions || {}
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendProduct(item = {}) {
  return {
    id: numericId(item.id),
    categoryId: numericId(item.categoryId),
    name: item.name,
    shortName: item.shortName || item.name,
    description: item.desc || item.description || '',
    detailDescription: item.detailDescription || item.desc || item.description || '',
    price: Number(item.price || 0),
    imagePath: toImagePath(item.imagePath || item.image),
    detailImagePath: toImagePath(item.detailImagePath || item.detailImageUrl || item.imagePath || item.image),
    salesCount: Number(item.sales || item.salesCount || 0),
    stock: Number(item.stock || 0),
    status: item.status === onlineText || item.status === 1 ? 1 : 0,
    specOptions: item.specOptions || {}
  }
}

/**
 * 处理当前业务数据。
 */
function toAdminCategory(item = {}) {
  return {
    ...item,
    sort: item.sortOrder || 1,
    status: Number(item.status) === 1 ? enabledText : disabledText,
    productCount: item.productCount || 0,
    page: '菜单点单页',
    desc: item.desc || `${item.name || '分类'}会展示在小程序菜单点单页左侧分类栏`
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendCategory(item = {}) {
  return {
    id: numericId(item.id),
    name: item.name,
    sortOrder: Number(item.sort || item.sortOrder || 1),
    status: statusNumber(item.status, enabledText)
  }
}

/**
 * 处理当前业务数据。
 */
function toAdminSpecGroup(group = {}) {
  return {
    ...group,
    id: group.code || group.id,
    backendId: group.id,
    required: group.code !== 'extra',
    options: Array.isArray(group.options) ? group.options.map(formatSpecOption) : []
  }
}

/**
 * 处理当前业务数据。
 */
function toAdminCoupon(item = {}) {
  const active = Number(item.status) === 1 && (!item.endDate || item.endDate >= new Date().toISOString().slice(0, 10))
  return {
    ...item,
    title: item.name || item.title || '',
    type: couponTypeMap[item.type] || item.type || '满减',
    rule: item.ruleText || item.rule || '',
    amount: Number(item.amount || 0),
    status: active ? activeText : expiredText,
    startDate: formatDate(item.startDate),
    validDate: formatDate(item.endDate || item.validDate),
    usedCount: Number(item.usedCount || 0),
    image: item.imageUrl || toImageUrl(item.imagePath || item.image),
    imagePath: item.imagePath || toImagePath(item.imageUrl || item.image),
    miniPage: '优惠券页 / 确认订单页'
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendCoupon(item = {}) {
  return {
    id: numericId(item.id),
    name: item.title || item.name,
    type: backendCouponTypeMap[item.type] || item.type || 'FULL_REDUCTION',
    amount: Number(item.amount || 0),
    minAmount: Number(item.minAmount || 0),
    imagePath: toImagePath(item.imagePath || item.image),
    startDate: item.startDate || null,
    endDate: item.validDate || item.endDate || null,
    totalCount: Number(item.totalCount || 0),
    status: item.status === activeText || item.status === 1 ? 1 : 0,
    ruleText: item.rule || item.ruleText || ''
  }
}

/**
 * 处理当前业务数据。
 */
function pageLabelByRoute(route = '') {
  return bannerPageMap.find((item) => item.route === route)?.label || '功能入口页'
}

/**
 * 处理当前业务数据。
 */
function routeByPageLabel(label = '') {
  return bannerPageMap.find((item) => item.label === label)?.route || 'pages/entry/entry'
}

/**
 * 处理当前业务数据。
 */
function toAdminCarousel(item = {}) {
  const route = item.linkValue || item.route || 'pages/entry/entry'
  return {
    ...item,
    image: item.imageUrl || toImageUrl(item.imagePath || item.image),
    imagePath: item.imagePath || toImagePath(item.imageUrl || item.image),
    targetPage: item.targetPage || pageLabelByRoute(route),
    route,
    sort: item.sortOrder || item.sort || 1,
    status: Number(item.status) === 1 ? enabledText : disabledText,
    updatedAt: formatDateTime(item.updatedAt || item.createdAt),
    remark: item.remark || ''
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendCarousel(item = {}) {
  return {
    id: numericId(item.id),
    title: item.title,
    imagePath: toImagePath(item.imagePath || item.image),
    linkType: 'PAGE',
    linkValue: item.route || routeByPageLabel(item.targetPage),
    sortOrder: Number(item.sort || item.sortOrder || 1),
    status: statusNumber(item.status, enabledText)
  }
}

/**
 * 处理当前业务数据。
 */
function parseCity(address = '') {
  const match = String(address).match(/([\u4e00-\u9fa5]+市)/)
  return match ? match[1].replace('市', '') : '西安'
}

/**
 * 处理当前业务数据。
 */
function toAdminStore(item = {}) {
  return {
    ...item,
    city: item.city || parseCity(item.address),
    openTime: item.businessHours || item.openTime || '',
    status: Number(item.status) === 1 ? runningText : restingText,
    image: item.imageUrl || toImageUrl(item.imagePath || item.image),
    imagePath: item.imagePath || toImagePath(item.imageUrl || item.image),
    videoPath: item.videoPath || '',
    videoUrl: item.videoUrl || toImageUrl(item.videoPath),
    miniPage: '门店详情页 / 确认订单页',
    orderCount: Number(item.orderCount || 0),
    todayAmount: Number(item.todayAmount || 0),
    tag: item.tag || '门店'
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendStore(item = {}) {
  return {
    id: numericId(item.id),
    name: item.name,
    phone: item.phone,
    address: item.address,
    businessHours: item.openTime || item.businessHours,
    imagePath: toImagePath(item.imagePath || item.image),
    videoPath: toImagePath(item.videoPath || item.videoUrl),
    status: item.status === runningText || item.status === 1 ? 1 : 0
  }
}

/**
 * 处理当前业务数据。
 */
function toAdminMember(item = {}) {
  return {
    ...item,
    memberNo: item.memberNo || `QC${String(item.id || 0).padStart(6, '0')}`,
    avatar: toImageUrl(item.avatarUrl || item.avatar) || '/admin-assets/user-avatar.png',
    avatarPath: toImagePath(item.avatarUrl || item.avatar),
    level: item.levelName || item.level || '普通会员',
    points: Number(item.points ?? 0),
    stamps: Number(item.stampCount ?? item.stamps ?? 0),
    redeemCount: Number(item.stampExchangeCount ?? item.redeemCount ?? 0),
    coupons: Number(item.coupons ?? 0),
    couponList: Array.isArray(item.couponList) ? item.couponList : [],
    balance: Number(item.balance ?? 0),
    orders: Number(item.orders || 0),
    totalAmount: Number(item.totalAmount || 0),
    registerTime: formatDate(item.createdAt || item.registerTime),
    status: Number(item.status) === 1 ? normalText : frozenText,
    miniPage: '个人中心页 / 会员中心页'
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendMember(item = {}) {
  return {
    id: numericId(item.id),
    openid: item.openid || item.memberNo || null,
    nickname: item.nickname,
    phone: item.phone,
    password: item.password || 'CHANGE_ME_BEFORE_RUN',
    avatarUrl: toImagePath(item.avatarPath || item.avatar || item.avatarUrl),
    levelName: item.level || item.levelName || '普通会员',
    points: Number(item.points ?? 0),
    balance: Number(item.balance ?? 0),
    coupons: Number(item.coupons ?? 0),
    stampCount: Number(item.stamps ?? item.stampCount ?? 0),
    stampExchangeCount: Number(item.redeemCount ?? item.stampExchangeCount ?? 0),
    status: item.status === normalText || item.status === 1 ? 1 : 0
  }
}

/**
 * 处理当前业务数据。
 */
function toAdminOrder(item = {}) {
  const statusInfo = orderStatusMap[item.status] || { value: item.status || 'pending', text: item.statusText || '待付款' }
  const orderItems = Array.isArray(item.orderItems) ? item.orderItems : []
  const items = orderItems.length
    ? orderItems.map((orderItem) => `${orderItem.productName} x${orderItem.quantity || 1}${orderItem.specText ? ` / ${orderItem.specText}` : ''}`)
    : (Array.isArray(item.items) ? item.items : [])
  return {
    ...item,
    user: item.memberName || item.user || '微信用户',
    phone: item.memberPhone || item.phone || '',
    avatar: item.avatar || '/admin-assets/user-avatar.png',
    amount: Number(item.payAmount || item.amount || item.totalAmount || 0),
    createdAt: formatDateTime(item.createdAt),
    status: statusInfo.value,
    statusText: statusInfo.text,
    sourcePage: item.sourcePage || '确认订单页 / 我的订单页',
    items,
    itemCount: orderItems.reduce((sum, orderItem) => sum + Number(orderItem.quantity || 1), 0) || items.length,
    storeName: item.storeName || '栖岸咖啡门店',
    refundText: item.status === 'CANCELLED' ? `已取消，已退回¥${Number(item.payAmount || 0).toFixed(2)}，积分和优惠券已返还` : (item.refundText || ''),
    orderItems
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendOrderStatus(status) {
  return backendOrderStatusMap[status] || status
}

/**
 * 处理当前业务数据。
 */
function toAdminStampCard(item = {}, records = []) {
  const redeemedCount = records.filter((record) => record.recordType === 'EXCHANGE_REWARD').length
  const issuedCount = records.length
  return {
    ...item,
    name: item.name || '买一杯得一点',
    subtitle: item.subtitle || '集满可兑换饮品免单券',
    image: item.image || '/admin-assets/member-card.png',
    storeScope: item.storeScope || '全部门店',
    target: Number(item.targetCount || item.target || 10),
    rule: item.rule || `消费任意饮品 1 杯得 1 点，集满 ${item.targetCount || item.target || 10} 点可兑换`,
    reward: item.reward || '饮品免单券',
    issuedCount: Number(item.issuedCount || issuedCount),
    redeemedCount: Number(item.redeemedCount || redeemedCount),
    validDays: Number(item.validDays || 30),
    sort: Number(item.sortOrder || item.sort || item.id || 1),
    status: Number(item.status) === 1 ? enabledText : disabledText,
    miniPage: '集点卡页 / 会员中心页',
    updatedAt: formatDateTime(item.updatedAt || item.createdAt)
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendStampCard(item = {}) {
  return {
    id: numericId(item.id),
    name: item.name,
    targetCount: Number(item.target || item.targetCount || 10),
    rewardCouponId: Number(item.rewardCouponId || 3),
    validDays: Number(item.validDays || 30),
    status: statusNumber(item.status, enabledText)
  }
}

/**
 * 处理当前业务数据。
 */
function toAdminStampRecord(item = {}) {
  return {
    ...item,
    avatar: toImageUrl(item.avatarUrl || item.avatar) || '/admin-assets/user-avatar.png',
    memberName: item.memberName || `会员${item.memberId || ''}`,
    phone: item.phone || '',
    activityName: item.activityName || (item.recordType === 'EXCHANGE_REWARD' ? '集点兑换' : '订单集点'),
    reward: item.reward || (item.recordType === 'EXCHANGE_REWARD' ? '饮品免单券' : `${item.changeCount || 0} 点`),
    storeName: item.storeName || '栖岸咖啡门店',
    redeemedAt: formatDateTime(item.createdAt || item.redeemedAt),
    status: item.status || '已完成'
  }
}

/**
 * 处理当前业务数据。
 */
function toBackendStampRecord(item = {}) {
  return {
    memberId: numericId(item.memberId || item.id),
    orderId: numericId(item.orderId),
    changeCount: Number(item.changeCount || -10),
    recordType: item.recordType || 'EXCHANGE_REWARD',
    exchangeCouponId: numericId(item.exchangeCouponId || 3),
    remark: item.remark || item.reward || '后台兑换集点奖励'
  }
}

export const loginApi = async (data) => {
  if (data.username === 'admin' && data.password === 'CHANGE_ME_BEFORE_RUN') {
    return { token: 'xian-coffee-admin-token', user: { name: '栖岸管理员', role: '系统管理员' } }
  }
  ElMessage.error('账号或密码错误')
  throw new Error('账号或密码错误')
}

export const getDashboard = async () => {
  const [products, orders, members, coupons] = await Promise.all([getProducts(), getOrders(), getMembers(), getCoupons()])
  return {
    hotProducts: products.slice().sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0)).slice(0, 5),
    latestOrders: orders.slice(0, 4),
    stats: { products, orders, members, coupons }
  }
}

export const getBackendProducts = async () => {
  const pageData = await backendHttp.get('/products/page', { params: { page: 1, pageSize: 200 } })
  return (pageData.list || []).map(toAdminProduct)
}
export const getBackendProduct = async (id) => toAdminProduct(await backendHttp.get(`/products/${id}`))
export const saveBackendProduct = async (data) => {
  const payload = toBackendProduct(data)
  const saved = payload.id ? await backendHttp.put('/products', payload) : await backendHttp.post('/products', payload)
  return toAdminProduct(saved)
}
export const deleteBackendProduct = (id) => backendHttp.delete(`/products/${id}`)

export const getProducts = getBackendProducts
export const getProduct = getBackendProduct
export const saveProduct = saveBackendProduct
export const deleteProduct = deleteBackendProduct

export const getBackendCategories = async () => (await backendHttp.get('/categories')).map(toAdminCategory)
export const getCategories = getBackendCategories
export const saveCategory = async (data) => {
  const payload = toBackendCategory(data)
  const saved = payload.id ? await backendHttp.put('/categories', payload) : await backendHttp.post('/categories', payload)
  return toAdminCategory(saved)
}
export const deleteCategory = (id) => backendHttp.delete(`/categories/${id}`)

export const getBackendSpecs = async () => (await backendHttp.get('/specs')).map(toAdminSpecGroup)
export const getSpecs = getBackendSpecs
export const saveSpecGroup = async (group) => {
  const currentGroups = await backendHttp.get('/specs')
  const current = currentGroups.find((item) => String(item.code) === String(group.id) || String(item.id) === String(group.backendId || group.id))
  if (!current) throw new Error('规格组不存在')
  await backendHttp.put('/specs/groups', {
    id: current.id,
    name: group.name,
    code: current.code,
    sortOrder: current.sortOrder,
    status: current.status
  })

  const desired = (group.options || []).map(parseOptionLabel).filter((item) => item.name)
  const desiredNames = desired.map((item) => item.name)
  const currentOptions = Array.isArray(current.options) ? current.options : []
  for (const option of currentOptions) {
    if (!desiredNames.includes(option.name)) {
      await backendHttp.delete(`/specs/options/${option.id}`)
    }
  }
  for (let index = 0; index < desired.length; index += 1) {
    const option = desired[index]
    const old = currentOptions.find((item) => item.name === option.name)
    const payload = {
      id: old?.id,
      groupId: current.id,
      name: option.name,
      priceDelta: option.priceDelta,
      sortOrder: index + 1,
      status: 1
    }
    if (old) await backendHttp.put('/specs/options', payload)
    else await backendHttp.post('/specs/options', payload)
  }

  const fresh = await backendHttp.get('/specs')
  return toAdminSpecGroup(fresh.find((item) => item.id === current.id))
}

export const getOrders = async () => {
  const pageData = await backendHttp.get('/orders/page', { params: { page: 1, pageSize: 200 } })
  return (pageData.list || []).map(toAdminOrder)
}
export const getOrder = async (id) => toAdminOrder(await backendHttp.get(`/orders/${id}`))
export const updateOrderStatus = async (data) => {
  const id = numericId(data.id)
  const nextStatus = toBackendOrderStatus(data.status)
  const saved = data.status === 'cancelled'
    ? await backendHttp.put(`/orders/${id}/cancel`, null, { params: { reason: data.cancelReason || '管理员取消订单' } })
    : await backendHttp.put(`/orders/${id}/status`, null, { params: { status: nextStatus } })
  return toAdminOrder(saved)
}

export const getCoupons = async () => (await backendHttp.get('/coupons')).map(toAdminCoupon)
export const saveCoupon = async (data) => {
  const payload = toBackendCoupon(data)
  const saved = payload.id ? await backendHttp.put('/coupons', payload) : await backendHttp.post('/coupons', payload)
  return toAdminCoupon(saved)
}
export const deleteCoupon = (id) => backendHttp.delete(`/coupons/${id}`)

export const getMembers = async () => (await backendHttp.get('/members')).map(toAdminMember)
export const saveMember = async (data) => {
  const payload = toBackendMember(data)
  const saved = payload.id ? await backendHttp.put('/members', payload) : await backendHttp.post('/members', payload)
  return toAdminMember(saved)
}
export const deleteMember = (id) => backendHttp.delete(`/members/${id}`)
export const redeemMemberStamp = async (id) => toAdminMember(await backendHttp.post(`/members/${id}/redeem-stamp`))

export const getStampRecords = async () => (await backendHttp.get('/stamp-records')).map(toAdminStampRecord)
export const getStampCards = async () => {
  const [rules, records] = await Promise.all([backendHttp.get('/stamp-records/rules'), getStampRecords().catch(() => [])])
  return rules.map((item) => toAdminStampCard(item, records))
}
export const saveStampCard = async (data) => {
  const payload = toBackendStampCard(data)
  const saved = payload.id ? await backendHttp.put('/stamp-records/rules', payload) : await backendHttp.post('/stamp-records/rules', payload)
  return toAdminStampCard(saved)
}
export const deleteStampCard = (id) => backendHttp.delete(`/stamp-records/rules/${id}`)
export const saveStampRecord = async (data) => toAdminStampRecord(await backendHttp.post('/stamp-records', toBackendStampRecord(data)))

export const getStores = async () => (await backendHttp.get('/stores')).map(toAdminStore)
export const saveStore = async (data) => {
  const payload = toBackendStore(data)
  const saved = payload.id ? await backendHttp.put('/stores', payload) : await backendHttp.post('/stores', payload)
  return toAdminStore(saved)
}

export const getCarousels = async () => (await backendHttp.get('/banners')).map(toAdminCarousel)
export const saveCarousel = async (data) => {
  const payload = toBackendCarousel(data)
  const saved = payload.id ? await backendHttp.put('/banners', payload) : await backendHttp.post('/banners', payload)
  return toAdminCarousel(saved)
}
export const deleteCarousel = (id) => backendHttp.delete(`/banners/${id}`)

export const getHomeContent = getCarousels
export const saveHomeContent = saveCarousel

export const uploadBackendImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const data = await backendHttp.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  const imagePath = data.filename || toImagePath(data.url)
  return {
    ...data,
    imagePath,
    url: toImageUrl(imagePath)
  }
}