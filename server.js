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

connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins
const allowedOrigins = [
  "https://desichat-app.onrender.com",
  "http://localhost:5173"
];

// ✅ Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// init socket
initSocket(io);

// ✅ Express CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "PulseChat backend is running ✅" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});