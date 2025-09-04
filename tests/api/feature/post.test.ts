import { describe, expect, test, beforeEach, mock } from "bun:test";
import { POST } from "@/app/api/feature/route";
import { clearDatabase, createRoadmap, createUser } from "@tests/utils";
import { FeatureResponseSchema } from "@/types/feature.type";
import { NextRequest } from "next/server";

describe("POST /api/feature", () => {
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
        new NextRequest(`http://localhost/api/feature`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Test Feature",
            description: "Test Description",
            roadmapId: 0,
            status: "BACKLOG",
          }),
        }),
      );

      expect(response.status).toBe(403);
    });
  });

  describe("Authenticated user", () => {
    test("should create a new feature", async () => {
      const user = await createUser();
      const roadmap = await createRoadmap({
        users: [user.id],
      });

      await mock.module("next-auth", () => ({
        getServerSession: mock(() =>
          Promise.resolve({
            user: {
              id: user.id,
            },
          }),
        ),
      }));

      const body = {
        title: "Test Feature",
        description: "Test Description",
        roadmapId: roadmap.id,
        status: "BACKLOG",
      };

      const response = await POST(
        new NextRequest(`http://localhost/api/feature`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      );

      const responseBody = await response.json();

      // assert
      expect(response.status).toBe(201);
      const parsedFeature = FeatureResponseSchema.parse(responseBody);
      expect(parsedFeature).toMatchObject({
        title: body.title,
        description: body.description,
        roadmapId: body.roadmapId,
        status: body.status,
      });
    });

    test("should return 403 if user is not authorized to create a feature", async () => {
      const userWithAccess = await createUser();
      const userWithoutAccess = await createUser();

      const roadmap = await createRoadmap({
        users: [userWithAccess.id],
      });

      await mock.module("next-auth", () => ({
        getServerSession: mock(() =>
          Promise.resolve({
            user: {
              id: userWithoutAccess.id,
            },
          }),
        ),
      }));

      const body = {
        title: "Test Feature",
        description: "Test Description",
        roadmapId: roadmap.id,
        status: "BACKLOG",
      };

      const response = await POST(
        new NextRequest(`http://localhost/api/feature`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      );

      expect(response.status).toBe(401);
    });
  });
});
