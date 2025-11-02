// @process
export {};

type Author = { id: number; name: string };

type Comment = {
  id: number;
  text: string;
  author: Author;
};

type Post = {
  id: number;
  title: string;
  author: Author;
  comments: Comment[];
};

const posts: Post[] = [
  {
    id: 1,
    title: 'Post 1',
    author: { id: 101, name: 'John' },
    comments: [
      { id: 201, text: 'Great!', author: { id: 102, name: 'Jane' } },
      { id: 202, text: 'Nice', author: { id: 103, name: 'Bob' } },
    ],
  },
  {
    id: 2,
    title: 'Post 2',
    author: { id: 102, name: 'Jane' },
    comments: [{ id: 203, text: 'Cool', author: { id: 101, name: 'John' } }],
  },
];

// Нужно получить:
// {
//   posts: { 1: { id: 1, title: 'Post 1', authorId: 101, commentIds: [201, 202] }, ... },
//   comments: { 201: { id: 201, text: 'Great!', authorId: 102 }, ... },
//   users: { 101: { id: 101, name: 'John' }, ... }
// }

type Normalized = {
  posts: Record<
    string,
    Omit<Post, 'author' | 'comments'> & {
      authorId: number;
      commentIds: number[];
    }
  >;
  comments: Record<string, Omit<Comment, 'author'> & { authorId: number }>;
  users: Record<string, Author>;
};
const normalize = (posts: Post[]): Normalized => {
  const result: Normalized = {
    posts: {},
    comments: {},
    users: {},
  };

  posts.forEach((post) => {
    const { comments, author, ...rest } = post;
    const commentIds: number[] = [];
    comments.forEach((comment) => {
      commentIds.push(comment.id);
      const { author, ...rest } = comment;
      result.comments[comment.id] ||= { ...rest, authorId: author.id };
      result.users[author.id] ||= author;
    });

    result.users[author.id] ||= author;
    result.posts[post.id] ||= { ...rest, authorId: author.id, commentIds };
  });

  return result;
};

const result = normalize(posts);

console.log(result);
