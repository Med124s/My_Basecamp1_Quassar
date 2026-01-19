const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const { isAuthenticatedApi, isAdmin } = require("../middleware/auth.middleware");

router.get("/", isAuthenticatedApi, isAdmin, controller.listUsers);
router.get("/:id", isAuthenticatedApi, isAdmin, controller.getUser);
router.post("/", isAuthenticatedApi, isAdmin, controller.createUser);
router.put("/:id", isAuthenticatedApi, isAdmin, controller.updateUser);
router.delete("/:id", isAuthenticatedApi, isAdmin, controller.deleteUser);

module.exports = router;
