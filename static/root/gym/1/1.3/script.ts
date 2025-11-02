// @process
export {};

const users = [
  { id: 1, email: 'john@example.com', name: 'John' },
  { id: 2, email: 'jane@example.com', name: 'Jane' },
  { id: 3, email: 'john@example.com', name: 'Johnny' }, // дубликат
  { id: 4, email: 'bob@example.com', name: 'Bob' },
];

// Оставить уникальные по email (первое вхождение)

const m = {};
const result = users.reduce((acc, item) => {
  if (!m[item['email']]) {
    m[item['email']] = true;
    acc.push(item);
  }
  return acc;
}, [] as { id: number; email: string; name: string }[]);

console.log(result);
