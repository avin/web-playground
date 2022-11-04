// @process

export {};

class InputSuffixMaker {
  constructor(
    public inputEl: HTMLInputElement,
    public suffixEl: HTMLDivElement,
  ) {}

  private getWidthOfInput() {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.inputEl.value;
    tmp.style.display = 'inline-block';
    document.body.appendChild(tmp);

    const inputStyles = getComputedStyle(this.inputEl);

    ['padding', 'font-size', 'font-family', 'letter-spacing'].forEach(
      (styleName) => {
        tmp.style[styleName] = inputStyles[styleName];
      },
    );

    const width = tmp.getBoundingClientRect().width;
    document.body.removeChild(tmp);
    return width;
  }

  private updateSuffixPadding = () => {
    const w = this.getWidthOfInput();
    this.suffixEl.style.paddingLeft = `${w}px`;
  };

  start() {
    this.inputEl.addEventListener('input', this.updateSuffixPadding);
    this.updateSuffixPadding();
  }

  stop() {
    this.inputEl.removeEventListener('input', this.updateSuffixPadding);
  }
}

const inputEl = document.querySelector('.input__input') as HTMLInputElement;
const inputSuffixEl = document.querySelector(
  '.input__suffix',
) as HTMLDivElement;

const inputSuffixMaker = new InputSuffixMaker(inputEl, inputSuffixEl);
inputSuffixMaker.start();
