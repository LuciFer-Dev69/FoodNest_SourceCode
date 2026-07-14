import request from "supertest";
import server from "../server.js";
import { db } from "../config/db.js";

describe("Authentication API Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: `test_${Date.now()}@kitchen.com`,
    password: "SecurePassword123"
  };

  afterAll(async () => {
    // Clean up test user from DB
    await db.execute("DELETE FROM users WHERE email = ?", [testUser.email]);
    if (typeof db.end === "function") {
      await db.end();
    }
    server.close();
  });

  it("should register a new user successfully", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body.message).toBe("User registered successfully");
  });

  it("should fail to register user with same email", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already registered");
  });

  it("should login user and return a JWT token", async () => {
    const res = await request(server)
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
    const res = await request(server)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email or password");
  });
});
