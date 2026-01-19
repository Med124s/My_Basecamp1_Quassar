const db = require("../config/database");

const User = require("./User");
const Project = require("./Project");

/* Associations */
User.hasMany(Project, { foreignKey: "ownerId", as: "projects" });
Project.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = {
  db,
  User,
  Project,
};
