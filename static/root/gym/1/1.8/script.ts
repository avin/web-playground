// @process
export {};

const orders = [
  { id: 1, total: 100, status: 'completed' },
  { id: 2, total: 250, status: 'completed' },
  { id: 3, total: 150, status: 'pending' },
  { id: 4, total: 300, status: 'completed' },
];

// Вычислить:
// - totalRevenue (только completed)
// - averageOrder
// - completedCount

let totalRevenue = 0;
let averageOrder = 0;
let completedCount = 0;

orders.forEach((order) => {
  if (order.status === 'completed') {
    totalRevenue += order.total;
    completedCount += 1;
  }
  averageOrder += order.total;
});
averageOrder = averageOrder / orders.length;

console.log({
  totalRevenue,
  averageOrder,
  completedCount,
});
