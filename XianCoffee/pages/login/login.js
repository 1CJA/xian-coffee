/**
 * 登录注册页逻辑。
 * 处理用户登录、注册校验和本地用户信息。
 */
// 登录注册页逻辑
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
    mode: 'login',
    remember: true,
    agreed: true,
    showPassword: false,
    showConfirmPassword: false,
    leafImage: 'http://localhost:2544/images/miniprogram/home/leaf.png',
    storeImage: 'http://localhost:2544/images/miniprogram/login/storefront-login.png',
    form: {
      phone: '',
      nickname: '',
      password: '',
      confirmPassword: ''
    }
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    console.log('登录注册页加载完成')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    console.log('登录注册页显示')
  },

  /**
   * 切换当前页面状态。
   */
  switchMode(event) {
    this.setData({
      mode: event.currentTarget.dataset.mode,
      showPassword: false,
      showConfirmPassword: false,
      form: {
        phone: this.data.form.phone,
        nickname: '',
        password: '',
        confirmPassword: ''
      }
    })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePhoneInput(event) {
    this.setData({ 'form.phone': event.detail.value })
  },

  /**
   * 处理用户点击或输入。
   */
  handleNicknameInput(event) {
    this.setData({ 'form.nickname': event.detail.value })
  },

  /**
   * 处理用户点击或输入。
   */
  handlePasswordInput(event) {
    this.setData({ 'form.password': event.detail.value })
  },

  /**
   * 处理用户点击或输入。
   */
  handleConfirmPasswordInput(event) {
    this.setData({ 'form.confirmPassword': event.detail.value })
  },

  /**
   * 切换当前开关状态。
   */
  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  /**
   * 切换当前开关状态。
   */
  toggleConfirmPassword() {
    this.setData({ showConfirmPassword: !this.data.showConfirmPassword })
  },

  /**
   * 切换当前开关状态。
   */
  toggleRemember() {
    this.setData({ remember: !this.data.remember })
  },

  /**
   * 切换当前开关状态。
   */
  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed })
  },

  /**
   * 处理用户点击或输入。
   */
  handleForgot() {
    wx.showToast({ title: '忘记密码功能后续接入', icon: 'none' })
  },


  /**
   * 清理本地缓存数据。
   */
  clearLocalAccountData() {
    ;[
      'xianCoffeeCartItems',
      'xianCoffeeMenuCart',
      'xianCoffeeOrderDraft',
      'xianCoffeeOrders',
      'xianCoffeeLatestOrder',
      'xianCoffeeSelectedCoupon'
    ].forEach((key) => wx.removeStorageSync(key))
  },
  /**
   * 提交当前表单数据。
   */
  async submitForm() {
    const { phone, nickname, password, confirmPassword } = this.data.form
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }
    if (this.data.mode === 'register' && !nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!password || password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    if (this.data.mode === 'register' && password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意协议', icon: 'none' })
      return
    }
    try {
      if (this.data.mode === 'register') {
        await api.registerMember({ phone, nickname: nickname.trim(), password })
        wx.showToast({ title: '注册成功，请登录', icon: 'success' })
        setTimeout(() => {
          this.setData({
            mode: 'login',
            showPassword: false,
            showConfirmPassword: false,
            form: {
              phone,
              nickname: '',
              password: '',
              confirmPassword: ''
            }
          })
        }, 500)
        return
      }
      const previousMember = api.getCurrentMember()
      const currentMember = await api.loginByPhone(phone, password)
      if (currentMember && (!previousMember || Number(previousMember.id) !== Number(currentMember.id))) {
        this.clearLocalAccountData()
      }
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' })
      }, 500)
    } catch (error) {
      wx.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  },onReachBottom() {
    console.log('登录注册页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  }
})