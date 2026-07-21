import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password_hash: hash });

    const token = jwt.sign({ id: user._id, name, email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: user._id,
      user: { id: user._id, name, email }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.two_factor_enabled) {
      return res.json({
        requires2FA: true,
        userId: user._id,
        email: user.email,
        name: user.name
      });
    }

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server login error", error: err.message });
  }
});

router.post("/verify-2fa", async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ message: "User ID and code are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verified = authenticator.check(code, user.two_factor_secret);
    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server 2FA check error", error: err.message });
  }
});

router.post("/setup-2fa", authenticateToken, async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(req.user.email, "FoodNest", secret);

    await User.findByIdAndUpdate(req.user.id, {
      two_factor_secret: secret,
      two_factor_enabled: false
    });

    const qrDataUrl = await qrcode.toDataURL(otpauth);
    res.json({ secret, qrDataUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to setup 2FA", error: err.message });
  }
});

router.post("/enable-2fa", authenticateToken, async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Verification code required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verified = authenticator.check(code, user.two_factor_secret);
    if (!verified) {
      return res.status(400).json({ message: "Invalid code. 2FA not enabled." });
    }

    await User.findByIdAndUpdate(req.user.id, { two_factor_enabled: true });
    res.json({ message: "Two-Factor Authentication activated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server verification error", error: err.message });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "name email two_factor_enabled created_at");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: !!user.two_factor_enabled,
      createdAt: user.created_at,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  try {
    await User.findByIdAndUpdate(req.user.id, { name });
    res.json({ message: "Profile updated", name });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

export default router;
