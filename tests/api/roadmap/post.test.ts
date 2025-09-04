import { describe, expect, test, beforeEach, mock } from "bun:test";
import { POST } from "@/app/api/roadmap/route";
import { clearDatabase, createUser } from "@tests/utils";
import { SingleRoadmapResponseSchema } from "@/types/roadmap.type";
import { NextRequest } from "next/server";

describe("POST /api/roadmap", () => {
  beforeEach(async () => {
    await clearDatabase();
    mock.restore();
  });

  describe("Anonymous user", () => {
    test("should return 401 if not authenticated", async () => {
      await mock.module("next-auth", () => ({
        getServerSession: mock(() => Promise.resolve({ user: null })),
      }));

      const response = await POST(
        new NextRequest(`http://localhost/api/roadmap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test Roadmap",
            isPublic: false,
            users: [0],
          }),
        })
      );

      expect(response.status).toBe(403);
    });
  });

  describe("Authenticated user", () => {
    test("should create a new roadmap", async () => {
      const user = await createUser();

      await mock.module("next-auth", () => ({
        getServerSession: mock(() =>
          Promise.resolve({
            user: {
              id: user.id,
            },
          })
        ),
      }));

      const body = {
        name: "Test Roadmap",
        isPublic: false,
        users: [user.id],
      };

      const response = await POST(
        new NextRequest(`http://localhost/api/roadmap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
      );

      const responseBody = await response.json();

      // assert
      expect(response.status).toBe(201);
      const parsedRoadmap = SingleRoadmapResponseSchema.parse(responseBody);
      expect(parsedRoadmap).toMatchObject({
        name: body.name,
        isPublic: body.isPublic,
        users: expect.arrayContaining([
          expect.objectContaining({
            id: user.id
          })
        ])
      });
    });
  });
});
