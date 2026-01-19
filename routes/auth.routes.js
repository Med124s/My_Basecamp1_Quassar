// routes/auth.routes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { isAuthenticatedApi } = require("../middleware/auth.middleware");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", authController.register);


// 🔥 USER INFO (session)
router.get("/me", isAuthenticatedApi, authController.me);


module.exports = router;
