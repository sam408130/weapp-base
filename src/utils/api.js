const fetch = require('./fetch')
const apiconfig = require('./apiconfig')
const apiroot = apiconfig.apiroot

/* 修改fetch里面的login路径 */

/* apis */
const HomeHead = apiroot + 'home/head'
}

/* 支付成功通知 */
function paymentWeixin (params) {
  return fetch(PaymentWeixin, 'GET', params)
    .then(res => res.data)
}

module.exports = {
  paymentWeixin
}
