// @process
export {};

const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

// Функция: paginate(array, page, pageSize)
// paginate(items, 1, 10) → items 1-10
// paginate(items, 2, 10) → items 11-20

const paginate_OLD = <T>(arr: T[], page: number, pageSize: number): T[] => {
  const result: T[] = [];
  const startPos = (page - 1) * pageSize;
  for (let i = startPos; i < startPos + pageSize; i++) {
    if (i < arr.length) {
      result.push(arr[i]);
    }
  }
  return result;
};

const paginate = <T>(arr: T[], page: number, pageSize: number): T[] => {
  return arr.slice((page - 1) * pageSize, page * pageSize);
};

console.log(paginate(items, 1, 10), 'items 1-10');
console.log(paginate(items, 2, 10), 'items 11-20');
