import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Activity from "../models/Activity.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      profilePicture: user.profilePicture || null,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const code = generateCode();
    const user = await User.create({
      name, email, password, provider: "local",
      twoFactorCode: code,
      twoFactorPending: true,
    });

    res.status(201).json({
      message: "Account created. Verify your 2FA code to continue.",
      requires2FA: true,
      userId: user._id,
      code,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration", error: err.message });
  }
}

export async function verifyRegister2FA(req, res) {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ message: "User ID and code required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.twoFactorPending) return res.status(400).json({ message: "2FA already verified" });

    if (user.twoFactorCode !== code) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    user.twoFactorPending = false;
    user.twoFactorCode = null;
    await user.save();

    await Notification.create({
      recipientUser: user._id,
      senderUser: null,
      type: "system",
      title: "Welcome to FoodNest!",
      message: "Start by adding items to your inventory or exploring donations near you.",
      relatedId: null,
      isRead: false,
    });

    await Activity.create({
      userId: user._id,
      type: "joined",
      description: "Joined FoodNest",
    });

    const token = generateToken(user);

    res.json({
      message: "2FA verified. Welcome to FoodNest!",
      token,
      user: { id: user._id, name: user.name, email: user.email, provider: user.provider, profilePicture: user.profilePicture },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify 2FA", error: err.message });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const code = generateCode();
    user.otpCode = code;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.json({
      message: "Reset code generated. Check your email (or below for testing).",
      otp: code,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function resetPassword(req, res) {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({ message: "Email, OTP, and new password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP code has expired" });
    }

    user.password = password;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password", error: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Account not found" });
    }

    if (user.provider === "google") {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please continue with Google." });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, provider: user.provider, profilePicture: user.profilePicture },
    });
  } catch (err) {
    res.status(500).json({ message: "Server login error", error: err.message });
  }
}

export async function googleAuth(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential required" });
  }

  if (!googleClient) {
    return res.status(500).json({ message: "Google authentication is not configured" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account must have an email address" });
    }

    let isNew = false;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (user.provider === "local") {
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        user.provider = "google";
        await user.save();
      }
    } else {
      isNew = true;
      user = await User.create({
        name: name || "Google User",
        email,
        password: null,
        provider: "google",
        googleId,
        profilePicture: picture || null,
      });

      await Notification.create({
        recipientUser: user._id,
        senderUser: null,
        type: "system",
        title: "Welcome to FoodNest!",
        message: "Start by adding items to your inventory or exploring donations near you.",
        relatedId: null,
        isRead: false,
      });

      await Activity.create({
        userId: user._id,
        type: "joined",
        description: "Joined FoodNest via Google",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: isNew ? "Welcome to FoodNest!" : `Welcome back, ${user.name}!`,
      token,
      user: { id: user._id, name: user.name, email: user.email, provider: user.provider, profilePicture: user.profilePicture },
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to authenticate with Google", error: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id, "name email profilePicture provider username country city phone bio createdAt lastLogin");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      provider: user.provider,
      username: user.username,
      country: user.country,
      city: user.city,
      phone: user.phone,
      bio: user.bio,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}
