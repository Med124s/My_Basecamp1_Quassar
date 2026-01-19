const bcrypt = require("bcrypt");
const { User } = require("./index");

module.exports = async function seedDefaultUsers() {
  const adminEmail = "admin@admin.com";
  const userEmail = "user@user.com";

  const adminExists = await User.findOne({ where: { email: adminEmail } });
  if (!adminExists) {
    const hash = await bcrypt.hash("admin123", 10);
    await User.create({
      username: "admin",
      email: adminEmail,
      password: hash,
      role: "ADMIN",
    });
    console.log("✅ Admin account created");
  }

  const userExists = await User.findOne({ where: { email: userEmail } });
  if (!userExists) {
    const hash = await bcrypt.hash("user123", 10);
    await User.create({
      username: "user",
      email: userEmail,
      password: hash,
      role: "USER",
    });
    console.log("✅ User account created");
  }
};
