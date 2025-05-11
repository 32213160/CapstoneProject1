// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/upload',
    createProxyMiddleware({
      target: 'http://54.180.122.103:8080',
      changeOrigin: true,
    })
  );
  // 필요하다면 다른 경로도 추가 가능
};
