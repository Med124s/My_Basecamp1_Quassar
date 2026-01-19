const app = require("./app");
const { db } = require("./models");
const seedDefaultUsers = require("./models/seedDefaultUsers");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.authenticate();
    console.log("✅ Database connected");

    await db.sync();
    await seedDefaultUsers();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err);
  }
})();
