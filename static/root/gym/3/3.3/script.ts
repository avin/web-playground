// @process
export {};

class APICache {
  cache: Map<string, { data: any; timestamp: number }> = new Map<
    string,
    { data: any; timestamp: number }
  >();

  pending: Map<string, Promise<any>> = new Map<string, Promise<any>>();

  ttl: number; // time to live в миллисекундах

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  async fetch<T>(url: string, fetcher: () => Promise<T>): Promise<T> {
    // Если данные в кэше и не истекли - вернуть из кэша
    // Иначе - выполнить fetcher, сохранить в кэш, вернуть

    const cacheVal = this.cache.get(url);
    if (cacheVal && +new Date() - cacheVal.timestamp < this.ttl) {
      return cacheVal.data;
    }

    const pendingReq = this.pending.get(url);
    if (pendingReq) {
      return pendingReq;
    }

    const promise = fetcher();
    this.pending.set(url, promise);

    return promise
      .then((data) => {
        this.pending.delete(url);
        this.cache.set(url, {
          data,
          timestamp: Date.now(),
        });
        return data;
      })
      .catch((e) => {
        this.pending.delete(url);
        throw e;
      });
  }

  clear(): void {
    this.cache = new Map<string, { data: any; timestamp: number }>();
    this.pending = new Map<string, Promise<any>>();
  }
}

(async () => {
  // Использование:
  const cache = new APICache(1000); // 1 минута

  const d = await Promise.all([
    cache.fetch('/api/users/1', () =>
      fetch('/api/users/1').then((r) => r.json()),
    ),
    cache.fetch('/api/users/1', () =>
      fetch('/api/users/1').then((r) => r.json()),
    ),
  ]);

  console.log(d);

  const data1 = await cache.fetch('/api/users/1', () =>
    fetch('/api/users/1').then((r) => r.json()),
  );
  console.log(data1);

  await new Promise((r) => setTimeout(r, 1500));

  const data2 = await cache.fetch('/api/users/1', () =>
    fetch('/api/users/1').then((r) => r.json()),
  );
  console.log(data2);
})();
