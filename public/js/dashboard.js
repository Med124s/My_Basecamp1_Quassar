import { navigateTo, router } from "./router.js";
import { getCurrentUser } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ===== USER INFO =====
  const user = await getCurrentUser();
  if (!user) return;

  document.getElementById("navbarUsername").innerText = user.username;
  document.getElementById("navbarRole").innerText = user.role;

  if (user.role !== "ADMIN") {
    document
      .querySelectorAll(".admin-only")
      .forEach((btn) => (btn.style.display = "none"));
  }

  // ===== LOGOUT =====
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  });

  // ===== SIDEBAR NAV =====
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;
      if (route) navigateTo(route);
    });
  });

  router();
});
