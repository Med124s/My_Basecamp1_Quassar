import { initProjects } from "./pages/projects.js";
import { initUsers } from "./pages/users.js";

export function navigateTo(path) {
  history.pushState({}, "", path);
  router();
}

export function router() {
  const path = window.location.pathname;

  // hide all sections
  document.querySelectorAll(".section").forEach(s =>
    s.classList.remove("active")
  );

  // remove active nav
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.classList.remove("active")
  );

  // ROUTES
  if (path === "/dashboard" || path === "/dashboard/projects") {
    document.getElementById("projects").classList.add("active");
    activateBtn("/dashboard/projects");

    initProjects(); // ✅ IMPORTANT
    return;
  }

  if (path === "/dashboard/users") {
    document.getElementById("users").classList.add("active");
    activateBtn("/dashboard/users");

    initUsers(); // ✅ IMPORTANT
    return;
  }
}

function activateBtn(route) {
  const btn = document.querySelector(`[data-route="${route}"]`);
  if (btn) btn.classList.add("active");
}

// BACK / FORWARD
window.addEventListener("popstate", router);
