import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import logger from "./utils/logger";
import { createServer } from "http";
import { initSocket } from "./socket";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/devblog";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB");

    // Abstract Express application natively onto standard TCP networking socket wrappers
    const server = createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

startServer();
