import { describe, expect, test, beforeEach } from "bun:test";
import { PATCH } from "@/app/api/user/[id]/route";
import { clearDatabase, createUser, createMultipleUsers } from "@tests/utils";
import { User } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("PATCH /api/users", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should update user by id", async () => {
    await createMultipleUsers(3);
    const user = await createUser({
      name: "test user before update",
    });

    const response = await PATCH(
      new NextRequest(`http://localhost/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          id: user.id,
          name: "test user after update",
        }),
      }),
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    const parsedUser = responseBody as User;
    expect(parsedUser).toBeInstanceOf(Object);
    expect(parsedUser.id).toBe(user.id);
    expect(parsedUser.name).toBe("test user after update");
  });

  test("should return not found", async () => {
    const response = await PATCH(
      new NextRequest(`http://localhost/api/users/99999`, {
        method: "PATCH",
        body: JSON.stringify({
          id: "99999",
        }),
      }),
    );

    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody).toEqual({
      error: `User not found with ID: 99999`,
    });
  });
});
