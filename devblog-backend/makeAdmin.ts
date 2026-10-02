import mongoose from "mongoose";
import User from "./src/models/User";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  const result = await User.updateMany({}, { $set: { role: "ADMIN" } });
  console.log(
    `\nSuccess! Recursively elevated ${result.modifiedCount} users to ADMIN role in MongoDB.`,
  );
  process.exit(0);
}
run();
