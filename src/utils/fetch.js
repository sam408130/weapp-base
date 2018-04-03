const Promise = require('../vendor/bluebird')
const sessionManager = require('./sessionManager')
const AppKey = 'xpaz9j3yf39uhk4073'
const apiconfig = require('./apiconfig')
const LoginUrl = apiconfig.apiroot + 'login'
const SubmitShareInfo = apiconfig.apiroot + 'shareInfo'

function serialize (obj) {
  var str = []
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
    }
  }
  return str.join('&')
}

function handleHeader (header) {
  if (header.hasOwnProperty('persistkey')) {
    wx.setStorageSync('persistkey', header.persistkey)
  }
  if (header.hasOwnProperty('sessionid')) {
    wx.setStorageSync('sessionid', header.sessionid)
  }
}

function getHeadInfo () {
  const tokenInfo = sessionManager.loadToken()
  const header = {
    'appkey': AppKey,
    'accesstoken': tokenInfo.token,
    'timestamp': tokenInfo.time,
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'persistkey': wx.getStorageSync('persistkey') || '',
    'sessionid': wx.getStorageSync('sessionid') || '',
    'referrerinfo': wx.getStorageSync('referrerinfo') || '',
    'scene': wx.getStorageSync('scene') || '',
    'invitercode': wx.getStorageSync('invitercode') || '',
    'appv': apiconfig.appv,
    'devicekey': wx.getStorageSync('device_key') || '',
    'system': wx.getStorageSync('system') || ''
  }
  return header
}

function fetchMethod (url, method, params, resolve, reject) {
  wx.request({
    url: url,
    method: method,
    header: getHeadInfo(),
    data: method === 'GET' ? Object.assign({}, params) : serialize(Object.assign({}, params)),
    success: (res) => {
      if (res.data.code === '400040') {
        wxLogin(url, method, params, resolve, reject, res)
      } else if (res.data.code === '400015') {
        wxLogin(url, method, params, resolve, reject, res)
      } else if (res.data.code === '400001') {
        console.log('验证失败')
        reject(res.data)
      } else {
        console.log('******** url *********')
        console.log(url)
        console.log('******** params *********')
        console.log(params)
        console.log('******** response *********')
        console.log(res.data)
        if (res.data.code === '000000') {
          handleHeader(res.header)
          resolve(res.data)
        } else {
          reject(res.data)
        }
      }
    },
    fail: reject
  })
}

function submitShareInfo (ticket) {
  wx.getShareInfo({
    shareTicket: ticket,
    success: function (res) {
      console.log(res)
      if (res.errMsg === 'getShareInfo:ok') {
        wx.request({
          url: SubmitShareInfo,
          method: 'POST',
          header: getHeadInfo(),
          data: method === 'GET' ? Object.assign({}, res) : serialize(Object.assign({}, res)),
          success: (res) => {
            console.log(res)
          }
        })
      }
    }
  })
}

function wxLogin (url, method, params, resolve, reject, responseData) {
  wx.login({
    success: (r) => {
      var code = r.code
      console.log('~~~~~~~ code ~~~~~~~')
      console.log(code)
      console.log('~~~~~~~ code ~~~~~~~')
      if (code) {
        wx.getUserInfo({
          lang: 'zh_CN',
          success: (res) => {
            wx.setStorageSync('user', res.userInfo)
            const loginParams = {
              code: code,
              encryptedData: res.encryptedData,
              iv: res.iv,
              activity: wx.getStorageSync('activity') || ''
            }
            console.log('~~~~~~')
            console.log(LoginUrl)
            console.log('~~~~~~')
            wx.request({
              url: LoginUrl,
              method: 'POST',
              header: getHeadInfo(),
              data: method === 'GET' ? Object.assign({}, loginParams) : serialize(Object.assign({}, loginParams)),
              success: (res) => {
                console.log(res)
                if (res.data.code === '000000') {
                  handleHeader(res.header)
                  const inviterCode = res.data.data
                  if (inviterCode.inviter_code) {
                    wx.setStorageSync('user_code', inviterCode.inviter_code)
                    console.log('~~~~')
                    console.log(wx.getStorageSync('user_code'))
                    console.log('~~~~~')
                  }
                  console.log(getHeadInfo())
                  if (method === 'GET') {
                    fetchMethod(url, method, params, resolve, reject)
                  }
                  const ticket = wx.getStorageSync('shareticket')
                  console.log(ticket)
                  if (ticket) {
                    wx.getShareInfo({
                      shareTicket: ticket,
                      success: function (res) {
                        console.log(res)
                        console.log(SubmitShareInfo)
                        if (res.errMsg === 'getShareInfo:ok') {
                          wx.request({
                            url: SubmitShareInfo,
                            method: 'POST',
                            header: getHeadInfo(),
                            data: method === 'GET' ? Object.assign({}, res) : serialize(Object.assign({}, res)),
                            success: (res) => {
                              console.log(res)
                            }
                          })
                        }
                      }
                    })
                  }
                } else {
                  reject(res.data)
                }
              },
              fail: reject
            })
          },
          fail: function () {
            console.log('授权失败')
            // wx.removeStorageSync('persistKey')
            // wx.removeStorageSync('sessionId')
            if (responseData.data.code === '400040') {
              if (url.endsWith('home/head') || (url.indexOf('ic/item/detail/') !== -1)) {
                console.log(url)
                reject(responseData.data)
              } else {
                resolve(responseData.data)
              }
            } else {
              reWarning(url, method, params, resolve, reject, responseData)
            }
          }
        })
      }
    }
  })
}

function reWarning (url, method, params, resolve, reject, responseData) {
  wx.hideLoading()
  console.log('re warning')
  console.log(responseData)
  wx.showModal({
    title: '是否要打开设置页面重新授权',
    content: '需要获取您的公开信息（昵称，头像等），请到小程序的设置中打开用户信息授权',
    confirmText: '去设置',
    confirmColor: '#ef1e28',
    success: function (res) {
      if (res.confirm) {
        wx.openSetting({
          success: function (res) {
            if (res.authSetting['scope.userInfo']) {
              console.log('重新授权成功')
              wxLogin(url, method, params, resolve, reject, responseData)
            } else {
              if (responseData.data.code === '400040') {
                resolve(responseData.data)
              } else {
                reject(responseData.data)
              }
            }
          }
        })
      } else {
        console.log('取消')
        if (responseData.data.code === '400040') {
          console.log('正确')
          resolve(responseData.data)
        } else {
          console.log('错误')
          reject(responseData.data)
        }
      }
    }
  })
}
// function reAuth (url, method, params, resolve, reject, responseData) {
//   wx.hideLoading()
//   wx.showModal({
//     title: '您还没有登录',
//     content: '您当前未登录，部分功能将无法使用，请打开访问权限',
//     confirmText: '重新授权',
//     confirmColor: '#ef1e28',
//     success: function (res) {
//       if (res.confirm) {
//         wx.openSetting({
//           success: function (res) {
//             if (res.authSetting['scope.userInfo']) {
//               console.log('重新授权成功')
//               wxLogin(url, method, params, resolve, reject, responseData)
//             } else {
//               reject(responseData.data)
//             }
//           }
//         })
//       } else {
//         reject(responseData.data)
//       }
//     }
//   })
// }
module.exports = function (url, method, params) {
  return new Promise((resolve, reject) => {
    fetchMethod(url, method, params, resolve, reject)
  })
}
