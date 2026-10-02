import mongoose from "mongoose";
import User from "../src/models/User";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  const users = await User.find().select("name email role");
  console.log("ALL USERS IN DATABASE:");
  console.log(JSON.stringify(users, null, 2));

  const notAdmins = await User.find({ role: { $ne: "ADMIN" } }).select(
    "name email role",
  );
  console.log("\nUSERS RETURNED BY $ne 'ADMIN':");
  console.log(JSON.stringify(notAdmins, null, 2));

  process.exit(0);
}
run();
