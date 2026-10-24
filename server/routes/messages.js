const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Room = require("../models/Room");
const authMiddleware = require("../middleware/auth");
const { asyncHandler } = require("../utils/error");

function serializeMessage(doc) {
  return {
    _id: doc._id,
    roomId: doc.roomId,
    senderId: doc.senderId,
    sender: doc.senderId
      ? { _id: doc.senderId._id, username: doc.senderId.username, avatarColor: doc.senderId.avatarColor }
      : { _id: null, username: doc.username, avatarColor: doc.avatarColor },
    username: doc.username,
    text: doc.text,
    avatarColor: doc.avatarColor,
    createdAt: doc.createdAt,
  };
}

// Send a message (REST fallback; primary path is Socket.IO)
router.post(
  "/rooms/:id/messages",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Message text is required" });
    }
    if (text.trim().length > 2000) {
      return res.status(400).json({ message: "Message too long" });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const message = await Message.create({
      roomId: room._id,
      senderId: req.user._id,
      username: req.user.username,
      text: text.trim(),
      avatarColor: req.user.avatarColor,
    });

    const populated = await message.populate({
      path: "senderId",
      select: "username avatarColor",
    });

    res.status(201).json({
      message: serializeMessage(populated),
    });
  })
);

module.exports = router;
