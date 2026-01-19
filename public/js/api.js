// js/api.js
import { logout } from "./auth.js";
import { showLoader, hideLoader } from "./loader.js";

export async function apiFetch(url, options = {}) {
  showLoader();

  const res = await fetch(url, {
    ...options,
    credentials: "include", // 👈 session
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  hideLoader();

  if (res.status === 401) {
    await logout();
    return;
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Server error");
  }
  return res.json();
}
