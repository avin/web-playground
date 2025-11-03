// @process
export {};

class InfiniteScroll {
  page: number;
  loading: boolean;
  hasMore: boolean;
  items: any[];
  limit = 56;

  constructor() {
    this.page = 0;
    this.loading = false;
    this.hasMore = true;
    this.items = [];
  }

  async loadMore(): Promise<void> {
    if (this.loading || !this.hasMore) {
      return;
    }

    this.page++;
    this.loading = true;

    try {
      const res = await fetch(
        `/api/items?page=${this.page}&limit=${this.limit}`,
      );
      if (!res.ok) {
        throw new Error(`Error with status ${res.status}`);
      }
      const data = (await res.json()) as any[];

      this.items.push(...data);
      if (data.length < this.limit) {
        this.hasMore = false;
      }
    } catch (e) {
      this.page--;
      throw e;
    } finally {
      this.loading = false;
    }
  }

  reset(): void {
    this.page = 0;
    this.loading = false;
    this.hasMore = true;
    this.items = [];
    // Сбросить к первой странице
  }
}

const sentinel = document.querySelector('#sentinel')!;
const dataRows = document.querySelector('#rows')!;
const dataContainer = document.querySelector('#data')!;

const storage = new InfiniteScroll();

document.querySelector('#reset')?.addEventListener('click', () => {
  storage.reset();
  dataRows.innerHTML = '';
});

function isSentinelVisible(): boolean {
  const rect = sentinel.getBoundingClientRect();
  const containerRect = dataContainer.getBoundingClientRect();

  return rect.top < containerRect.bottom;
}

void (async () => {
  // Настраиваем наблюдатель
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Когда элемент становится видимым
        if (entry.isIntersecting) {
          console.log('Достигнут конец списка!');
          (async () => {
            await storage.loadMore();
            dataRows.innerHTML = '';
            storage.items.forEach((item) => {
              const rowEl = document.createElement('div');
              rowEl.className = 'row';
              rowEl.innerText = `ID: ${item.id}`;
              dataRows.append(rowEl);
            });

            // ⚠️ Рекурсивная загрузка если sentinel всё ещё виден
            if (isSentinelVisible() && storage.hasMore && !storage.loading) {
              console.log('🔁 Sentinel виден, загружаем ещё...');
              // Триггерим observer снова
              observer.unobserve(sentinel);
              observer.observe(sentinel);
            }
          })();
        }
      });
    },
    {
      root: dataContainer, // viewport браузера
      rootMargin: '0px',
      threshold: 0.1, // срабатывает при 10% видимости
    },
  );

  // Начинаем наблюдение
  observer.observe(sentinel);
})();

// API: GET /api/items?page=1&limit=20
