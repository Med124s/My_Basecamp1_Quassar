function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function isAdmin(req, res, next) {
  if (!req.session || req.session.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

module.exports = { isAuthenticated, isAdmin };
