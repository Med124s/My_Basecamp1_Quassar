async function createProject() {
  const name = document.getElementById("name").value;
  const desc = document.getElementById("desc").value;

  await fetch("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description: desc })
  });

  location.reload();
}

async function logout() {
  await fetch("/auth/logout", { method: "POST" });
  window.location = "login.html";
}
