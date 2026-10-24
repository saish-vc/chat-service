const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/auth");
const { asyncHandler } = require("../utils/error");

function serializeRoom(room) {
  const obj = room.toObject();
  return {
    _id: obj._id,
    name: obj.name,
    description: obj.description,
    createdBy: obj.createdBy,
    members: obj.members,
    memberCount: obj.members?.length || 0,
    createdAt: obj.createdAt,
  };
}

// List public rooms with member count
router.get("/", asyncHandler(async (req, res) => {
  const rooms = await Room.find()
    .populate({ path: "createdBy", select: "username avatarColor" })
    .sort({ createdAt: -1 });
  res.json({ rooms: rooms.map(serializeRoom) });
}));

// Create a public room
router.post("/", authMiddleware, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ message: "Room name is required (min 2 chars)" });
  }

  const existing = await Room.findOne({ name: name.trim() });
  if (existing) {
    return res.status(400).json({ message: "A room with that name already exists" });
  }

  const room = await Room.create({
    name: name.trim(),
    description: (description || "").trim(),
    createdBy: req.user._id,
    members: [req.user._id],
  });

  const populated = await room.populate({ path: "createdBy", select: "username avatarColor" });
  res.status(201).json({ room: serializeRoom(populated) });
}));

// Get a single room
router.get("/:id", asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate({ path: "createdBy", select: "username avatarColor" });
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  res.json({ room: serializeRoom(room) });
}));

// Join a room
router.post(
  "/:id/join",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    if (!room.members.some((m) => m.equals(req.user._id))) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json({ message: "Joined room", roomId: room._id });
  })
);

// Leave a room
router.post(
  "/:id/leave",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    room.members = room.members.filter((m) => !m.equals(req.user._id));
    await room.save();
    res.json({ message: "Left room", roomId: room._id });
  })
);

// Get paginated message history for a room
router.get("/:id/messages", asyncHandler(async (req, res) => {
  const { limit = 50, before } = req.query;
  const roomId = req.params.id;

  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  const query = { roomId };
  if (before) {
    query._id = { $lt: before };
  }

  const messages = await Message.find(query)
    .populate({ path: "senderId", select: "username avatarColor" })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10) || 50);

  const formatted = messages.map((m) => ({
    _id: m._id,
    roomId: m.roomId,
    senderId: m.senderId,
    sender: m.senderId
      ? { _id: m.senderId._id, username: m.senderId.username, avatarColor: m.senderId.avatarColor }
      : { _id: null, username: m.username, avatarColor: m.avatarColor },
    username: m.username,
    text: m.text,
    avatarColor: m.avatarColor,
    createdAt: m.createdAt,
  }));

  res.json({ messages: formatted });
}));

module.exports = router;
