import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

// ✅ Connect DB
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://desichat-app.onrender.com",
];

// ================= SOCKET =================
const io = new Server(server, {
  // ✅ FIX 1: Increase Socket.io buffer size to 50MB
  // This allows large Base64 image strings to pass through the socket
  maxHttpBufferSize: 5e7, 
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// attach io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// init socket logic
initSocket(io);

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ✅ FIX 2: Increase Express JSON limit to 50MB
// This ensures that if you ever send images via standard POST requests, they aren't blocked
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({ message: "PulseChat backend running ✅" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});