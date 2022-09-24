const delay = require('mocker-api/utils/delay');

const proxy = {
  _proxy: {
    proxy: {
      '/api': 'https://api.server.com/',
    },
    changeHost: true,
    httpProxy: {
      options: {
        ignorePath: false,
      },
    },
  },
  'GET /api/test1.do': (req, res) =>
    res.status(200).json({ result: Math.random() }),
  'GET /api/test2.do': (req, res) =>
    res.status(400).json({ result: Math.random() }),
};

module.exports = delay(proxy, 1000);
