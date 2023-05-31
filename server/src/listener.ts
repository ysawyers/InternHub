import { Server } from "socket.io";
import { prisma } from "./db/connection";
import app from "./app";
import http from "http";
import { ChatMessage } from "./utils/types";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:3000",
  },
});

io.on("connection", (socket) => {
  socket.on("join-chat", (payload: { messageId: string }) => {
    socket.join(payload.messageId);
  });

  // FIX: Potential DB Trigger applied
  socket.on("new-message", async (payload: any) => {
    if (payload.isNewRelationship) {
      await prisma.messages.create({
        data: {
          id: payload.messageId,
          senderId: payload.senderId,
          receiverId: payload.relationship.recipientId,
          lastMessage: payload.body,
          lastSenderId: payload.senderId,
        },
      });
    }

    await prisma.chat.create({
      data: {
        messageId: payload.messageId,
        senderId: payload.senderId,
        body: payload.body,
      },
    });
    await prisma.messages.update({
      where: {
        id: payload.messageId,
      },
      data: {
        lastMessage: payload.body,
        lastSenderId: payload.senderId,
      },
    });

    io.in(payload.messageId).emit("new-message", {
      messageId: payload.messageId,
      senderId: payload.senderId,
      body: payload.body,
    });
  });

  socket.on("toggle-typing", async (payload: any) => {
    socket.to(payload.messageId).emit("toggle-typing", { isTyping: payload.isTyping });
  });
});

server.listen(process.env.PORT, () => {
  console.log(`[server]: Server listening on port ${process.env.PORT}`);
});
