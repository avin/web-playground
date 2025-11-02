// @process
export {};

const products = [
  { id: 1, name: 'Laptop', category: 'Electronics', price: 1000 },
  { id: 2, name: 'Shirt', category: 'Clothing', price: 50 },
  { id: 3, name: 'Phone', category: 'Electronics', price: 800 },
  { id: 4, name: 'Jeans', category: 'Clothing', price: 80 },
];

// Нужно получить:
// {
//   Electronics: [{ id: 1, name: 'Laptop', price: 1000 }, { id: 3, name: 'Phone', price: 800 }],
//   Clothing: [{ id: 2, name: 'Shirt', price: 50 }, { id: 4, name: 'Jeans', price: 80 }]
// }

const groupBy = <T, K extends keyof T>(
  items: T[],
  key: K,
): Record<string, Omit<T, K>[]> => {
  return items.reduce((acc, item) => {
    const groupKey = String(item[key]);
    acc[groupKey] ||= [];

    const { [key]: _, ...rest } = item;
    acc[groupKey].push(rest);

    return acc;
  }, {});
};

const result = groupBy(products, 'category');

console.log(result);
