import Message from "../models/Message.js";

// Map of userId -> socketId
const onlineUsers = new Map();

export function initSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      // Broadcast updated online list to everyone
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`🟢 User connected: ${userId}`);
    }

    // ── Send a message ────────────────────────────────────────────
    socket.on("message:send", async ({ receiverId, text }) => {
      try {
        // Save to database
        const message = await Message.create({
          senderId:   userId,
          receiverId,
          text,
          status:     "sent",
        });

        const msgData = {
          _id:        message._id,
          senderId:   userId,
          receiverId,
          text,
          status:     "sent",
          createdAt:  message.createdAt,
        };

        // Send back to sender as confirmation
        socket.emit("message:sent", msgData);

        // Deliver to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          // Update status to delivered
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });
          msgData.status = "delivered";
          io.to(receiverSocketId).emit("message:receive", msgData);
        }
      } catch (err) {
        console.error("message:send error:", err.message);
      }
    });

    // ── Typing indicators ─────────────────────────────────────────
    socket.on("typing:start", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:start", { senderId: userId });
      }
    });

    socket.on("typing:stop", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:stop", { senderId: userId });
      }
    });

    // ── Read receipts ─────────────────────────────────────────────
    socket.on("message:read", async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: "read" });
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message:read", { messageId });
        }
      } catch (err) {
        console.error("message:read error:", err.message);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("users:online", Array.from(onlineUsers.keys()));
        console.log(`🔴 User disconnected: ${userId}`);
      }
    });
  });
}
