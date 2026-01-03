document.addEventListener("DOMContentLoaded", async () => {
  /* ================= AUTH CHECK ================= */
  const authRes = await fetch("/auth/me");
  if (!authRes.ok) return (location.href = "/login.html");
  const currentUser = await authRes.json();

  document.getElementById("navbarUsername").textContent = currentUser.username;
  document.getElementById("navbarRole").textContent = currentUser.role;
  document.getElementById("userAvatar").textContent =
    currentUser.username[0].toUpperCase();

  if (currentUser.role !== "ADMIN") {
    document.querySelector(".admin-only").style.display = "none";
  }

  /* ================= SIDEBAR STATE (IMPORTANT) ================= */
  const sections = document.querySelectorAll(".section");
  const navBtns = document.querySelectorAll(".nav-btn");

  const savedSection = localStorage.getItem("activeSection") || "projects";
  activateSection(savedSection);

  navBtns.forEach((btn) => {
    btn.onclick = () => {
      const section = btn.dataset.section;
      localStorage.setItem("activeSection", section);
      activateSection(section);
    };
  });

  function activateSection(section) {
    sections.forEach((s) => s.classList.remove("active"));
    navBtns.forEach((b) => b.classList.remove("active"));
    if (document.getElementById(section)) {
      document.getElementById(section).classList.add("active");
    }
    document
      .querySelector(`.nav-btn[data-section="${section}"]`)
      .classList.add("active");

    if (section === "users" && currentUser.role === "ADMIN") {
      fetchUsers();
    }
    if (section === "projects") {
      fetchProjects();
    }
  }

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn").onclick = async () => {
    await fetch("/auth/logout", { method: "POST" });
    location.href = "/login.html";
  };

  /* ================= USERS CRUD ================= */
  const usersTable = document.getElementById("usersTable");
  const createUserBtn = document.getElementById("createUserBtn");
  const userModal = document.getElementById("userModal");
  const closeUserModal = document.getElementById("closeUserModal");
  const userForm = document.getElementById("userForm");
  const modalTitle = document.getElementById("modalTitle");
  const flash = document.getElementById("flash");

  let users = [];
  let editUserId = null;
  let currentPage = 1;

  /* ---------- FETCH USERS ---------- */
  async function fetchUsers(page = 1) {
    const res = await fetch(`/users?page=${page}`);
    if (!res.ok) return;

    const data = await res.json();

    users = data.users; // ✅ maintenant existe
    renderUsersTable();
    renderPagination(data.totalPages, data.currentPage);
  }

  function renderUsersTable() {
    usersTable.innerHTML = "";
    users.forEach((u) => {
      usersTable.innerHTML += `
        <tr>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button class="btn small info" onclick="viewUser(${u.id})">👁️</button>
            <button class="btn small primary" onclick="editUser(${u.id})">Edit</button>
            <button class="btn small danger" onclick="deleteUser(${u.id})">Delete</button>
        </td>
        </tr>
      `;
    });
  }

  /* ---------- PAGINATION ---------- */
  function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === currentPage ? "primary" : "";
      btn.onclick = () => fetchUsers(i);
      pagination.appendChild(btn);
    }
  }

  /* ---------- ADD / EDIT USER ---------- */
  createUserBtn.onclick = () => {
    editUserId = null;
    modalTitle.textContent = "Add User";
    userForm.reset();
    userModal.style.display = "flex";
  };

  closeUserModal.onclick = () => (userModal.style.display = "none");

  userForm.onsubmit = async (e) => {
    e.preventDefault();

    /* ===== VALIDATION ===== */
    if (!userForm.username.value || !userForm.email.value) {
      showFlash("Username and Email are required", "danger");
      return;
    }

    if (!editUserId && !userForm.password.value) {
      showFlash("Password is required", "danger");
      return;
    }

    const payload = {
      username: userForm.username.value.trim(),
      email: userForm.email.value.trim(),
      role: userForm.role.checked ? "ADMIN" : "USER",
    };

    if (userForm.password.value) {
      payload.password = userForm.password.value;
    }

    if (userForm.password.value) {
      payload.password = userForm.password.value;
    }

    const url = editUserId ? `/users/${editUserId}` : "/users";
    const method = editUserId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();

      showFlash(data.message || "User Saved successfully", "success");

      userModal.style.display = "none";
      editUserId = null;

      fetchUsers(currentPage);
    } catch (err) {
      showFlash("Error saving user", "danger");
    }
  };

  /* ---------- GLOBAL FUNCTIONS ---------- */
  window.editUser = (id) => {
    const u = users.find((x) => x.id === id);
    editUserId = id;
    modalTitle.textContent = "Edit User";
    userForm.username.value = u.username;
    userForm.email.value = u.email;
    userForm.role.checked = u.role === "ADMIN";
    userModal.style.display = "block";
  };

  let userToDelete = null;

  window.deleteUser = (id) => {
    userToDelete = id;
    document.getElementById("confirmDeleteModal").style.display = "block";
  };

  document.getElementById("confirmDeleteBtn").onclick = async () => {
    if (!userToDelete) return;
    const res = await fetch(`/users/${userToDelete}`, { method: "DELETE" });
    const data = await res.json();
    showFlash(data.message, "success");
    fetchUsers(currentPage);
    document.getElementById("confirmDeleteModal").style.display = "none";
    userToDelete = null;
  };

  document.getElementById("cancelDeleteBtn").onclick = () => {
    document.getElementById("confirmDeleteModal").style.display = "none";
    userToDelete = null;
  };

  document.getElementById("closeConfirmModal").onclick = () => {
    document.getElementById("confirmDeleteModal").style.display = "none";
    userToDelete = null;
  };

  function showFlash(msg, type) {
    flash.textContent = msg;
    flash.className = `flash ${type}`;
    flash.style.display = "block";
    setTimeout(() => (flash.style.display = "none"), 3000);
  }

  const viewUserModal = document.getElementById("viewUserModal");
  const closeViewUserModal = document.getElementById("closeViewUserModal");
  const closeViewBtn = document.getElementById("closeViewBtn");

  window.viewUser = (id) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;

    document.getElementById("detailId").textContent = u.id;
    document.getElementById("detailUsername").textContent = u.username;
    document.getElementById("detailEmail").textContent = u.email;
    document.getElementById("detailRole").textContent = u.role;
    document.getElementById("detailAvatar").textContent =
      u.username[0].toUpperCase();

    viewUserModal.style.display = "flex";
  };

  closeViewUserModal.onclick = () => (viewUserModal.style.display = "none");
  closeViewBtn.onclick = () => (viewUserModal.style.display = "none");

  /* fermer modal si clic en dehors */
  window.onclick = function (event) {
    if (event.target === viewUserModal) {
      viewUserModal.style.display = "none";
    }
  };

  // ================= PROJECTS  =================
  // ================= PROJECTS GRID =================

  const projectsGrid = document.getElementById("projectsGrid");
  const projectModal = document.getElementById("projectModal");
  const projectForm = document.getElementById("projectForm");
  const projectModalTitle = document.getElementById("projectModalTitle");
  const projectName = document.getElementById("projectName");
  const projectDescription = document.getElementById("projectDescription");

  let projects = [],
    editProjectId = null,
    currentProjectPage = 1;
  async function fetchProjects(page = 1) {
    currentProjectPage = page;
    const res = await fetch(`/projects?page=${page}`);
    if (!res.ok) {
      console.error("Error fetching projects");
      return;
    }
    const data = await res.json();
    projects = data.projects;
    renderProjects();
    renderProjectPagination(data.totalPages, data.currentPage);
  }
  function renderProjects() {
    projectsGrid.innerHTML = "";
    projects.forEach((p) => {
      projectsGrid.innerHTML += `
        <div class="project-card">
          <h3>${p.name}</h3>
          <p style="font-weight:bold">Owner: ${p.owner.username}</p>
          <p>${p.description || "No description"}</p>
          <div class="project-actions">
            <button class="btn small info" onclick="viewProject(${
              p.id
            })">👁️</button>
            <button class="btn small primary" onclick="editProject(${
              p.id
            })">✏️</button>
            <button class="btn small danger" onclick="deleteProject(${
              p.id
            })">🗑️</button>
          </div>
        </div>
      `;
    });
  }
  function renderProjectPagination(totalPages, currentPage) {
    const pagination = document.getElementById("projectsPagination");
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === currentPage ? "primary" : "";
      btn.onclick = () => fetchProjects(i);
      pagination.appendChild(btn);
    }
  }

  document.getElementById("createProjectBtn").onclick = () => {
    editProjectId = null;
    projectModalTitle.textContent = "Add Project";
    projectForm.reset();
    projectModal.style.display = "flex";
  };
  document.getElementById("closeProjectModal").onclick = () =>
    (projectModal.style.display = "none");

  projectForm.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: projectName.value.trim(),
      description: projectDescription.value.trim(),
    };
    const url = editProjectId ? `/projects/${editProjectId}` : "/projects";
    const method = editProjectId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Error");
      return;
    }
    projectModal.style.display = "none";
    fetchProjects(currentProjectPage);
  };

  window.editProject = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    editProjectId = id;
    projectModalTitle.textContent = "Edit Project";
    projectName.value = p.name;
    projectDescription.value = p.description || "";
    projectModal.style.display = "flex";
  };

  let deleteProjectId = null;

  /* VIEW PROJECT */
  window.viewProject = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;

    document.getElementById("viewProjectName").textContent = p.name;
    document.getElementById("viewProjectOwner").textContent = p.owner.username;
    document.getElementById("viewProjectDescription").textContent =
      p.description || "No description";

    document.getElementById("viewProjectModal").style.display = "flex";
  };

  window.closeViewModal = () => {
    document.getElementById("viewProjectModal").style.display = "none";
  };

  /* DELETE PROJECT */
  window.deleteProject = (id) => {
    deleteProjectId = id;
    document.getElementById("deleteConfirmModal").style.display = "flex";
  };

  window.closeDeleteModal = () => {
    deleteProjectId = null;
    document.getElementById("deleteConfirmModal").style.display = "none";
  };

  document.getElementById("confirmDeleteBtn").onclick = async () => {
    if (!deleteProjectId) return;

    const res = await fetch(`/projects/${deleteProjectId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Error deleting project");
      return;
    }

    closeDeleteModal();
    fetchProjects(currentProjectPage);
  };

  // window.deleteProject = (id) => {
  //   if (!confirm("Are you sure you want to delete this project?")) return;
  //   fetch(`/projects/${id}`, { method: "DELETE" }).then((res) => {
  //     if (!res.ok) return alert("Error deleting project");
  //     fetchProjects(currentProjectPage);
  //   });
  // };

  // window.viewProject = (id) => {
  //   const p = projects.find((x) => x.id === id);
  //   if (!p) return;
  //   alert(
  //     `Project: ${p.name}\nOwner: ${p.owner.username}\nDescription: ${
  //       p.description || "No description"
  //     }`
  //   );
  // };

  // // LOAD INIT
  fetchProjects();
  if (currentUser.role === "ADMIN") fetchUsers();
});
