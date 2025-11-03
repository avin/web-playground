// @process
export {};

// Функция: validateEmail(email: string): boolean
// Должна проверять базовую корректность email

const validateEmail = (str: string): boolean => {
  return /^[a-z0-9.+_-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(str);
};

console.log(validateEmail('test@example.com'), true);
console.log(validateEmail('test@example'), false);
console.log(validateEmail('test.name+tag@example.co.uk'), true);
console.log(validateEmail('@example.com'), false);
console.log(validateEmail('test@@example.com'), false);
