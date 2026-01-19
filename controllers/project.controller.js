const { Project, User } = require("../models");

/* GET ALL PROJECTS */
exports.getAll = async (req, res) => {
  const where =
    req.session.user.role === "ADMIN"
      ? {}
      : { ownerId: req.session.user.id };

  const projects = await Project.findAll({
    where,
    include: { model: User, as: "owner", attributes: ["username"] },
    order: [["id", "DESC"]],
  });

  res.json(projects);
};

/* GET ONE PROJECT */
exports.getOne = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: { model: User, as: "owner", attributes: ["username"] },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
};

/* CREATE */
exports.create = async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description,
    ownerId: req.session.user.id,
  });

  res.json(project);
};

/* UPDATE */
exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ message: "Not found" });

  if (
    req.session.user.role !== "ADMIN" &&
    project.ownerId !== req.session.user.id
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await project.update(req.body);
  res.json(project);
};

/* DELETE */
exports.remove = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ message: "Not found" });

  await project.destroy();
  res.json({ message: "Deleted" });
};
