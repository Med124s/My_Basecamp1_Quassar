
// js/pages/users.js
import { apiFetch } from "../api.js";

export function initUsers() {
  let currentPage = 1;
  const limit = 5;
  let totalPages = 1;
  let currentEditId = null;
  let userToDelete = null;

  const usersTable = document.getElementById("usersTable");
  const pagination = document.getElementById("pagination");
  const userModal = document.getElementById("userModal");
  const viewUserModal = document.getElementById("viewUserModal");
  const deleteUserModal = document.getElementById("confirmDeleteModal");

  const userForm = document.getElementById("userForm");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const roleSelect = document.getElementById("role");
  const userIdInput = document.getElementById("userId");

  // Close buttons
  document.getElementById("closeUserModal")?.addEventListener("click", closeUserModal);
  document.getElementById("closeViewUserModal")?.addEventListener("click", () => viewUserModal.style.display = "none");
  // document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => deleteUserModal.style.display = "none");
  document.getElementById("cancelDeleteUserBtn")?.addEventListener("click", () => deleteUserModal.style.display = "none");

  // ===== TOAST =====
  function toast(msg, type = "success") {
    const div = document.createElement("div");
    div.className = `toast ${type}`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  // ===== LOAD USERS =====
  async function loadUsers(page = 1) {
    currentPage = page;
    try {
      const data = await apiFetch(`/api/users?page=${page}&limit=${limit}`);
      renderUsers(data.users);
      totalPages = data.totalPages;
      renderPagination();
    } catch (err) {
      toast(err.message || "Cannot load users", "error");
    }
  }

  function renderUsers(users) {
    usersTable.innerHTML = "";
    users.forEach(u => {
      usersTable.innerHTML += `
        <tr>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button style="background-color:gray;color:#fff" class="btn small" data-action="view" data-id="${u.id}">View</button>
            <button style="background-color:green;color:#fff" class="btn small" data-action="edit" data-id="${u.id}">Edit</button>
            <button class="btn small danger" data-action="delete" data-id="${u.id}">Delete</button>
          </td>
        </tr>
      `;
    });

    usersTable.querySelectorAll("button").forEach(btn => {
      const id = btn.dataset.id;
      if (btn.dataset.action === "view") btn.onclick = () => viewUser(id);
      if (btn.dataset.action === "edit") btn.onclick = () => editUser(id);
      if (btn.dataset.action === "delete") btn.onclick = () => confirmDeleteUser(id);
    });
  }

  // ===== PAGINATION =====
  function renderPagination() {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = i === currentPage ? "active" : "";
      btn.onclick = () => loadUsers(i);
      pagination.appendChild(btn);
    }
  }

  // ===== MODALS =====
  function openUserModal() { userModal.style.display = "flex"; }
  function closeUserModal() {
    userModal.style.display = "none";
    userForm.reset();
    currentEditId = null;
  }

  // ===== VIEW USER =====
  async function viewUser(id) {
    try {
      const u = await apiFetch(`/api/users/${id}`);
      viewUserModal.querySelector("#detailUsername").innerText = u.username;
      viewUserModal.querySelector("#detailEmail").innerText = u.email;
      viewUserModal.querySelector("#detailRole").innerText = u.role;
      viewUserModal.style.display = "flex";
    } catch (err) {
      toast(err.message, "error");
    }
  }

  // ===== ADD / EDIT USER =====
  document.getElementById("createUserBtn")?.addEventListener("click", () => {
    currentEditId = null;
    openUserModal();
  });

  async function editUser(id) {
    try {
      const u = await apiFetch(`/api/users/${id}`);
      currentEditId = id;
      usernameInput.value = u.username;
      emailInput.value = u.email;
      passwordInput.value = "";
      roleSelect.value = u.role;
      openUserModal();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  userForm.onsubmit = async (e) => {
    e.preventDefault();

    if (!usernameInput.value.trim()) return toast("Username is required", "error");
    if (!emailInput.value.trim()) return toast("Email is required", "error");
    if (!currentEditId && !passwordInput.value.trim()) return toast("Password is required", "error");
    if (!roleSelect.value) return toast("Role is required", "error");

    const payload = {
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      role: roleSelect.value,
    };

    try {
      if (currentEditId) {
        await apiFetch(`/api/users/${currentEditId}`, { method: "PUT", body: JSON.stringify(payload) });
        toast("User updated");
      } else {
        await apiFetch(`/api/users`, { method: "POST", body: JSON.stringify(payload) });
        toast("User added");
      }
      closeUserModal();
      loadUsers(currentPage);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  // ===== DELETE USER =====
  function confirmDeleteUser(id) {
    userToDelete = id;
    deleteUserModal.style.display = "flex";
  }

  document.getElementById("confirmDeleteUserBtn")?.addEventListener("click", async () => {
    if (!userToDelete) return;
    try {
      await apiFetch(`/api/users/${userToDelete}`, { method: "DELETE" });
      toast("User deleted");
      loadUsers(currentPage);
      deleteUserModal.style.display = "none";
      userToDelete = null;
    } catch (err) {
      toast(err.message, "error");
    }
  });

  // ===== INITIAL LOAD =====
  loadUsers();
}
