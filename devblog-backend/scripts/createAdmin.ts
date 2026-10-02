import mongoose from "mongoose";
import readline from "readline";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../src/models/User";

// Load environment variables dynamically to connect to MongoDB
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function createAdmin() {
  console.log("\n==============================");
  console.log("SECURE ADMIN PROVISIONING CLI");
  console.log("==============================\n");

  const name = await question("Admin Full Name: ");
  const email = await question("Admin Email Address: ");
  const password = await question("Admin Password: ");

  console.log("\n[1/3] Connecting to MongoDB Database...");
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("[2/3] Verifying identity uniqueness...");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === "ADMIN") {
        console.log(
          `\n❌ Error: The user ${email} is already an Administrator.`,
        );
      } else {
        console.log(
          `\n⚠️ Notice: User ${email} already exists as a standard user. Elevating to ADMIN...`,
        );
        existingUser.role = "ADMIN";
        await existingUser.save();
        console.log(
          "✅ Success: Standard account permanently elevated to ADMIN tier.",
        );
      }
      process.exit(0);
    }

    console.log("[3/3] Engineering secure profile configuration...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      avatarIndex: Math.floor(Math.random() * 4) + 1,
    });

    await admin.save();
    console.log(
      `\n✅ HUGE SUCCESS! Admin account [${email}] has been forged into the database.`,
    );
    console.log("You may now log into the frontend /admin terminal securely!");
  } catch (err: any) {
    console.log(`\n❌ FATAL EXCEPTION: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

createAdmin();
