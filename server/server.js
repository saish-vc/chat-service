require("dotenv").config();
const http = require("http");
const { MongoMemoryServer } = require("mongodb-memory-server");



const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const config = require("./config");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const messageRoutes = require("./routes/messages");
const { registerSocketHandlers } = require("./sockets/index");
const User = require("./models/User");
const Room = require("./models/Room");
const Message = require("./models/Message");
const bcrypt = require("bcryptjs");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  config.clientUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api", messageRoutes);

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "chatwave-server" });
});

// Socket.IO
registerSocketHandlers(io);

async function seedDefaultRooms() {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log("Seeding default rooms...");
      let systemUser = await User.findOne({ username: "ChatWave" });
      if (!systemUser) {
        const passwordHash = await bcrypt.hash("chatwave123", 10);
        systemUser = await User.create({
          username: "ChatWave",
          email: "system@chatwave.local",
          passwordHash,
          avatarColor: "#6366f1",
          displayName: "ChatWave Bot",
        });
      }
      const general = await Room.create({
        name: "General",
        description: "Welcome to ChatWave! The default room for everyone.",
        createdBy: systemUser._id,
        members: [systemUser._id],
      });
      await Room.create({
        name: "Random",
        description: "Casual chatter and random topics.",
        createdBy: systemUser._id,
        members: [systemUser._id],
      });
      await Message.create({
        roomId: general._id,
        senderId: systemUser._id,
        username: "ChatWave",
        text: "Welcome to ChatWave! Feel free to chat with each other in real-time.",
        avatarColor: "#6366f1",
      });
      console.log("Default rooms seeded successfully.");
    }
  } catch (err) {
    console.error("Error seeding default rooms:", err.message);
  }
}

// Start
async function start() {
  let mongoUri = process.env.MONGO_URI;
  let isConnected = false;

  if (mongoUri && !mongoUri.includes("65214")) {
    try {
      await connectDB(mongoUri);
      isConnected = true;
    } catch (err) {
      console.log("Configured MONGO_URI failed, falling back to MongoMemoryServer...");
    }
  }

  if (!isConnected) {
    console.log("Starting in-memory MongoDB server...");
    const ms = await MongoMemoryServer.create();
    global.__MONGO_MS__ = ms;
    mongoUri = ms.getUri();
    process.env.MONGO_URI = mongoUri;
    console.log("MongoMemoryServer started URI:", mongoUri);
    await connectDB(mongoUri);
  }

  await seedDefaultRooms();

  server.listen(config.port, () => {
    console.log(`ChatWave server running on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("HTTP server closed");
  });
  if (global.__MONGO_MS__) {
    await global.__MONGO_MS__.stop();
    console.log("MongoMemoryServer stopped");
  }
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
module.exports = { app, server, io };
