import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./utils/logger";

let io: Server;
// Active mapping architecture restricting global broadcasts and enabling targeted notifications natively
const userSockets = new Map<string, string>();

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    // Rely on authenticated user ID resolving natively during explicit frontend handshake
    const userId = socket.handshake.query.userId as string;

    if (userId && userId !== "undefined") {
      userSockets.set(userId, socket.id);
      logger.info(`WebSocket established natively: Target ${userId}`);
    }

    socket.on("disconnect", () => {
      if (userId && userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
        logger.info(`WebSocket safely dismantled: Target ${userId}`);
      }
    });
  });

  return io;
};

// Abstracted notification transmitter decoupled structurally from services
export const emitNotification = (userId: string, payload: any) => {
  if (!io) return;
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit("notification_received", payload);
  }
};
