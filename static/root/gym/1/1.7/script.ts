// @process
export {};

type BaseUser = { id: number; name: string; email: string };
type AdditionalData = { userId: number; avatar: string; role: string };

const baseUsers: BaseUser[] = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

const additionalData: AdditionalData[] = [
  { userId: 1, avatar: 'avatar1.jpg', role: 'admin' },
  { userId: 2, avatar: 'avatar2.jpg', role: 'user' },
  { userId: 3, avatar: 'avatar3.jpg', role: 'user' }, // нет в baseUsers
];

// Объединить по id/userId, добавить поля из additionalData

const mergeData = (baseUsers: BaseUser[], additionalData: AdditionalData[]) => {
  const additionalDataMap = additionalData.reduce((acc, item) => {
    acc[item.userId] = item;
    return acc;
  }, {} as Record<number, AdditionalData>);

  return baseUsers.map((user) => {
    if (!additionalDataMap[user.id]) {
      return user;
    }
    const { userId, ...additionalDataRest } = additionalDataMap[user.id];
    return {
      ...user,
      ...additionalDataRest,
    };
  });
};

console.log(mergeData(baseUsers, additionalData));
