const express = require("express");
const router = express.Router();

const projectController = require("../controllers/project.controller");
const { isAuthenticatedApi } = require("../middleware/auth.middleware");

router.get("/", isAuthenticatedApi, projectController.getAll);
router.get("/:id", isAuthenticatedApi, projectController.getOne);
router.post("/", isAuthenticatedApi, projectController.create);
router.put("/:id", isAuthenticatedApi, projectController.update);
router.delete("/:id", isAuthenticatedApi, projectController.remove);

module.exports = router;
