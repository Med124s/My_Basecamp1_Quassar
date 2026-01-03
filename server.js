const express = require("express");
const session = require("express-session");
const path = require("path");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("./config/database");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const projectsRoutes = require("./routes/projects.routes");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: "mybasecamp_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
    store: new SequelizeStore({ db }),
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes API
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/projects", projectsRoutes);

// Default admin
async function createDefaultAdmin() {
  const adminExists = await User.findOne({ where: { role: "ADMIN" } });
  if (!adminExists) {
    await User.create({
      username: "admin",
      email: "admin@mybasecamp.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    });
    console.log("✅ Admin par défaut créé");
  }
}

// Serve index/dashboard
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public/dashboard.html"))
);

// Start server
db.sync()
  .then(async () => {
    console.log("Database synced");
    await createDefaultAdmin();
    app.listen(3000, () =>
      console.log("Server running on http://localhost:3000")
    );
  })
  .catch((err) => console.error("DB sync error:", err));
