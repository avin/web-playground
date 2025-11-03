// @process
export {};

// Функция: validatePasswordMatch(password: string, confirmPassword: string): boolean
// Также нужно показывать ошибку в UI в реальном времени

const formEl = document.querySelector('form') as HTMLFormElement;
const passwordEl = document.querySelector(
  '[name="password"]',
) as HTMLInputElement;
const confirmPasswordEl = document.querySelector(
  '[name="confirmPassword"]',
) as HTMLInputElement;
const errorEl = document.querySelector('#error') as HTMLInputElement;

const validatePasswordMatch = (password: string, confirmPassword: string) => {
  return password === confirmPassword;
};

const handleChangePasswords = () => {
  if (passwordEl.value && confirmPasswordEl.value) {
    if (validatePasswordMatch(passwordEl.value, confirmPasswordEl.value)) {
      errorEl.innerText = '';
    } else {
      errorEl.innerText = 'Passwords do not match';
    }
  } else {
    errorEl.innerText = 'Type passwords';
  }
};

passwordEl.addEventListener('input', handleChangePasswords);
confirmPasswordEl.addEventListener('input', handleChangePasswords);

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
});

handleChangePasswords();
