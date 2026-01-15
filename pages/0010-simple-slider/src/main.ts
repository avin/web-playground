import './main.scss';

class Slider {
  options: {
    containerEl: HTMLElement | null;
    width: number;
    minValue: number;
    maxValue: number;
    onChange: (val: number) => void;
  } = {
    containerEl: null,
    width: 200,
    minValue: 0,
    maxValue: 100,
    onChange: () => {},
  };

  root: HTMLElement | null = null;
  mark: HTMLElement | null = null;
  lastTranslate = 0;
  currentTranslate = 0;
  isDragging = false;
  startX: number | null = null;

  constructor(options: Partial<typeof Slider.prototype.options> = {}) {
    Object.assign(this.options, options);

    if (!this.options.containerEl) return;

    this.root = this.options.containerEl;
    this.root.innerHTML = '';
    this.root.style.width = `${this.options.width}px`;

    this.init();
  }

  init() {
    if (!this.root) return;

    this.root.innerHTML = `
<div class='Slider'>
    <div class='Slider--line'>
        <div class='Slider--mark' data-id='mark'></div>
    </div>

    <div class='Slider--labels'>
        <div class='Slider--label Slider--label_left' data-id='label-left'>-1</div>
        <div class='Slider--label Slider--label_right' data-id='label-right'>1</div>
    </div>
</div>
`;

    this.mark = this.root.querySelector('[data-id="mark"]') as HTMLElement;
    const labelLeft = this.root.querySelector('[data-id="label-left"]');
    const labelRight = this.root.querySelector('[data-id="label-right"]');

    if (labelLeft) labelLeft.textContent = String(this.options.minValue);
    if (labelRight) labelRight.textContent = String(this.options.maxValue);

    if (this.mark) {
      this.mark.addEventListener('mousedown', (e) => this.handleStart(e));
      this.mark.addEventListener('touchstart', (e) => this.handleStart(e));
    }

    document.body.addEventListener('mouseup', () => this.handleEnd());
    document.body.addEventListener('mouseleave', () => this.handleEnd());
    document.body.addEventListener('touchend', () => this.handleEnd());

    document.body.addEventListener('mousemove', (e) => this.handleMove(e));
    document.body.addEventListener('touchmove', (e) => this.handleMove(e));
  }

  handleStart(e: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = this.getClientX(e);
  }

  handleEnd() {
    if (this.isDragging) {
      this.isDragging = false;
      this.currentTranslate = this.lastTranslate;
    }
  }

  handleMove(e: MouseEvent | TouchEvent) {
    if (!this.isDragging || !this.mark || this.startX === null) return;

    const pos = this.calcPos(this.getClientX(e));
    this.mark.style.transform = `translateX(${pos}px)`;
    this.lastTranslate = pos;

    const percentVal = pos / this.options.width;
    const val =
      (this.options.maxValue - this.options.minValue) * percentVal +
      this.options.minValue;
    this.options.onChange(Math.round(val));
  }

  getClientX(e: MouseEvent | TouchEvent): number {
    if ('touches' in e && e.touches[0]) {
      return e.touches[0].pageX;
    }
    if ('clientX' in e) {
      return e.clientX;
    }
    return 0;
  }

  calcPos(clientX: number): number {
    if (this.startX === null) return 0;
    const xDiff = clientX - this.startX;
    return Math.max(
      0,
      Math.min(this.options.width, this.currentTranslate + xDiff),
    );
  }
}

const sliderContainer = document.querySelector('#slider') as HTMLElement;
if (sliderContainer) {
  const valueEl = document.querySelector('#value') as HTMLElement;

  new Slider({
    containerEl: sliderContainer,
    minValue: -100,
    maxValue: 100,
    width: 200,

    onChange: (val) => {
      if (valueEl) {
        valueEl.textContent = String(val);
      }
    },
  });
}
