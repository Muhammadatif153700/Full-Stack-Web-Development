async function getUser(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  const user = await response.json();

  if (!user.id || !user.name || !user.email) {
    throw new Error("Invalid user details");
  }

  return user;
}

async function getPosts(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const posts = await response.json();

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Invalid post details");
  }

  return posts;
}

async function getAllDetails(id) {
  try {
    const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
    return { user, posts };
  } catch (error) {
    throw new Error(`Main Promise Rejected: ${error.message}`);
  }
}

getUser(1)
  .then(user => console.log("Task 1 - Valid user:", user))
  .catch(err => console.log("Task 1 Error:", err.message));

getAllDetails(1)
  .then(data => console.log("Task 2 - Main Promise Accepted:", data))
  .catch(err => console.log("Task 2 Error:", err.message));
