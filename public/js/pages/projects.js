import { apiFetch } from "../api.js";
const grid = document.getElementById("projectsGrid");
const modal = document.getElementById("projectModal");
const form = document.getElementById("projectForm");
const createBtn = document.getElementById("createProjectBtn");
const closeBtn = document.getElementById("closeProjectModal");

const nameInput = document.getElementById("projectName");
const descInput = document.getElementById("projectDescription");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
let currentEditId = null;

const nameError = document.getElementById("nameError");
const descError = document.getElementById("descError");

let currentPage = 0;
const pageSize = 6;

/* ================= INIT ================= */
export async function initProjects() {
  loadProjects();
}

/* ================= LOAD ================= */
async function loadProjects(page = 0) {
  currentPage = page;

  const res = await apiFetch("/api/projects");

  const projects = res.projects || res; // 🧠 مهم

  if (!Array.isArray(projects)) {
    grid.innerHTML = "<p>No projects found</p>";
    return;
  }

  const start = page * pageSize;
  const paginated = projects.slice(start, start + pageSize);

  renderProjects(paginated);
  renderPagination(projects.length);
}

/* ================= RENDER GRID ================= */
function renderProjects(projects) {
  grid.innerHTML = projects
    .map(
      (p) => `
    <div class="project-card">
      <h4>${p.name}</h4>
      <p>${p.description || "No description"}</p>
       <small><strong>Owner:</strong> ${p.owner?.username || "Unknown"}</small>
      <div class="card-actions">
        <button class="icon-btn view" data-id="${p.id}">👁</button>
        <button class="icon-btn edit" data-id="${p.id}">✏️</button>
        <button class="icon-btn delete" data-id="${p.id}">🗑</button>
      </div>
    </div>
  `
    )
    .join("");

  attachCardEvents();
  console.log(projects);
  
}
function renderPagination(total) {
  const pagination = document.getElementById("projectsPagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return;

  // PREV
  const prev = document.createElement("button");
  prev.textContent = "«";
  prev.disabled = currentPage === 0;
  prev.onclick = () => loadProjects(currentPage - 1);
  pagination.appendChild(prev);

  // PAGES
  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => loadProjects(i);
    pagination.appendChild(btn);
  }

  // NEXT
  const next = document.createElement("button");
  next.textContent = "»";
  next.disabled = currentPage === totalPages - 1;
  next.onclick = () => loadProjects(currentPage + 1);
  pagination.appendChild(next);
}

/* ================= EVENTS ================= */
function attachCardEvents() {
  document
    .querySelectorAll(".view")
    .forEach((btn) => (btn.onclick = () => viewProject(btn.dataset.id)));

  document
    .querySelectorAll(".edit")
    .forEach((btn) => (btn.onclick = () => editProject(btn.dataset.id)));

  document
    .querySelectorAll(".delete")
    .forEach((btn) => (btn.onclick = () => deleteProject(btn.dataset.id)));
}

/* ================= CREATE ================= */
createBtn.onclick = () => {
  currentEditId = null;
  form.reset();
  enableForm(true);
  clearErrors();

  modal.style.display = "flex";
};

/* ================= VIEW ================= */
// async function viewProject(id) {
//   const p = await apiFetch(`/api/projects/${id}`);

//   nameInput.value = p.name;
//   descInput.value = p.description || "";

//   enableForm(false);
//   modal.style.display = "flex";
// }

const viewModal = document.getElementById("viewModal");

async function viewProject(id) {
  const p = await apiFetch(`/api/projects/${id}`);

  document.getElementById("viewName").textContent = p.name;
  document.getElementById("viewDesc").textContent = p.description || "-";
  document.getElementById("viewOwner").textContent = p.owner.username || "-";

  viewModal.style.display = "flex";
}

// function closeView() {
//   viewModal.style.display = "none";
// }

const closeViewBtn = document.getElementById("closeViewBtn");

closeViewBtn.onclick = () => {
  viewModal.style.display = "none";
};

viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) {
    viewModal.style.display = "none";
  }
});

/* ================= EDIT ================= */
const modalTitle = document.querySelector("#projectModal h3");

async function editProject(id) {
  const p = await apiFetch(`/api/projects/${id}`);

  currentEditId = id;
  modalTitle.textContent = "Edit Project";

  nameInput.value = p.name;
  descInput.value = p.description || "";

  enableForm(true);
  modal.style.display = "flex";
}

/* ================= DELETE ================= */
// async function deleteProject(id) {
//   if (!confirm("Delete this project ?")) return;

//   await apiFetch(`/api/projects/${id}`, {
//     method: "DELETE",
//   });

//   loadProjects(currentPage);
// }

/* ================= SAVE (CREATE + UPDATE) ================= */
// form.onsubmit = async (e) => {
//   e.preventDefault();

//   const payload = {
//     name: nameInput.value.trim(),
//     description: descInput.value.trim(),
//   };

//   if (!payload.name) return alert("Project name required");

//   if (currentEditId) {
//     await apiFetch(`/api/projects/${currentEditId}`, {
//       method: "PUT",
//       body: JSON.stringify(payload),
//     });
//     showToast("Project Edited successfully", "success");
//   } else {
//     await apiFetch("/api/projects", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     });
//     showToast("Project Saved successfully", "success");
//   }

//   modal.style.display = "none";
//   loadProjects(currentPage);
// };

form.onsubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showToast("Please fix the errors", "danger");
    return;
  }

  const payload = {
    name: nameInput.value.trim(),
    description: descInput.value.trim(),
  };

  try {
    if (currentEditId) {
      await apiFetch(`/api/projects/${currentEditId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Project updated successfully", "success");
    } else {
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Project created successfully", "success");
    }

    modal.style.display = "none";
    loadProjects(currentPage);
    clearErrors();
  } catch (err) {
    showToast("Something went wrong", "danger");
  }
};

/* ================= MODAL ================= */
closeBtn.onclick = () => {
  modal.style.display = "none";
};

/* ================= HELPERS ================= */
function enableForm(state) {
  nameInput.disabled = !state;
  descInput.disabled = !state;
  form.querySelector("button[type='submit']").style.display = state
    ? "block"
    : "none";
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
// delete modal
let deleteId = null;

async function deleteProject(id) {
  deleteId = id;
  deleteModal.style.display = "flex";
}

confirmDeleteBtn.onclick = async () => {
  await apiFetch(`/api/projects/${deleteId}`, { method: "DELETE" });
  deleteModal.style.display = "none";
  showToast("Project deleted successfully", "success");
  loadProjects(currentPage);
};

cancelDeleteBtn.onclick = () => {
  deleteModal.style.display = "none";
};
function clearErrors() {
  nameError.textContent = "";
  descError.textContent = "";
  nameInput.classList.remove("error", "success");
  descInput.classList.remove("error", "success");
}

function validateForm() {
  let isValid = true;
  clearErrors();

  const name = nameInput.value.trim();
  const desc = descInput.value.trim();

  if (!name) {
    nameError.textContent = "Project name is required";
    nameInput.classList.add("error");
    isValid = false;
  } else if (name.length < 3) {
    nameError.textContent = "Minimum 3 characters";
    nameInput.classList.add("error");
    isValid = false;
  } else {
    nameInput.classList.add("success");
  }

  if (desc && desc.length < 5) {
    descError.textContent = "Minimum 5 characters";
    descInput.classList.add("error");
    isValid = false;
  } else if (desc) {
    descInput.classList.add("success");
  }

  return isValid;
}
