/**
 * 处理接口token
 */
const md5 = require('../vendor/md5')
const AppSecret = ''

function loadToken () {
  const time = new Date().getTime() / 1000
  const tempTime = parseInt(time).toString() + '000'
  const tempStr = tempTime + AppSecret
  const accessToken = md5.md5(tempStr)
  const dic = {
    time: tempTime,
    token: accessToken
  }
  return dic
}

module.exports = {
  loadToken: loadToken
}
