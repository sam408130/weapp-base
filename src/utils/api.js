const fetch = require('./fetch')
const md5 = require('./md5')
var apiroot = 'root api'
var HomeResult = apiroot + 'home/floor'

/* 获取验证token */
function getToken () {
  const url = apiroot + 'token'
  return fetch(url, 'GET')
    .then(res => {
      const token = res.data.data.token
      const tempStr = token + 'asdfdsafdsafdsafdsafdsaf'
      const accessToken = md5.md5(tempStr) + token
      wx.setStorageSync('accessToken', accessToken)
    })
}

/* 首页数据 */
function getHomeFloor () {
  return fetch(HomeResult, 'GET', { 'param': '0' })
    .then(res => res.data)
}

/* 优品供应商列表 */
function getYoupinList () {
  const url = apiroot + 'search/brands'
  return fetch(url, 'GET')
    .then(res => res.data)
}

module.exports = {
  getToken,
  getHomeFloor,
  getYoupinList
}
