const bcrypt = require("bcrypt");
const { User } = require("../models");

/* ===== LIST USERS (pagination) ===== */
exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["id", "DESC"]],
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
};

/* ===== GET ONE USER ===== */
exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

/* ===== CREATE USER ===== */
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const exists = await User.findOne({ where: { email } });
  if (exists)
    return res.status(400).json({ message: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hash,
    role: role === "ADMIN" ? "ADMIN" : "USER",
  });

  res.json({ message: "User created", user });
};

/* ===== UPDATE USER ===== */
exports.updateUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  user.username = username;
  user.email = email;
  user.role = role === "ADMIN" ? "ADMIN" : "USER";

  await user.save();

  res.json({ message: "User updated" });
};

/* ===== DELETE USER ===== */
exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.destroy();
  res.json({ message: "User deleted" });
};

