// @process
export {};

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
): Promise<T> {
  // Реализовать retry логику
  // При каждой неудаче ждать перед следующей попыткой (1s, 2s, 4s - exponential backoff)

  let curTry = 0;

  while (curTry < maxRetries) {
    await new Promise((r) => setTimeout(r, curTry * 2000));

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Response Status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (e) {
      curTry++;
    }
  }

  throw new Error('max tries ended');
}

fetchWithRetry('/api/users/1/posts', {}, 3)
  .then((data) => {
    console.log('data=', data);
  })
  .catch((e) => {
    console.log('err=', e);
  });
