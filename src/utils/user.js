const api = require('./api')

/* 登录 */
function doLogin (params) {
  api.loginByAccount(params)
    .then(data => {
      console.log(data)
      // api.getUserInfo()
    })
}

module.exports = {
  doLogin: doLogin
}
