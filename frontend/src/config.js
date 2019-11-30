let protocol;
if (window.location.protocol === 'http:') {
  protocol = 'ws://';
} else if (window.location.protocol === 'https:') {
  protocol = 'wss://';
}
let webSocket = protocol + window.location.host;
let api = window.location.origin;
// 调试使用
if (process.env.NODE_ENV === 'development') {
  api = 'http://127.0.0.1:5000';
  webSocket = 'ws://127.0.0.1:5000';
}

// es5 导出
module.exports = { api: api, webSocket: webSocket };
// es6 导出
// export default { api: api, webSocket: webSocket };
