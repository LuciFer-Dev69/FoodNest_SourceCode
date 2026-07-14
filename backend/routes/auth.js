import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { db } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

// Sign up
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash]
    );

    // Auto-login: sign a JWT token
    const token = jwt.sign({ id: result.insertId, name, email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: result.insertId,
      user: { id: result.insertId, name, email }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (!users || users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      return res.json({
        requires2FA: true,
        userId: user.id,
        email: user.email,
        name: user.name
      });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server login error", error: err.message });
  }
});

// Verify 2FA TOTP code for Login
router.post("/verify-2fa", async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ message: "User ID and code are required" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const verified = authenticator.check(code, user.two_factor_secret);

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server 2FA check error", error: err.message });
  }
});

// Setup 2FA (Generates Secret and QR Code)
router.post("/setup-2fa", authenticateToken, async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(req.user.email, "FoodNest", secret);
    
    // Temporarily save secret (verification will enable 2FA permanently)
    await db.execute(
      "UPDATE users SET two_factor_secret = ?, two_factor_enabled = 0 WHERE id = ?",
      [secret, req.user.id]
    );

    const qrDataUrl = await qrcode.toDataURL(otpauth);
    res.json({ secret, qrDataUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to setup 2FA", error: err.message });
  }
});

// Enable 2FA permanently after code validation
router.post("/enable-2fa", authenticateToken, async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Verification code required" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const user = users[0];

    const verified = authenticator.check(code, user.two_factor_secret);
    if (!verified) {
      return res.status(400).json({ message: "Invalid code. 2FA not enabled." });
    }

    await db.execute("UPDATE users SET two_factor_enabled = 1 WHERE id = ?", [req.user.id]);
    res.json({ message: "Two-Factor Authentication activated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server verification error", error: err.message });
  }
});

// Get current user profile (from JWT)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, name, email, two_factor_enabled, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: !!user.two_factor_enabled,
      createdAt: user.created_at,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

// Update current user profile
router.put("/profile", authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  try {
    await db.execute("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);
    res.json({ message: "Profile updated", name });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

export default router;

