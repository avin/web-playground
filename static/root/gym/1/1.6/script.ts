// @process
export {};

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@company.com' },
];

// Функция: searchUsers(users, query)
// query = 'john' должен найти John Doe и Bob Johnson

const searchUsers = (users: User[], query: string): User[] => {
  query = query.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query),
  );
};

console.log(searchUsers(users, 'john'));
