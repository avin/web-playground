// @process
export {};

class VirtualScroll<T> {
  container: HTMLElement;
  items: T[];
  itemHeight: number;
  renderItem: (item: T) => string;
  inner: HTMLElement;

  innerChildNodes = new Map<number, HTMLElement>();

  constructor(
    container: HTMLElement,
    items: T[],
    itemHeight: number,
    renderItem: (item: T) => string,
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;

    const inner = document.createElement('div');
    this.inner = inner;
    //inner.style.contain = 'layout style paint';
    inner.style.height = `${this.items.length * this.itemHeight}px`;
    inner.style.position = 'relative';

    this.container.append(inner);

    let rafId: number | null = null;
    container.addEventListener(
      'scroll',
      () => {
        if (rafId) return; // Пропускаем если уже запланирован
        rafId = requestAnimationFrame(() => {
          this.render();
          rafId = null;
        });
      },
      { passive: true },
    );
    this.render();
  }

  createItemEl(i: number) {
    const itemHtml = this.renderItem(this.items[i]);
    const template = document.createElement('template');
    template.innerHTML = itemHtml.trim();
    const el = template.content.firstElementChild! as HTMLElement;

    el.style.position = 'absolute';
    el.style.width = '100%';
    el.style.transform = `translateY(${i * this.itemHeight}px)`;

    return el;
  }

  render(): void {
    const BUFFER = 5;

    let startItems = Math.floor(this.container.scrollTop / this.itemHeight);
    let endItems =
      startItems + Math.ceil(this.container.offsetHeight / this.itemHeight);

    startItems = Math.max(0, startItems - BUFFER);
    endItems = Math.min(endItems + BUFFER, this.items.length);

    // Удаляем элементы вне диапазона
    this.innerChildNodes.forEach((child, idx) => {
      if (idx < startItems || idx >= endItems) {
        child.remove();
        this.innerChildNodes.delete(idx);
      }
    });

    // Добавляем новые элементы
    const fragment = document.createDocumentFragment();
    for (let i = startItems; i < endItems; i++) {
      if (!this.innerChildNodes.has(i)) {
        const el = this.createItemEl(i);
        this.innerChildNodes.set(i, el);
        fragment.appendChild(el);
      }
    }

    if (fragment.hasChildNodes()) {
      this.inner.appendChild(fragment);
    }
  }
}

// items = Array(10000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` }))
// Должны быть видны только ~20 элементов одновременно

const listEl: HTMLElement = document.querySelector('#list')!;

const items = new Array(1000)
  .fill(0)
  .map((_, idx) => ({ id: idx, title: `Row_${idx}` }));

new VirtualScroll(listEl, items, 40, (item: { id: number; title: string }) => {
  return `<div style='height: 40px;' class='row'>${item.title}</div>`;
});
