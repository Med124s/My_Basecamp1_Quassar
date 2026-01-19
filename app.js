const express = require("express");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const path = require("path");
const { db } = require("./models");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "basecamp-secret",
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({ db }),
  })
);
// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ROUTES
app.use("/", require("./routes/view.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/api/projects", require("./routes/projects.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use((req, res) => {
  res.status(403).sendFile(path.join(__dirname, "public", "forbidden.html"));
});

module.exports = app;
