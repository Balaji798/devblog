import mongoose from "mongoose";
import Post from "./src/models/Post";
import Comment from "./src/models/Comment";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  const posts = await Post.find();
  let updated = 0;
  for (const post of posts) {
    const total = await Comment.countDocuments({
      post: post._id,
      isDeleted: false,
    });
    if (post.commentCount !== total) {
      post.commentCount = total;
      await post.save();
      updated++;
    }
  }
  console.log(
    `Migration complete! Successfully patched ${updated} legacy documents.`,
  );
  process.exit(0);
}
run();
