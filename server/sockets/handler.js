const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// In-memory presence map: userId -> { socketId, username, avatarColor, rooms: Set }
const presence = new Map();

function getPresence(userId) {
  return presence.get(userId);
}

function getAllPresence() {
  const out = [];
  for (const [userId, data] of presence.entries()) {
    out.push({
      userId,
      socketId: data.socketId,
      username: data.username,
      avatarColor: data.avatarColor,
      rooms: Array.from(data.rooms),
      displayName: data.displayName,
    });
  }
  return out;
}

function setPresence(userId, data) {
  presence.set(userId, data);
}

function removeSocketFromPresence(socketId) {
  for (const [userId, data] of presence.entries()) {
    if (data.socketId === socketId) {
      presence.delete(userId);
      break;
    }
  }
}

function getUserRooms(userId) {
  const p = presence.get(userId);
  return p ? Array.from(p.rooms) : [];
}

function broadcastOnlineUsers(roomId, io, excludeSocketId) {
  const users = [];
  for (const [userId, data] of presence.entries()) {
    if (data.rooms.has(roomId) && data.socketId !== excludeSocketId) {
      users.push({
        _id: userId,
        username: data.username,
        avatarColor: data.avatarColor,
        socketId: data.socketId,
      });
    }
  }
  io.to(roomId).emit("online_users", { roomId, users });
}

function serializeMessage(doc) {
  return {
    _id: doc._id,
    roomId: doc.roomId,
    senderId: doc.senderId,
    username: doc.username,
    text: doc.text,
    avatarColor: doc.avatarColor,
    createdAt: doc.createdAt,
  };
}

