// @process
export {};

const tasks = [
  { id: 1, title: 'Fix bug', priority: 'high', date: '2024-01-15' },
  { id: 2, title: 'Review PR', priority: 'low', date: '2024-01-10' },
  { id: 3, title: 'Deploy', priority: 'high', date: '2024-01-10' },
  { id: 4, title: 'Meeting', priority: 'medium', date: '2024-01-12' },
];

// priority order: high > medium > low
// При одинаковом priority сортировать по date (раньше → первее)

const priorityToNum = (priority: string) => {
  return (
    {
      high: 0,
      medium: 1,
      low: 2,
    }[priority] || 0
  );
};

let result = tasks.sort((a, b) => {
  const r = priorityToNum(a.priority) - priorityToNum(b.priority);
  if (r !== 0) {
    return r;
  }
  return a.date.localeCompare(b.date);
});

console.log(result);
