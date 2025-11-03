// @process
export {};

// Создать функцию debounce, которая откладывает выполнение
// Используется так:
const searchAPI = (query: string) => {
  console.log('Searching for:', query);
  // fetch API call
};

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  timeout: number,
): ((this: ThisParameterType<T>, ...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: ThisParameterType<T>, ...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, timeout);
  };
};

// const debouncedSearch = debounce(searchAPI, 300);

class SearchComponent {
  name = 'SearchComponent';
  query = '';

  search = debounce(function (this: SearchComponent, value: string) {
    this.query = value;
    console.log(this.name, this.query);
  }, 300);
}

const obj = new SearchComponent();

document.querySelector('input')?.addEventListener('input', (e: any) => {
  obj.search(e.target.value);
});

// При вводе "hello":
// h - запуск таймера
// he - сброс таймера, новый запуск
// hel - сброс таймера, новый запуск
// ... через 300ms после последнего ввода - вызов функции
