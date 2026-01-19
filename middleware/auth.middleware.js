exports.isAuthenticatedPage = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// للـ API + JS
exports.isAuthenticatedApi = (req, res, next) => {
  if (req.session.user) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user?.role !== "ADMIN") {
    return res
      .status(403)
      .sendFile(path.join(__dirname, "../public/forbidden.html"));
  }
  next();
};

exports.isAdminPage = (req, res, next) => {
  if (req.session.user?.role === "ADMIN") return next();
  return res.redirect("/403");
};
