// const bcrypt = require("bcrypt");
// const User = require("./models/User");

// async function createDefaultAdmin() {
//   try {
//     const adminEmail = "admin@mybasecamp.com";
//     const existing = await User.findOne({ where: { email: adminEmail } });

//     if (!existing) {
//       const hashed = await bcrypt.hash("admin123", 10);
//       await User.create({
//         username: "admin",
//         email: adminEmail,
//         password: hashed,
//         isAdmin: true
//       });
//       console.log("✅ Default ADMIN user created: admin@mybasecamp.com / admin123");
//     } else {
//       console.log("ℹ️ Admin user already exists");
//     }
//   } catch (err) {
//     console.error("Error creating default admin:", err);
//   }
// }

// module.exports = createDefaultAdmin;
