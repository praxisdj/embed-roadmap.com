import { describe, expect, test, beforeEach } from "bun:test";
import { POST } from "@/app/api/user/route";
import { clearDatabase } from "@tests/utils";
import { SingleUserResponseSchema } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("POST /api/users", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should create one user", async () => {
    const userToBeCreated = {
      name: "test user",
      email: "test@example.com",
      username: "testuser",
      phone: "1234567890",
      avatarUrl: "https://example.com/avatarUrl.jpg",
    };

    const response = await POST(
      new NextRequest(`http://localhost/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToBeCreated),
      }),
    );

    const responseBody = await response.json();
    expect(response.status).toBe(201);
    const parsedUser = SingleUserResponseSchema.parse(responseBody);
    expect(parsedUser).toMatchObject({
      name: userToBeCreated.name,
      email: userToBeCreated.email,
      phone: userToBeCreated.phone,
      avatarUrl: userToBeCreated.avatarUrl,
    });
  });

  test("should get zod validation error", async () => {
    const userToBeCreated = {
      name: "test user",
      phone: "1234567890",
      avatarUrl: "https://example.com/avatarUrl.jpg",
    };

    const response = await POST(
      new NextRequest(`http://localhost/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToBeCreated),
      }),
    );

    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody).toMatchObject({
      error: [
        {
          message: "Invalid input: expected string, received undefined",
          path: ["username"],
          code: "invalid_type",
          expected: "string",
        },
        {
          message: "Invalid input: expected string, received undefined",
          path: ["email"],
          code: "invalid_type",
          expected: "string",
        },
      ],
    });
  });
});
