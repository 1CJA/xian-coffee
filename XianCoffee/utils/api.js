/**
 * 小程序接口请求工具。
 * 封装后端地址、请求方法和业务接口。
 */
const BASE_URL_KEY = 'xianCoffeeApiBaseUrl'
const DEFAULT_BASE_URL = 'http://localhost:2544/api'
const CURRENT_MEMBER_KEY = 'xianCoffeeCurrentMember'

/**
 * 读取页面需要的数据。
 */
function getBaseUrl() {
  return wx.getStorageSync(BASE_URL_KEY) || DEFAULT_BASE_URL
}

/**
 * 写入页面或缓存数据。
 */
function setBaseUrl(url) {
  if (url) wx.setStorageSync(BASE_URL_KEY, url)
}

/**
 * 封装统一网络请求。
 */
function request(options = {}) {
  const url = /^https?:\/\//.test(options.url || '') ? options.url : `${getBaseUrl()}${options.url}`
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || { 'content-type': 'application/json' },
      /**
       * 处理接口成功回调。
       */
      success(res) {
        const body = res.data
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error((body && body.message) || `请求失败 ${res.statusCode}`))
          return
        }
        if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'code')) {
          if (body.code === 0) {
            reject(new Error(body.message || '接口请求失败'))
            return
          }
          resolve(body.data)
          return
        }
        resolve(body)
      },
      /**
       * 处理接口失败回调。
       */
      fail(error) {
        reject(error)
      }
    })
  })
}

/**
 * 上传图片到后端。
 */
