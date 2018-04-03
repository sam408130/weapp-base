/**
 * 格式化时间
 * @param  {Datetime} source 时间对象
 * @param  {String} format 格式
 * @return {String}        格式化过后的时间
 */
function formatDate (source, format) {
  const o = {
    'M+': source.getMonth() + 1, // 月份
    'd+': source.getDate(), // 日
    'H+': source.getHours(), // 小时
    'm+': source.getMinutes(), // 分
    's+': source.getSeconds(), // 秒
    'q+': Math.floor((source.getMonth() + 3) / 3), // 季度
    'f+': source.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (source.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return format
}

function getParameterByName (name, url) {
  name = name.replace(/[\]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  var results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

function getObjectByQuery (scene) {
  var query = decodeURIComponent(scene)
  var paris = query.split('&')
  var result = {}
  paris.forEach(pair => {
    pair = pair.split('=')
    result[pair[0]] = pair[1] || ''
  })
  return result
}

function handleOptions (options) {
  console.log(options)
  const query = options.query
  const scene = options.scene.toString()
  var appId = ''
  if (options.referrerinfo) {
    appId = options.referrerinfo.appId || ''
  }
  if (scene.length === 4) {
    wx.setStorageSync('scene', scene)
    if (query) {
      if (query.appid) {
        appId = query.appid
      }
      wx.setStorageSync('utm_source', query.utm_source || '')
      wx.setStorageSync('utm_medium', query.utm_medium || '')
      wx.setStorageSync('invitercode', query.i || '')
      wx.setStorageSync('activity', query.activity || '')
    } else {
      wx.setStorageSync('utm_source', '')
      wx.setStorageSync('utm_medium', '')
    }
  } else {
    const queryObject = getObjectByQuery(scene)
    wx.setStorageSync('utm_source', queryObject.utm_source || '')
    wx.setStorageSync('utm_medium', queryObject.utm_medium || '')
    wx.setStorageSync('invitercode', queryObject.i || '')
    wx.setStorageSync('activity', query.activity || '')
  }
  wx.setStorageSync('referrerinfo', appId)
}

function handleScene (scene) {
  var id = ''
  const queryObject = getObjectByQuery(scene)
  if (queryObject.id) {
    id = queryObject.id
  }
  if (queryObject.utm_source) {
    wx.setStorageSync('utm_source', queryObject.utm_source)
  }
  if (queryObject.utm_medium) {
    wx.setStorageSync('utm_medium', queryObject.utm_medium)
  }
  if (queryObject.appid) {
    wx.setStorageSync('referrerinfo', queryObject.appid)
  }
  id = queryObject.id
  return id
}

module.exports = {
  formatDate,
  getParameterByName,
  getObjectByQuery,
  handleOptions,
  handleScene
}
