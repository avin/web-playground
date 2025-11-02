// @process
export {};

const categories = [
  {
    id: 1,
    name: 'Electronics',
    children: [
      { id: 2, name: 'Laptops', children: [] },
      {
        id: 3,
        name: 'Phones',
        children: [
          { id: 4, name: 'iOS', children: [] },
          { id: 5, name: 'Android', children: [] },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Clothing',
    children: [],
  },
];

// Получить плоский массив: [{ id: 1, name: 'Electronics' }, { id: 2, name: 'Laptops' }, ...]

const flat = (items) => {
  let result: any[] = [];
  for (const item of items) {
    const { children, ...rest } = item;
    result.push(rest);
    if (children) {
      result.push(...flat(children));
    }
  }
  return result;
};

console.log(flat(categories));
