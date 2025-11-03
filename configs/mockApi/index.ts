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

  'GET /api/users/1': ({ req, res }) =>
    res.status(200).json({ id: 1, name: 'John' }),
  'GET /api/users/1/comments': ({ req, res }) =>
    res.status(200).json([
      { id: 1, text: 'Comment1' },
      { id: 1, text: 'Comment2' },
    ]),
  'GET /api/users/1/posts': ({ req, res }) => {
    return res.status(500).json('Server crash');
    // return res.status(200).json([{ id: 1, text: 'Post1' },{ id: 1, text: 'Post2' }]);
  },
};
