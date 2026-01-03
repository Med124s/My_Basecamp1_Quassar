const User = require("./User");
const Project = require("./Project");

// Relations
User.hasMany(Project, { foreignKey: "ownerId" });
Project.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = { User, Project };
