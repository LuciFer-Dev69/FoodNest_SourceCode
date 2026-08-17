import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";

function freshUser() {
  return {
    name: "Test User",
    email: `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@kitchen.com`,
    password: "SecurePassword123",
  };
}

describe("Authentication API Endpoints", () => {
  afterAll(async () => {
    await User.deleteMany({ email: /test_.*@kitchen\.com/ });
    await mongoose.connection.close();
  });

  it("should register a new user successfully (2FA pending)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(freshUser());

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body.requires2FA).toBe(true);
    expect(res.body).toHaveProperty("code");
    expect(res.body.message).toBe("Account created. Verify your 2FA code to continue.");
  });

  it("should fail to register user with same email", async () => {
    const user = freshUser();
    await request(app).post("/api/auth/register").send(user);

    const res = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already exists");
  });

  it("should verify 2FA and return a JWT token", async () => {
    const user = freshUser();
    const registerRes = await request(app).post("/api/auth/register").send(user);
    expect(registerRes.status).toBe(201);

    const verifyRes = await request(app)
      .post("/api/auth/register/verify-2fa")
      .send({ userId: registerRes.body.userId, code: registerRes.body.code });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toHaveProperty("token");
    expect(verifyRes.body.user).toHaveProperty("email", user.email);
  });

  it("should login user and return a JWT token", async () => {
    const user = freshUser();
    const registerRes = await request(app).post("/api/auth/register").send(user);
    await request(app)
      .post("/api/auth/register/verify-2fa")
      .send({ userId: registerRes.body.userId, code: registerRes.body.code });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", user.email);
  });

  it("should reject incorrect password on login", async () => {
    const user = freshUser();
    await request(app).post("/api/auth/register").send(user);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "WrongPassword" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Incorrect password");
  });
});
