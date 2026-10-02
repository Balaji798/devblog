import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import { describe, it, expect } from "@jest/globals";

describe("Authentication Integration Tests", () => {
  it("should securely register a new user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "testuser@devblog.com",
      password: "securepassword123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("testuser@devblog.com");
    expect(res.body.data.user.role).toBe("USER");
    expect(res.body.data.accessToken).toBeDefined();

    // Verify raw persistence mathematically
    const dbUser = await User.findOne({ email: "testuser@devblog.com" });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.isActive).toBe(true);
  });

  it("should enforce validation payloads structurally", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "A", // Inherently fails minimum 2-char check
      email: "invalid-email",
      password: "short", // Inherently fails min 6 constraint
    });

    expect(res.status).toBe(400); // Bad Request (Zod validation failure)
    expect(res.body.success).toBe(false);
  });

  it("should securely log in standard users returning sealed tokens", async () => {
    // Generate isolated user explicitly for login testing
    await request(app).post("/api/v1/auth/register").send({
      name: "Login User",
      email: "login@devblog.com",
      password: "password123!",
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "login@devblog.com",
      password: "password123!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe("login@devblog.com");
    expect(loginRes.body.data.accessToken).toBeDefined();

    // Cookie mapping check for JWT refresh
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    expect(
      cookieArray.some((cookie: string) => cookie.includes("jwt_refresh")),
    ).toBeTruthy();
  });
});
