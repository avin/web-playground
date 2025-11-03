// @process
export {};

interface ValidationRule {
  field: string;
  validate: (value: string) => string | null; // null если валидно, иначе текст ошибки
}

class FormValidator {
  rules: Record<string, (v: string) => string | null> = {};

  constructor(rules: ValidationRule[]) {
    rules.forEach((rule) => {
      this.rules[rule.field] = rule.validate;
    });
  }

  validateField(field: string, value: string): string | null {
    if (!this.rules[field]) {
      throw new Error('no validator for this field');
    }
    return this.rules[field](value);
  }

  validateAll(formData: Record<string, string>): Record<string, string | null> {
    return Object.keys(formData).reduce((acc, key) => {
      acc[key] = this.validateField(key, formData[key]);
      return acc;
    }, {});
  }
}

const validateEmail = (str: string): boolean => {
  return /[a-z0-9.+-]+@[a-z0-9.+-]+\.[a-z]{2,}$/.test(str);
};

// Пример использования:
const validator = new FormValidator([
  {
    field: 'email',
    validate: (v) => (validateEmail(v) ? null : 'Invalid email'),
  },
  {
    field: 'password',
    validate: (v) => (v.length >= 8 ? null : 'Min 8 characters'),
  },
]);

console.log(validator.validateField('email', 'example@foo.com'));
console.log(validator.validateField('email', 'example@'));
console.log(
  validator.validateAll({
    email: 'example@foo.com',
    password: 'zzz',
  }),
);
