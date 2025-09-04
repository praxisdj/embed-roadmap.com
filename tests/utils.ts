import prisma from "@lib/prisma";
import { UserService } from "@services/user.service";
import { faker } from "@faker-js/faker";
import { User, CreateUserSchema } from "@/types/user.type";
import { z } from "zod";
import { CreateRoadmapSchema, Roadmap } from "@/types/roadmap.type";
import { RoadmapService } from "@services/roadmap.service";
import { MAX_LIMIT_LENGTH_USERNAME } from "@/lib/utils/constants";

export async function clearDatabase() {
  try {
    if (!prisma.$queryRaw) {
      throw new Error(
        `⚠️ Prisma client not available. This is probably caused by mocks.`,
      );
    }

    const tableNames =
      (await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`) as {
        tablename: string;
      }[];

    const clearedTables = [];
    for (const { tablename } of tableNames) {
      if (tablename === "_prisma_migrations") continue;
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      clearedTables.push(tablename);
    }
  } catch (error) {
    console.error(`⚠️🚨 Error clearing database`);
    throw error;
  }
}

export async function createUser(
  userData: Partial<z.infer<typeof CreateUserSchema>> = {},
): Promise<User> {
  const userService = new UserService();

  const validatedData = CreateUserSchema.parse({
    name: userData.name || faker.person.fullName(),
    username:
      userData.username ||
      faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .slice(0, MAX_LIMIT_LENGTH_USERNAME),
    email: userData.email || faker.internet.email(),
    phone: userData.phone || faker.phone.number(),
    avatarUrl: userData.avatarUrl || faker.image.avatar(),
    ...userData,
  });

  return await userService.createUser(validatedData);
}

export async function createMultipleUsers(
  count: number,
  userData: Partial<z.infer<typeof CreateUserSchema>> = {},
): Promise<User[]> {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const user = await createUser(userData);
    users.push(user);
  }
  return users;
}

export async function createRoadmap(
  roadmapData: Partial<z.infer<typeof CreateRoadmapSchema>> = {},
): Promise<Roadmap> {
  const roadmapService = new RoadmapService();

  let user: User | null = null;
  if (!roadmapData.users || roadmapData.users.length === 0) {
    user = await createUser();
    roadmapData.users = [user.id];
  } else {
    const userService = new UserService();
    const userId = roadmapData.users[0];
    user = await userService.findUser({ id: userId });
    if (!user) {
      throw new Error(`[TEST ERROR] User with id ${userId} not found`);
    }
  }

  const validatedData = CreateRoadmapSchema.parse({
    name: roadmapData.name || faker.person.fullName(),
    isPublic: roadmapData.isPublic || faker.datatype.boolean(),
    users: roadmapData.users || [user.id],
  });

  return await roadmapService.createRoadmap(user.id, validatedData);
}

export async function createMultipleRoadmaps(
  count: number,
  roadmapData: Partial<z.infer<typeof CreateRoadmapSchema>> = {},
): Promise<Roadmap[]> {
  const roadmaps: Roadmap[] = [];
  for (let i = 0; i < count; i++) {
    const roadmap = await createRoadmap(roadmapData);
    roadmaps.push(roadmap);
  }
  return roadmaps;
}
export function isValidISODate(dateString: string): boolean {
  if (!dateString) return false;

  const isoRegex: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  if (!isoRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const dateTime = date.getTime();
  const isDateTimeNAN = isNaN(dateTime);

  if (isDateTimeNAN) {
    return false;
  }

  return true;
}
