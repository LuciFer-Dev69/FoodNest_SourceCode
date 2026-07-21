import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

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

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
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
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server login error", error: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id, "name email createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
}
