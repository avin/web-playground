// @process
export {};

const user = {
  id: 1,
  profile: {
    name: 'John',
    address: {
      city: 'New York',
      street: '5th Avenue',
    },
  },
};

// Функция: get(object, path, defaultValue)
// get(user, 'profile.address.city') → 'New York'
// get(user, 'profile.phone.number') → undefined
// get(user, 'profile.phone.number', 'N/A') → 'N/A'

const get = (obj: any, keyStr: string, defaultVal?: string) => {
  const keyArr = keyStr.split('.');
  let subObj: any = obj;
  for (const key of keyArr) {
    if (subObj === null || subObj === undefined || !(key in subObj)) {
      return defaultVal;
    }
    subObj = subObj[key];
  }
  return subObj;
};

console.log(get(user, 'profile.address.city'), 'New York');
console.log(get(user, 'profile.phone.number'), undefined);
console.log(get(user, 'profile.phone.number', 'N/A'), 'N/A');
//
//
