/**
 * 地址管理页逻辑。
 * 管理用户地址列表、新增编辑和默认地址。
 */
const api = require('../../utils/api.js')
// 地址管理页逻辑
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
    coffeeImage: 'http://localhost:2544/images/miniprogram/address/coffee.png',
    leafLeft: 'http://localhost:2544/images/miniprogram/address/leaf-left.png',
    leafRight: 'http://localhost:2544/images/miniprogram/address/leaf-right.png',
    locationIcon: 'http://localhost:2544/images/miniprogram/address/location.png',
    editIcon: 'http://localhost:2544/images/miniprogram/address/edit.png',
    deleteIcon: 'http://localhost:2544/images/miniprogram/address/delete.png',
    plusIcon: 'http://localhost:2544/images/miniprogram/address/plus.png',
    addresses: []
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadAddresses()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadAddresses()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadAddresses() {
    const member = api.getCurrentMember()
    if (!member || !member.id) return
    try {
      const list = await api.getAddresses(member.id)
      const addresses = (list || []).map((item) => ({
        id: String(item.id),
        name: item.receiverName,
        phone: item.receiverPhone,
        detail: `${item.province || ''}${item.city || ''}${item.district || ''}${item.detail || ''}`,
        isDefault: Number(item.isDefault) === 1
      }))
      this.setData({ addresses })
    } catch (error) {
      console.warn('地址接口加载失败，使用本地数据兜底', error)
    }
  },
  /**
   * 处理用户点击或输入。
   */
  handleBackTap() {
    wx.redirectTo({
      url: '/pages/profile/profile',
      fail: () => wx.navigateBack({ delta: 1 })
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleHeaderTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleBrandTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleCoffeeTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleAddressTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleEditTap(event) {
    const id = event.currentTarget.dataset.id
    wx.showToast({ title: `编辑地址 ${id}`, icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleDeleteTap(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除地址',
      content: '确定删除这条收货地址吗？',
      cancelText: '取消',
      confirmText: '删除',
      confirmColor: '#8a5736',
      success: (res) => {
        if (!res.confirm) return
        const addresses = this.data.addresses.filter((item) => item.id !== id)
        api.deleteAddress(id).catch((error) => console.warn('删除地址接口失败', error))
        this.setData({ addresses })
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handleAddTap() {
    const member = api.getCurrentMember()
    if (!member || !member.id) { wx.showToast({ title: '请先登录', icon: 'none' }); return }
    api.createAddress({ memberId: member.id, receiverName: '新用户', receiverPhone: member.phone || '13800000000', province: '陕西省', city: '西安市', district: '', detail: '请编辑详细地址', isDefault: this.data.addresses.length ? 0 : 1 }).then(() => this.loadAddresses())
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('地址管理页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadAddresses()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})