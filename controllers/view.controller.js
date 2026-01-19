const path = require("path");

// Afficher login
exports.showLogin = (req, res) => {
  if (req.session.user) return res.redirect("/dashboard"); // déjà loggé
  res.sendFile(path.join(__dirname, "../public/login.html"));
};

// Afficher register
exports.showRegister = (req, res) => {
  if (req.session.user) return res.redirect("/dashboard"); // déjà loggé
  res.sendFile(path.join(__dirname, "../public/register.html"));
};

// Afficher dashboard
exports.showDashboard = (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));

};

