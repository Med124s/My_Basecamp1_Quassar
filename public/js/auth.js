// // js/auth.js
export async function logout() {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include" 
    });
  } catch (err) {
    console.error("Logout error:", err);
  }

  window.location.href = "/login";
}

export async function getCurrentUser() {
  const res = await fetch("/auth/me", {
    credentials: "include"
  });

  if (!res.ok) return null;
  return res.json();
}

