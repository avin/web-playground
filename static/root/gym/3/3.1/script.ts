// @process
export {};

type User = { id: number; name: string };
type Comment = { id: number; text: string };
type Post = { id: number; text: string };

type FetchUserDataResult = {
  user: null | User;
  posts: null | Post[];
  comments: null | Comment[];
};
async function fetchUserData(userId: string): Promise<FetchUserDataResult> {
  // Загрузить параллельно:
  // - /api/users/:id
  // - /api/users/:id/posts
  // - /api/users/:id/comments

  // Вернуть объект со всеми данными

  const getData = async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    return res.json() as T;
  };

  const [userData, postsData, commentsData] = await Promise.allSettled([
    getData<User>(`/api/users/${userId}`),
    getData<Post[]>(`/api/users/${userId}/posts`),
    getData<Comment[]>(`/api/users/${userId}/comments`),
  ]);

  return {
    user: userData.status === 'fulfilled' ? userData.value : null,
    posts: postsData.status === 'fulfilled' ? postsData.value : null,
    comments: commentsData.status === 'fulfilled' ? commentsData.value : null,
  };
}

void (async () => {
  try {
    const data = await fetchUserData('1');
    console.log('data=', data);
  } catch (e) {
    console.warn('Error!!!', e);
  }
})();
