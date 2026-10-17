async function fetchUser() {
  try {
    const userData = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = {
          id: 241929,
          name: "Muhammad Atif ",
          email: "241929@students.au.edu.pk",
          role: "Student"
        };

        const isSuccessful = true; 

        if (isSuccessful) {
          resolve(user);
        } else {
          reject(new Error("Failed to fetch user data"));
        }
      }, 1000);
    });

    return userData;
  } catch (error) {
    return error.message;
  }
}

fetchUser().then(data => console.log(data));
