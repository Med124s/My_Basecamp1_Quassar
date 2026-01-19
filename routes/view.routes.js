const express = require("express");
const { isAuthenticatedPage, isAdminPage } = require("../middleware/auth.middleware");
const viewController = require("../controllers/view.controller");
const path = require("path"); // ✅ THIS WAS MISSING
const router = express.Router();
// Racine
router.get("/", (req, res) => res.redirect("/login"));
// Pages publiques
router.get("/login", viewController.showLogin);
router.get("/register", viewController.showRegister);
// Dashboard SPA (IMPORTANT)
router.get("/dashboard", isAuthenticatedPage, viewController.showDashboard);
router.get(/^\/dashboard(\/.*)?$/, isAuthenticatedPage, viewController.showDashboard);
router.get("/dashboard/projects", isAuthenticatedPage, viewController.showDashboard);
// 🔐 ADMIN ONLY PAGE
router.get(
  "/dashboard/users",
  isAuthenticatedPage,
  isAdminPage,
  viewController.showDashboard
);
module.exports = router;
