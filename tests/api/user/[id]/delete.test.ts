import { describe, expect, test, beforeEach } from "bun:test";
import { DELETE } from "@/app/api/user/[id]/route";
import { clearDatabase, createUser, createMultipleUsers } from "@tests/utils";
import { User } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("DELETE /api/users", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should delete user by id", async () => {
    await createMultipleUsers(3);
    const user = await createUser({});

    const response = await DELETE(
      new NextRequest(`http://localhost/api/users/${user.id}`, {
        method: "DELETE",
      }),
      { params: { id: user.id } },
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    const parsedUser = responseBody as User;
    expect(parsedUser).toBeInstanceOf(Object);
    expect(parsedUser.id).toBe(user.id);
  });

  test("should return not found", async () => {
    const response = await DELETE(
      new NextRequest(`http://localhost/api/users/99999`, {
        method: "DELETE",
      }),
      { params: { id: `99999` } },
    );

    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody).toEqual({
      error: `User not found with ID: 99999`,
    });
  });
});
