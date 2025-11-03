// @process
export {};

const debounce = (func, timeout) => {
  let tid;
  return function (this: any, ...args) {
    const context = this;
    clearTimeout(tid);
    tid = setTimeout(() => {
      func.apply(context, args);
    }, timeout);
  };
};

// Создать класс FormAutoSave
class FormAutoSave {
  formEl: HTMLFormElement | null = null;
  state = {};
  localStorageKey = 'form';

  constructor(formId: string, saveDelay: number = 1000) {
    this.formEl = document.getElementById(formId) as HTMLFormElement;
    this.localStorageKey = `form_${formId}`;
    if (!this.formEl) {
      return;
    }

    const handleChangeInput = debounce((e) => {
      const name = e.target.name;
      const value = e.target.value;
      this.state[name] = value;

      try {
        const formState = JSON.stringify(this.state);
        localStorage.setItem(this.localStorageKey, formState);
        console.log('formStateSaved', formState);
      } catch {}
    }, saveDelay);

    // Один обработчик на всю форму!
    this.formEl.addEventListener('input', (e) => {
      if (e.target instanceof HTMLInputElement) {
        handleChangeInput(e);
      }
    });

    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      try {
        localStorage.removeItem(this.localStorageKey);
        location.reload();
      } catch {}
    });

    this.loadState();
  }

  private loadState() {
    try {
      const formState = localStorage.getItem(this.localStorageKey);
      if (!formState) {
        return;
      }
      this.state = JSON.parse(formState);
      for (const [name, value] of Object.entries(this.state)) {
        const inputEl = this.formEl?.querySelector(
          `input[name="${name}"]`,
        ) as HTMLInputElement;
        if (inputEl) {
          inputEl.value = value as string;
        }
      }
    } catch {}
  }

  // При изменении любого поля - сохранять через debounce
  // Восстанавливать данные при загрузке
  // Очищать при успешной отправке
}

// Использование:
const autoSave = new FormAutoSave('registration-form');
