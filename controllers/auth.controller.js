// controllers/auth.controller.js
const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // ✅ SESSION
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid"); // supprime le cookie de session
    res.json({ message: "Logged out successfully" });
  });
};

// Ajouter un nouvel utilisateur (Admin seulement)
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hash,
    role: role === "ADMIN" ? "ADMIN" : "USER",
  });

  res.json({ message: "User created successfully", user });
};

// REGISTER

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return res.status(400).json({ message: "Email already used" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashed,
    role: "USER"
  });

  res.json({ message: "Account created" });
};

exports.me = async (req, res) => {
  res.json({
    id: req.session.user.id,
    username: req.session.user.username,
    role: req.session.user.role,
  });
};
