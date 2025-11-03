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

  'GET /api/items': ({ req, res, query }) => {
    // page=1&limit=20

    const page = Number(query.page);
    const limit = Number(query.limit);

    const items: any[] = [];

    const end = Math.min(limit * page, 200);
    for (let i = Math.max(limit * (page - 1), 0); i < end; i++) {
      items.push({ id: i + 1 });
    }

    return res.status(200).json(items);
  },
};
