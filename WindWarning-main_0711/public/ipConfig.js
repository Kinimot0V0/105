// window.g = {
//   localBaseUrl: 'http://localhost:8080'
// }
(function () {
  // 从浏览器获取 origin（包含协议和主机[:端口]）
  var origin = window.location && window.location.origin
    ? window.location.origin
    : (window.location.protocol + '//' + window.location.host)

  // 判断是否为本地开发环境（localhost / 127.0.0.1 / file:）
  var isLocal = (function (o) {
    if (!o) return false
    if (o.indexOf('file:') === 0) return true
    return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(o)
  })(origin)

  var base
  if (isLocal) {
    // 本地固定使用 http://localhost:8080
    base = 'http://localhost:8080'
  } else {
    // 非本地使用浏览器 origin + 后端路径
    var backendPath = '/ewsAdmin'
    base = origin.replace(/\/+$/, '') + backendPath
  }

  window.g = {
    localBaseUrl: base
  }
})()