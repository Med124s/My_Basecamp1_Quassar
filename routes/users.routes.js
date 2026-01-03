const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { isAuthenticated, isAdmin } = require("../middleware/auth.middleware");

/* ADMIN – GET ALL USERS */
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    res.json({
      users: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ADMIN – UPDATE ANY USER */
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  const data = { ...req.body };
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  await User.update(data, { where: { id: req.params.id } });
  res.json({ message: "User updated" });
});

/* ADMIN – DELETE USER */
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: "User deleted" });
});

router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hash,
      role: role === "ADMIN" ? "ADMIN" : "USER"
    });

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ADMIN – SET ADMIN ROLE */
router.put("/:id/admin", isAuthenticated, isAdmin, async (req, res) => {
  await User.update({ isAdmin: true }, { where: { id: req.params.id } });
  res.json({ message: "User promoted to admin" });
});

/* ADMIN – REMOVE ADMIN ROLE */
router.delete("/:id/admin", isAuthenticated, isAdmin, async (req, res) => {
  await User.update({ isAdmin: false }, { where: { id: req.params.id } });
  res.json({ message: "Admin role removed" });
});

/* USER – UPDATE OWN PROFILE */
router.put("/me/profile", isAuthenticated, async (req, res) => {
  const { username, email, password } = req.body;
  const data = { username, email };
  if (password) data.password = await bcrypt.hash(password, 10);
  await User.update(data, { where: { id: req.session.user.id } });
  res.json({ message: "Profile updated" });
});

module.exports = router;
