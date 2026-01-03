const express = require("express");
const router = express.Router();
const { Project, User } = require("../models"); // <- utilise index.js
const { isAuthenticated } = require("../middleware/auth.middleware");

/* CREATE PROJECT */
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    if (!req.session.user?.id)
      return res.status(401).json({ message: "User not authenticated" });

    const project = await Project.create({
      name,
      description,
      ownerId: req.session.user.id,
    });

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* GET PROJECTS + PAGINATION */
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    const where =
      req.session.user.role === "ADMIN"
        ? {}
        : { ownerId: req.session.user.id };

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: { model: User, as: "owner", attributes: ["username"] },
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.json({
      projects: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* UPDATE PROJECT */
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.session.user.role !== "ADMIN" && project.ownerId !== req.session.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await project.update(req.body);
    res.json({ message: "Project updated", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* DELETE PROJECT */
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.session.user.role !== "ADMIN" && project.ownerId !== req.session.user.id)
      return res.status(403).json({ message: "Forbidden" });

    await project.destroy();
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

module.exports = router;
