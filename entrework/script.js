function addPost() {
  const input = document.getElementById("postInput");
  const text = input.value;

  if (!text) return;

  const post = document.createElement("div");
  post.className = "post";
  post.innerText = text;

  document.getElementById("feed").prepend(post);

  input.value = "";
}
