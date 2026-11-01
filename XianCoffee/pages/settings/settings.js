/**
 * 设置页逻辑。
 * 处理用户资料、账号设置和退出登录。
 */
const api = require('../../utils/api.js')
// 设置页面逻辑
/**
 * 页面入口配置。
 */
Page({
  // 页面数据配置
  /**
   * 页面状态数据。
   */
  data: {
    arrowIcon: 'http://localhost:2544/images/miniprogram/settings/arrow.png',
    soundEnabled: true,
    groups: [
      {
        id: 'account',
        title: '账号设置',
        items: [
          {
            id: 'profile',
            label: '个人信息',
            icon: 'http://localhost:2544/images/miniprogram/settings/personal.png',
            arrow: true
          },
          {
            id: 'password',
            label: '修改密码',
            icon: 'http://localhost:2544/images/miniprogram/settings/password.png',
            arrow: true
          },
          {
            id: 'phone',
            label: '手机号',
            value: '138 **** 5678',
            icon: 'http://localhost:2544/images/miniprogram/settings/phone.png',
            arrow: true
          },
          {
            id: 'security',
            label: '账号与安全',
            icon: 'http://localhost:2544/images/miniprogram/settings/security.png',
            arrow: true
          }
        ]
      },
      {
        id: 'general',
        title: '通用设置',
        items: [
          {
            id: 'notice',
            label: '消息通知',
            icon: 'http://localhost:2544/images/miniprogram/settings/notice.png',
            arrow: true
          },
          {
            id: 'sound',
            label: '声音设置',
            icon: 'http://localhost:2544/images/miniprogram/settings/sound.png',
            switch: true
          },
          {
            id: 'dark',
            label: '深色模式',
            value: '跟随系统',
            icon: 'http://localhost:2544/images/miniprogram/settings/dark.png',
            arrow: true
          },
          {
            id: 'language',
            label: '多语言',
            value: '简体中文',
            icon: 'http://localhost:2544/images/miniprogram/settings/language.png',
            arrow: true
          },
          {
            id: 'clear',
            label: '清除缓存',
            value: '12.6M',
            icon: 'http://localhost:2544/images/miniprogram/settings/clear.png',
            arrow: true
          }
        ]
      },
      {
        id: 'about',
        title: '关于我们',
        items: [
          {
            id: 'aboutCoffee',
            label: '关于栖岸咖啡',
            icon: 'http://localhost:2544/images/miniprogram/settings/about.png',
            arrow: true
          },
          {
            id: 'agreement',
            label: '用户协议',
            icon: 'http://localhost:2544/images/miniprogram/settings/agreement.png',
            arrow: true
          },
          {
            id: 'privacy',
            label: '隐私政策',
            icon: 'http://localhost:2544/images/miniprogram/settings/privacy.png',
            arrow: true
          },
          {
            id: 'customerService',
            label: '联系客服',
            icon: 'http://localhost:2544/images/miniprogram/settings/service.png',
            arrow: true
          },
          {
            id: 'version',
            label: '当前版本',
            value: 'V1.2.0',
            icon: 'http://localhost:2544/images/miniprogram/settings/version.png',
            arrow: false
          }
        ]
      }
    ]
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    console.log('设置页加载完成')
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    console.log('设置页显示')
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
    wx.redirectTo({ url: '/pages/profile/profile' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleTitleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleRowTap(event) {
    const id = event.currentTarget.dataset.id
    if (id === 'sound') {
      this.handleSoundTap()
      return
    }
    if (id === 'clear') {
      wx.showToast({ title: '缓存已清理', icon: 'success' })
      return
    }
    if (id === 'version') {
      wx.showToast({ title: '当前已是最新版本', icon: 'none' })
      return
    }
    wx.showToast({ title: '功能后续接入', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleIconTap(event) {
    this.handleRowTap(event)
  },

  /**
   * 处理用户点击或输入。
   */
  handleArrowTap(event) {
    this.handleRowTap(event)
  },

  /**
   * 处理用户点击或输入。
   */
  handleSoundTap() {
    this.setData({ soundEnabled: !this.data.soundEnabled })
  },

  /**
   * 处理用户点击或输入。
   */
  handleLogoutTap() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前账号吗？',
      confirmText: '退出',
      confirmColor: '#b7652f',
      success: (res) => {
        if (res.confirm) {
          api.clearCurrentMember()
          wx.removeStorageSync('xianCoffeeLoggedIn')
          wx.removeStorageSync('xianCoffeeUserInfo')
          wx.removeStorageSync('xianCoffeeAvatar')
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('设置页预留上拉触底')
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