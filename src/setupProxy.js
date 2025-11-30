const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://torytestsv.kro.kr',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] 요청:', req.method, req.path);
        
        // CORS Preflight 요청 처리
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.status(200).end();
          return;
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[Proxy] 응답:', proxyRes.statusCode, req.path);
        
        // 백엔드 응답 헤더에 CORS 추가
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      onError: (err, req, res) => {
        console.error('[Proxy] 에러:', err.message);
        res.status(500).json({
          error: 'Proxy Error',
          message: err.message
        });
      }
    })
  );
};
