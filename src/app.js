const wechat = require('./utils/wechat')
const utils = require('./utils/util.js')
const api = require('./utils/api')
const UI = require('./common/zan/index')
const md5 = require('./vendor/md5')

App({
  /**
   * Global shared
   * 可以定义任何成员，用于在整个应用中共享
   */
  data: {
    name: 'Xianpinhui',
    version: '0.1.0',
    userInfo: null
  },
  utils: utils,
  wechat: wechat,
  api: api,
  UI: UI,
  loading: function () {
    wx.showLoading({
      title: '加载中'
    })
  },
  onLaunch (options) {
    const randomString = md5.md5(Math.random())
    const systemInfo = wx.getSystemInfoSync()
    if (systemInfo.system.startsWith('iOS')) {
      wx.setStorageSync('system', 'iOS')
    } else {
      wx.setStorageSync('system', 'android')
    }
    wx.setStorageSync('device_key', randomString)
    utils.handleOptions(options)
    const scene = options.scene
    if (scene) {
      if (scene === 1022) {
        wx.reLaunch({
          url: 'pages/home/home'
        })
      }
    }
    console.log(' ========== Application is launched ========== ')
  },

  onShow (options) {
    console.log(' ========== Application is showed ========== ')
    console.log(options)
    const scene = options.scene
    if (scene === 1023) {
      // 来自安卓桌面
      api.taskDone({type: 4})
        .then(res => {
          console.log('奖励')
        })
    }
    if (options.shareTicket) {
      wx.setStorageSync('shareticket', options.shareTicket)
      const user_code = wx.getStorageSync('user_code')
      if (user_code) {
        var tickets = []
        tickets.push(options.shareTicket)
        api.submitShareInfo(tickets)
      }
    }
  },
  /**
   * 生命周期函数--监听小程序隐藏
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide () {
    console.log(' ========== Application is hid ========== ')
  }
})
