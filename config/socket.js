import Message from "../models/Message.js";

// Map of userId -> socketId
const onlineUsers = new Map();

export function initSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`🟢 User connected: ${userId}`);
    }

    // ── Send a message ────────────────────────────────────────────
    socket.on("message:send", async ({ receiverId, text, imageUrl }) => {
      console.log("📩 NEW MESSAGE ATTEMPT:");
      console.log("- From User:", userId);
      console.log("- To User:", receiverId);
      console.log("- Has Image:", !!imageUrl);

      try {
        // 1. Save to database
        const message = await Message.create({
          senderId: userId,
          receiverId,
          text,
          imageUrl, // Make sure this is in your Message Model!
          status: "sent",
        });

        const msgData = {
          _id: message._id,
          senderId: userId,
          receiverId,
          text,
          imageUrl,
          status: "sent",
          createdAt: message.createdAt,
        };

        // 2. Send back to sender as confirmation
        socket.emit("message:sent", msgData);

        // 3. Deliver to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        console.log("- Receiver Socket ID found:", receiverSocketId);

        if (receiverSocketId) {
          console.log("🚀 SENDING TO RECEIVER NOW...");
          
          // Update status to delivered since we found their socket
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });
          msgData.status = "delivered";
          
          io.to(receiverSocketId).emit("message:receive", msgData);
        } else {
          console.log("❌ RECEIVER IS OFFLINE (No socket ID found)");
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