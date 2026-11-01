/**
 * 集点卡页逻辑。
 * 展示集点数量、兑换记录和规则说明。
 */
const api = require('../../utils/api.js')
// 集点卡页逻辑
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
    leafIcon: 'http://localhost:2544/images/miniprogram/stamp-card/leaf-sprig.png',
    logoImage: 'http://localhost:2544/images/miniprogram/stamp-card/logo.png',
    storeImage: 'http://localhost:2544/images/miniprogram/stamp-card/store.png',
    stampFilled: 'http://localhost:2544/images/miniprogram/stamp-card/stamp-filled.png',
    stampEmpty: 'http://localhost:2544/images/miniprogram/stamp-card/stamp-empty.png',
    redeemCoffee: 'http://localhost:2544/images/miniprogram/stamp-card/redeem-coffee.png',
    rewardBag: 'http://localhost:2544/images/miniprogram/stamp-card/reward-bag.png',
    ruleStamp: 'http://localhost:2544/images/miniprogram/stamp-card/rule-stamp.png',
    giftIcon: 'http://localhost:2544/images/miniprogram/stamp-card/gift.png',
    calendarIcon: 'http://localhost:2544/images/miniprogram/stamp-card/calendar.png',
    cupIcon: 'http://localhost:2544/images/miniprogram/stamp-card/cup-line.png',
    stampCount: 0,
    stampTarget: 10,
    progressText: '已集满 0/10',
    stamps: Array.from({ length: 10 }).map((_, index) => ({ id: index + 1, filled: false })),
    rules: [
      {
        id: 'buy',
        icon: 'http://localhost:2544/images/miniprogram/stamp-card/rule-stamp.png',
        text: '每购买 1 杯咖啡可获得 1 枚印章'
      },
      {
        id: 'gift',
        icon: 'http://localhost:2544/images/miniprogram/stamp-card/gift.png',
        text: '集满 10 枚可兑换指定饮品 1 杯'
      },
      {
        id: 'date',
        icon: 'http://localhost:2544/images/miniprogram/stamp-card/calendar.png',
        text: '有效期至 2026.12.31'
      }
    ],
    records: []
  },

  // 页面加载初始化
  /**
   * 页面加载处理。
   */
  onLoad() {
    this.loadStampData()
  },

  // 页面显示刷新
  /**
   * 页面显示刷新。
   */
  onShow() {
    this.loadStampData()
  },


  /**
   * 从后端或本地加载数据。
   */
  async loadStampData() {
    const member = api.getCurrentMember()
    const stampTarget = this.data.stampTarget || 10
    if (!member || !member.id) {
      const stamps = Array.from({ length: stampTarget }).map((_, index) => ({ id: index + 1, filled: false }))
      this.setData({ stampCount: 0, progressText: '已集满 0/' + stampTarget, stamps, records: [] })
      return
    }
    try {
      const [freshMember, records] = await Promise.all([
        api.refreshCurrentMember().catch(() => member),
        api.getStampRecords(member.id).catch(() => [])
      ])
      const stampCount = Number((freshMember && freshMember.stampCount) || 0)
      const safeStampCount = Math.max(0, Math.min(stampTarget, stampCount))
      const stamps = Array.from({ length: stampTarget }).map((_, index) => ({ id: index + 1, filled: index < safeStampCount }))
      const nextRecords = (records || []).slice(0, 6).map((item) => ({
        id: String(item.id),
        type: item.recordType === 'EXCHANGE_REWARD' ? 'gift' : 'stamp',
        icon: item.recordType === 'EXCHANGE_REWARD' ? 'http://localhost:2544/images/miniprogram/stamp-card/gift.png' : '',
        badge: item.changeCount > 0 ? `+${item.changeCount}` : '',
        title: item.recordType === 'EXCHANGE_REWARD' ? '兑换：饮品免单券' : '订单集点',
        time: String(item.createdAt || '').replace('T', ' ').slice(0, 16),
        result: item.remark || `${item.changeCount || 0} 点`
      }))
      this.setData({
        stampCount: safeStampCount,
        progressText: '已集满 ' + safeStampCount + '/' + stampTarget,
        stamps,
        records: nextRecords
      })
    } catch (error) {
      console.warn('集点卡接口加载失败，使用当前会员缓存兜底', error)
      const stampCount = Math.max(0, Math.min(stampTarget, Number(member.stampCount || 0)))
      const stamps = Array.from({ length: stampTarget }).map((_, index) => ({ id: index + 1, filled: index < stampCount }))
      this.setData({ stampCount, progressText: '已集满 ' + stampCount + '/' + stampTarget, stamps, records: [] })
    }
  },  handleBackTap() {
    wx.redirectTo({
      url: '/pages/memberCenter/memberCenter',
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
  handleStoreTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStampPanelTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleStampTap() {},

  /**
   * 处理用户点击或输入。
   */
  async handleRewardTap() {
    const current = api.getCurrentMember()
    if (!current || !current.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showLoading({ title: '兑换中' })
    try {
      const member = await api.refreshCurrentMember().catch(() => current)
      if (Number(member.stampCount || 0) < 10) {
        wx.hideLoading()
        wx.showToast({ title: '集点未满 10 点', icon: 'none' })
        return
      }
      await api.redeemStamp(member.id)
      await api.refreshCurrentMember()
      await this.loadStampData()
      wx.hideLoading()
      wx.showToast({ title: '兑换成功', icon: 'success' })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '兑换失败', icon: 'none' })
    }
  },
  /**
   * 处理用户点击或输入。
   */
  handleRuleTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleRecordTap() {},

  /**
   * 处理用户点击或输入。
   */
  handleAllRecordTap() {
    wx.showToast({ title: '兑换记录已展示', icon: 'none' })
  },

  /**
   * 处理用户点击或输入。
   */
  handleDrinkTap() {
    wx.navigateTo({ url: '/pages/menu/menu' })
  },

  // 上拉触底预留
  /**
   * 上拉触底预留。
   */
  onReachBottom() {
    console.log('集点卡页预留上拉触底')
  },

  // 下拉刷新处理
  /**
   * 下拉刷新处理。
   */
  onPullDownRefresh() {
    this.loadStampData()
    wx.showToast({ title: '已刷新', icon: 'success' })
    wx.stopPullDownRefresh()
  }
})