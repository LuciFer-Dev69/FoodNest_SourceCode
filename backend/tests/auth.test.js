import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";

describe("Authentication API Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: `test_${Date.now()}@kitchen.com`,
    password: "SecurePassword123"
  };

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email });
    await User.connection.close();
  });

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body.message).toBe("User registered successfully");
  });

  it("should fail to register user with same email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already registered");
  });

  it("should login user and return a JWT token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });

  it("should reject incorrect password on login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email or password");
  });
});