function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${getBaseUrl()}/upload/image`,
      filePath,
      name: 'file',
      /**
       * 处理接口成功回调。
       */
      success(res) {
        try {
          const body = JSON.parse(res.data || '{}')
          if (body.code === 0) {
            reject(new Error(body.message || '上传失败'))
            return
          }
          resolve(body.data || body)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}

/**
 * 读取页面需要的数据。
 */
function getCurrentMember() {
  return wx.getStorageSync(CURRENT_MEMBER_KEY) || null
}

/**
 * 写入页面或缓存数据。
 */
function setCurrentMember(member) {
  if (member) wx.setStorageSync(CURRENT_MEMBER_KEY, member)
}

/**
 * 清理本地缓存数据。
 */
function clearCurrentMember() {
  wx.removeStorageSync(CURRENT_MEMBER_KEY)
}

/**
 * 统一后端返回字段。
 */
function normalizeLevelName(value) {
  const text = String(value || '').trim()
  if (!text) return '\u666e\u901a\u4f1a\u5458'
  if (text.indexOf('\u91d1\u5361') >= 0 || text.indexOf('\u00e9') >= 0 || text.indexOf('\u00c3') >= 0) return '\u91d1\u5361\u4f1a\u5458'
  if (text.toUpperCase().indexOf('VIP') >= 0) return 'VIP'
  if (text.indexOf('\u94bb\u77f3') >= 0) return '\u94bb\u77f3\u4f1a\u5458'
  if (text.indexOf('\u666e\u901a') >= 0 || text.indexOf('\u00e6') >= 0) return '\u666e\u901a\u4f1a\u5458'
  return text
}

/**
 * 读取页面需要的数据。
 */
function getLevelShortName(value) {
  const levelName = normalizeLevelName(value)
  return levelName.replace(/\u4f1a\u5458/g, '') || levelName
}

/**
 * 统一后端返回字段。
 */
function normalizeMember(member = {}) {
  return {
    ...member,
    id: member.id,
    nickname: member.nickname || '咖啡旅人',
    phone: member.phone || '',
    avatarUrl: member.avatarUrl || 'http://localhost:2544/images/miniprogram/profile/avatar.png',
    levelName: normalizeLevelName(member.levelName),
    points: Number(member.points || 0),
    balance: Number(member.balance || 0),
    stampCount: Number(member.stampCount || 0),
    stampExchangeCount: Number(member.stampExchangeCount || 0),
    coupons: Number(member.coupons || 0),
    couponList: Array.isArray(member.couponList) ? member.couponList : []
  }
}

/**
 * 处理当前业务数据。
 */
async function findMemberBySavedPhone() {
  const savedUserInfo = wx.getStorageSync('xianCoffeeUserInfo') || {}
  const phone = savedUserInfo.phone
  if (!phone) return null
    // 会员数据：保存后台会员管理列表。
const members = await request({ url: '/members' })
  const member = (members || []).find((item) => item.phone === phone)
  if (!member) return null
  const next = normalizeMember(member)
  setCurrentMember(next)
  return next
}

/**
 * 同步页面最新展示数据。
 */
async function refreshCurrentMember() {
  let current = getCurrentMember()
  if (!current || !current.id) {
    current = await findMemberBySavedPhone()
    if (!current || !current.id) return current
  }
  const member = normalizeMember(await request({ url: `/members/${current.id}` }))
  setCurrentMember(member)
  return member
}

/**
 * 处理当前业务数据。
 */
async function loginByPhone(phone, password) {
  const members = await request({ url: '/members' })
  const member = (members || []).find((item) => item.phone === phone && String(item.password || 'CHANGE_ME_BEFORE_RUN') === String(password))
  if (!member) throw new Error('手机号或密码不正确')
  const next = normalizeMember(member)
  setCurrentMember(next)
  wx.setStorageSync('xianCoffeeLoggedIn', true)
  wx.setStorageSync('xianCoffeeUserInfo', { nickname: next.nickname, phone: next.phone, points: next.points })
  if (next.avatarUrl) wx.setStorageSync('xianCoffeeAvatar', next.avatarUrl)
  return next
}

/**
 * 处理当前业务数据。
 */
async function registerMember(data) {
  const member = normalizeMember(await request({
    url: '/members',
    method: 'POST',
    data: {
      openid: `mp-${data.phone}`,
      nickname: data.nickname,
      phone: data.phone,
      password: data.password,
      avatarUrl: data.avatarUrl || '',
      levelName: '普通会员',
      points: 0,
      stampCount: 0,
      stampExchangeCount: 0,
      status: 1
    }
  }))
  return member
}

/**
 * 更新当前页面数据。
 */
async function updateMember(member) {
  const saved = normalizeMember(await request({ url: '/members', method: 'PUT', data: member }))
  setCurrentMember(saved)
  return saved
}

/**
 * 读取页面需要的数据。
 */
function getProducts() { return request({ url: '/products' }) }
/**
 * 读取页面需要的数据。
 */
function getCategories() { return request({ url: '/categories' }) }
/**
 * 读取页面需要的数据。
 */
function getProduct(id) { return request({ url: `/products/${id}` }) }
/**
 * 读取页面需要的数据。
 */
function getBanners() { return request({ url: '/banners' }) }
/**
 * 读取页面需要的数据。
 */
function getCoupons() { return request({ url: '/coupons' }) }
/**
 * 读取页面需要的数据。
 */
function getMemberCoupons(memberId) { return request({ url: '/members/' + memberId + '/coupons' }) }
/**
 * 读取页面需要的数据。
 */
function getStores() { return request({ url: '/stores' }) }
/**
 * 读取页面需要的数据。
 */
function getStampRules() { return request({ url: '/stamp-records/rules' }) }
/**
 * 读取页面需要的数据。
 */
function getStampRecords(memberId) { return request({ url: `/stamp-records${memberId ? `?memberId=${memberId}` : ''}` }) }
/**
 * 处理当前业务数据。
 */
function redeemStamp(memberId) { return request({ url: `/members/${memberId}/redeem-stamp`, method: 'POST' }) }
/**
 * 读取页面需要的数据。
 */
function getAddresses(memberId) { return request({ url: `/addresses?memberId=${memberId}` }) }
/**
 * 生成页面需要的数据。
 */
function createAddress(data) { return request({ url: '/addresses', method: 'POST', data }) }
/**
 * 更新当前页面数据。
 */
function updateAddress(data) { return request({ url: '/addresses', method: 'PUT', data }) }
/**
 * 删除当前选中数据。
 */
function deleteAddress(id) { return request({ url: `/addresses/${id}`, method: 'DELETE' }) }
/**
 * 读取页面需要的数据。
 */
function getOrders(params = {}) {
  const query = Object.keys(params).filter((key) => params[key] !== undefined && params[key] !== '').map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&')
  return request({ url: `/orders/page${query ? `?${query}` : ''}` })
}
/**
 * 读取页面需要的数据。
 */
function getOrder(id) { return request({ url: `/orders/${id}` }) }
/**
 * 生成页面需要的数据。
 */
function createOrder(data) { return request({ url: '/orders', method: 'POST', data }) }
/**
 * 处理当前业务数据。
 */
function payOrder(id) { return request({ url: `/orders/${id}/pay`, method: 'PUT' }) }
/**
 * 处理当前业务数据。
 */
function cancelOrder(id, reason = '用户取消订单') { return request({ url: `/orders/${id}/cancel?reason=${encodeURIComponent(reason)}`, method: 'PUT' }) }

module.exports = {
  BASE_URL_KEY,
  DEFAULT_BASE_URL,
  CURRENT_MEMBER_KEY,
  getBaseUrl,
  setBaseUrl,
  request,
  uploadImage,
  getCurrentMember,
  setCurrentMember,
  clearCurrentMember,
  refreshCurrentMember,
  normalizeMember,
  normalizeLevelName,
  getLevelShortName,
  loginByPhone,
  registerMember,
  updateMember,
  getProducts,
  getCategories,
  getProduct,
  getBanners,
  getCoupons,
  getMemberCoupons,
  getStores,
  getStampRules,
  getStampRecords,
  redeemStamp,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getOrders,
  getOrder,
  createOrder,
  payOrder,
  cancelOrder
}