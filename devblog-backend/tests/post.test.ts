import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import Post from "../src/models/Post";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Post Integration Structures", () => {
  let authHeader: string;
  let adminHeader: string;
  let postId: string;

  beforeEach(async () => {
    // Generate Standard User
    const userRes = await request(app).post("/api/v1/auth/register").send({
      name: "Author",
      email: "author@devblog.com",
      password: "password123!",
    });
    authHeader = `Bearer ${userRes.body.data.accessToken}`;

    // Generate Administrator
    const adminRes = await request(app).post("/api/v1/auth/register").send({
      name: "Super Admin",
      email: "admin@devblog.com",
      password: "password123!",
    });

    // Elevate admin directly in memory DB
    await User.findOneAndUpdate(
      { email: "admin@devblog.com" },
      { role: "ADMIN" },
    );

    // Re-login to generate elevated token
    const elevatedLogin = await request(app).post("/api/v1/auth/login").send({
      email: "admin@devblog.com",
      password: "password123!",
    });
    adminHeader = `Bearer ${elevatedLogin.body.data.accessToken}`;
  });

  it("should securely allow authenticated users to map posts", async () => {
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", authHeader)
      .send({
        title: "Integration Testing Post",
        content:
          "This is deeply nested content bypassing Zod min-length triggers.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Integration Testing Post");

    postId = res.body.data._id;
  });

  it("should fail gracefully when anonymous requests hit protected routes", async () => {
    const res = await request(app).post("/api/v1/posts").send({
      title: "Anonymous Post",
      content: "This should natively bounce 401.",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Unauthorized/);
  });
});