function registerSocketHandlers(io) {
  io.on("connection", async (socket) => {
    let currentUser = null;
    let currentRoom = null;
    console.log(`[Socket] Connection established: ${socket.id}`);

    async function applyUserAuth(token) {
      if (!token) return null;
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-passwordHash");
        if (!user) {
          console.log(`[Socket] User not found for token id: ${decoded.userId}`);
          return null;
        }
        currentUser = user;
        setPresence(user._id.toString(), {
          socketId: socket.id,
          username: user.username,
          avatarColor: user.avatarColor,
          rooms: new Set(),
          displayName: user.displayName || user.username,
        });
        socket.userId = user._id.toString();
        socket.username = user.username;
        socket.avatarColor = user.avatarColor;
        console.log(`[Socket] Authenticated @${user.username} (${user._id}) on ${socket.id}`);
        return user;
      } catch (err) {
        console.log(`[Socket] Auth error: ${err.message}`);
        return null;
      }
    }

    // Register authenticate listener synchronously
    socket.on("authenticate", async (token, cb) => {
      console.log(`[Socket] 'authenticate' event on ${socket.id}`);
      const user = await applyUserAuth(token);
      if (user) {
        if (typeof cb === "function") cb({ ok: true });
      } else {
        if (typeof cb === "function") cb({ error: "Invalid token" });
      }
    });

    // Auto-detect auth from handshake auth token or cookie in background
    const rawCookie = socket.handshake.headers?.cookie || "";
    const cookieMatch = rawCookie.match(/(?:^|;\s*)token=([^;]+)/);
    const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
    const initialToken = socket.handshake.auth?.token || cookieToken;
    if (initialToken) {
      applyUserAuth(initialToken).catch(() => {});
    }

    socket.on("join_room", async ({ roomId }, cb) => {
      if (!currentUser) {
        return cb && cb({ error: "Not authenticated" });
      }
      try {
        const room = await Room.findById(roomId).populate({
          path: "members",
          select: "username avatarColor",
        });
        if (!room) {
          return cb && cb({ error: "Room not found" });
        }

        if (!room.members.some((m) => m._id.toString() === socket.userId)) {
          room.members.push(currentUser._id);
          await room.save();
        }

        if (currentRoom) {
          socket.leave(currentRoom);
          const p = presence.get(socket.userId);
          if (p) p.rooms.delete(currentRoom);
          io.to(currentRoom).emit("user_left", {
            roomId: currentRoom,
            userId: socket.userId,
            username: socket.username,
            avatarColor: socket.avatarColor,
          });
          broadcastOnlineUsers(currentRoom, io, socket.id);
        }

        socket.join(roomId);
        currentRoom = roomId;
        const p = presence.get(socket.userId);
        if (p) p.rooms.add(roomId);

        io.to(roomId).emit("user_joined", {
          roomId,
          userId: socket.userId,
          username: socket.username,
          avatarColor: socket.avatarColor,
        });

        broadcastOnlineUsers(roomId, io, null);

        const messages = await Message.find({ roomId })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        const history = messages.reverse().map(serializeMessage);
        cb && cb({ ok: true, history });
      } catch (err) {
        console.error("join_room error:", err);
        cb && cb({ error: "Failed to join room" });
      }
    });

    socket.on("leave_room", ({ roomId }, cb) => {
      if (!currentUser) return;
      const roomToLeave = roomId || currentRoom;
      if (!roomToLeave) return cb && cb({ error: "Not in a room" });

      socket.leave(roomToLeave);
      const p = presence.get(socket.userId);
      if (p) p.rooms.delete(roomToLeave);
      io.to(roomToLeave).emit("user_left", {
        roomId: roomToLeave,
        userId: socket.userId,
        username: socket.username,
        avatarColor: socket.avatarColor,
      });
      broadcastOnlineUsers(roomToLeave, io, socket.id);
      if (currentRoom === roomToLeave) currentRoom = null;
      cb && cb({ ok: true });
    });

    socket.on("send_message", async ({ roomId, text }, cb) => {
      if (!currentUser) {
        return cb && cb({ error: "Not authenticated" });
      }
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return cb && cb({ error: "Message text is required" });
      }
      if (text.trim().length > 2000) {
        return cb && cb({ error: "Message too long" });
      }
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          return cb && cb({ error: "Room not found" });
        }

        const message = await Message.create({
          roomId,
          senderId: currentUser._id,
          username: currentUser.username,
          text: text.trim(),
          avatarColor: currentUser.avatarColor,
        });

        const populated = await message.populate({
          path: "senderId",
          select: "username avatarColor",
        });

        const payload = serializeMessage(populated);
        io.to(roomId).emit("receive_message", { message: payload });
        cb && cb({ ok: true, message: payload });
      } catch (err) {
        console.error("send_message error:", err);
        cb && cb({ error: "Failed to send message" });
      }
    });

    let typingTimeout = null;
    socket.on("typing", ({ roomId, isTyping }) => {
      if (!currentUser) return;
      if (isTyping) {
        clearTimeout(typingTimeout);
        socket.to(roomId).emit("typing", {
          roomId,
          userId: socket.userId,
          username: socket.username,
          avatarColor: socket.avatarColor,
        });
        typingTimeout = setTimeout(() => {
          socket.to(roomId).emit("typing", {
            roomId,
            userId: socket.userId,
            username: socket.username,
            avatarColor: socket.avatarColor,
            stopped: true,
          });
        }, 2000);
      } else {
        clearTimeout(typingTimeout);
        socket.to(roomId).emit("typing", {
          roomId,
          userId: socket.userId,
          username: socket.username,
          avatarColor: socket.avatarColor,
          stopped: true,
        });
      }
    });

    socket.on("get_online_users", ({ roomId }, cb) => {
      const users = [];
      for (const [userId, data] of presence.entries()) {
        if (data.rooms.has(roomId) && data.socketId !== socket.id) {
          users.push({
            _id: userId,
            username: data.username,
            avatarColor: data.avatarColor,
          });
        }
      }
      cb && cb({ roomId, users });
    });

    socket.on("disconnect", () => {
      if (!currentUser) return;
      const p = presence.get(currentUser._id.toString());
      const rooms = p ? Array.from(p.rooms) : [];
      removeSocketFromPresence(socket.id);

      for (const roomId of rooms) {
        io.to(roomId).emit("user_left", {
          roomId,
          userId: currentUser._id.toString(),
          username: currentUser.username,
          avatarColor: currentUser.avatarColor,
        });
        broadcastOnlineUsers(roomId, io, null);
      }

      currentUser = null;
      currentRoom = null;
    });
  });

  return io;
}

module.exports = {
  registerSocketHandlers,
  getPresence,
  getAllPresence,
  setPresence,
  removeSocketFromPresence,
};
