import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function generateToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, provider: user.provider },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

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

    const user = await User.create({ name, email, password, provider: "local" });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, provider: user.provider, profilePicture: user.profilePicture },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during registration", error: err.message });
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

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (user.provider === "local") {
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        user.provider = "google";
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || "Google User",
        email,
        password: null,
        provider: "google",
        googleId,
        profilePicture: picture || null,
      });
    }

    const token = generateToken(user);

    const isNew = !user.createdAt || (Date.now() - user.createdAt.getTime() < 5000);

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
    const user = await User.findById(req.user.id, "name email profilePicture provider createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      provider: user.provider,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}
