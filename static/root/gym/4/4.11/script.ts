// @process
export {};

class VirtualScroll {
  container: HTMLElement;
  items: any[];
  itemHeight: number;
  renderItem: (item: any) => string;
  itemsBlock: HTMLElement;

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    renderItem: (item: any) => string,
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;

    const itemsBlock = document.createElement('div');
    this.itemsBlock = itemsBlock;
    itemsBlock.style.position = 'absolute';
    itemsBlock.style.width = '100%';
    itemsBlock.style.willChange = 'transform';

    const inner = document.createElement('div');
    inner.style.height = `${this.items.length * this.itemHeight}px`;
    inner.style.position = 'relative';
    inner.append(itemsBlock);

    this.container.append(inner);

    container.addEventListener('scroll', this.render.bind(this));
    this.render();
  }

  // Рендерить только видимые элементы + buffer
  // При скролле обновлять отображаемые элементы
  // Создать "виртуальную" высоту контейнера

  render(): void {
    const BUFFER = 5;

    let startItems = Math.floor(this.container.scrollTop / this.itemHeight);
    let endItems =
      startItems + Math.ceil(this.container.offsetHeight / this.itemHeight);

    startItems = Math.max(0, startItems - BUFFER);
    endItems = Math.min(endItems + BUFFER, this.items.length);

    this.itemsBlock.style.transform = `translateY(${
      startItems * this.itemHeight
    }px)`;

    const htmlItems: string[] = [];
    for (let i = startItems; i < endItems; i++) {
      htmlItems.push(this.renderItem(this.items[i]));
    }
    this.itemsBlock.innerHTML = htmlItems.join('');
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
