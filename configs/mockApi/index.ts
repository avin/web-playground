export default {
  [`GET /`]: ({ res }) => {
    res
      .writeHead(302, {
        Location: '/index.html',
      })
      .end();
  },

  'GET /api/test1.do': ({ req, res }) =>
    res.status(200).json({ result: Math.random() }),

  'GET /api/test2.do': ({ req, res }) =>
    res.status(400).json({ result: Math.random() }),
};
