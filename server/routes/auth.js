const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { asyncHandler } = require("../utils/error");
const { signToken } = require("../utils/jwt");

// Signup
router.post(
  "/signup",
  [
    body("username").trim().isLength({ min: 3, max: 30 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("avatarColor").optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, avatarColor, displayName } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      passwordHash,
      avatarColor: avatarColor || "#6366f1",
      displayName: displayName || username,
    });

    const token = signToken({ userId: user._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      message: "Account created",
      user: serializeUser(user),
      token,
    });
  })
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ userId: user._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      message: "Logged in",
      user: serializeUser(user),
      token,
    });
  })
);

// Get current user
router.get("/me", authMiddleware, asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
}));

// Update current user profile
router.put(
  "/me",
  authMiddleware,
  [
    body("displayName").optional().trim().isLength({ min: 1, max: 50 }),
    body("avatarColor").optional().isString(),
    body("username").optional().trim().isLength({ min: 3, max: 30 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, avatarColor, username } = req.body;
    const update = {};
    if (displayName) update.displayName = displayName;
    if (avatarColor) update.avatarColor = avatarColor;
    if (username && username !== req.user.username) {
      const taken = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (taken) {
        return res.status(400).json({ message: "Username already taken" });
      }
      update.username = username;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true }
    );

    res.json({ user: serializeUser(user) });
  })
);

// Logout (clear cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
});

function serializeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

module.exports = router;
