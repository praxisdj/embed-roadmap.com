import { describe, expect, test, beforeEach, mock } from "bun:test";
import { GET } from "@/app/api/roadmap/route";
import {
  clearDatabase,
  createMultipleRoadmaps,
  createUser,
} from "@tests/utils";
import { RoadmapsResponseSchema } from "@/types/roadmap.type";
import { NextRequest } from "next/server";

describe("GET /api/roadmap", () => {
  beforeEach(async () => {
    await clearDatabase();
    mock.restore();
  });

  describe("Anonymous user", () => {
    test("should return 401 if not authenticated", async () => {
      await mock.module("next-auth", () => ({
        getServerSession: mock(() => Promise.resolve({ user: null })),
      }));

      const response = await GET(
        new NextRequest(`http://localhost/api/roadmap`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      expect(response.status).toBe(403);
    });
  });

  describe("Authenticated user", () => {
    test("should return all roadmaps user has access to", async () => {
      const user1 = await createUser();
      await createMultipleRoadmaps(3, {
        users: [user1.id],
      });

      const user2 = await createUser();
      await createMultipleRoadmaps(7, {
        users: [user2.id],
      });

      // fetch roadmaps for user1
      await mock.module("next-auth", () => ({
        getServerSession: mock(() =>
          Promise.resolve({
            user: {
              id: user1.id,
            },
          }),
        ),
      }));

      const response1 = await GET(
        new NextRequest(`http://localhost/api/roadmap`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      const responseBody1 = await response1.json();

      // fetch roadmaps for user2
      await mock.module("next-auth", () => ({
        getServerSession: mock(() =>
          Promise.resolve({
            user: {
              id: user2.id,
            },
          }),
        ),
      }));

      const response2 = await GET(
        new NextRequest(`http://localhost/api/roadmap`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      const responseBody2 = await response2.json();

      // assert
      expect(response1.status).toBe(200);
      const parsedRoadmaps1 = RoadmapsResponseSchema.parse(responseBody1);
      expect(parsedRoadmaps1).toBeInstanceOf(Array);
      expect(parsedRoadmaps1.length).toBe(3);

      expect(response2.status).toBe(200);
      const parsedRoadmaps2 = RoadmapsResponseSchema.parse(responseBody2);
      expect(parsedRoadmaps2).toBeInstanceOf(Array);
      expect(parsedRoadmaps2.length).toBe(7);

      expect(parsedRoadmaps1).not.toEqual(parsedRoadmaps2);
      expect(parsedRoadmaps1.length + parsedRoadmaps2.length).toBe(10);
    });
  });
});
