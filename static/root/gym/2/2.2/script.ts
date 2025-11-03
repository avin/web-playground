// @process
export {};

// Функция: validatePassword(password: string)
// Возвращает объект: { valid: boolean, errors: string[] }

// Требования:
// - Минимум 8 символов
// - Хотя бы одна заглавная буква
// - Хотя бы одна цифра
// - Хотя бы один спецсимвол (!@#$%^&*)

type CheckResult = { valid: boolean; errors: string[] };

const validatePassword = (password: string): CheckResult => {
  const result: CheckResult = { valid: true, errors: [] };

  if (password.length < 8) {
    result.valid = false;
    result.errors.push('Минимум 8 символов');
  }

  if (!/[A-Z]/.test(password)) {
    result.valid = false;
    result.errors.push('Хотя бы одна заглавная буква');
  }

  if (!/[0-9]/.test(password)) {
    result.valid = false;
    result.errors.push('Хотя бы одна цифра');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    result.valid = false;
    result.errors.push('Хотя бы один спецсимвол');
  }

  return result;
};

console.log(validatePassword('Test123'));
