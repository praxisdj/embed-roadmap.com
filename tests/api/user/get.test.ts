import { describe, expect, test, beforeEach } from "bun:test";
import { GET } from "@/app/api/user/route";
import { clearDatabase, createMultipleUsers } from "@tests/utils";
import { UsersResponseSchema } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("GET /api/users", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should return all users", async () => {
    await createMultipleUsers(3);

    const response = await GET(
      new NextRequest(`http://localhost/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    const parsedUsers = UsersResponseSchema.parse(responseBody);
    expect(parsedUsers).toBeInstanceOf(Array);
    expect(parsedUsers.length).toBe(3);
  });

  test("should return an empty array when no users exist", async () => {
    const response = await GET(
      new NextRequest(`http://localhost/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toBeInstanceOf(Array);
    expect(responseBody.length).toBe(0);
  });
});
