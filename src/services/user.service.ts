import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { User } from "@/types/user.type";
import { createLogger } from "@/lib/utils/logger";
import { NotFoundError } from "@/lib/utils/errors";

const logger = createLogger();

export class UserService {
  private prisma: typeof prisma;

  constructor(prismaInstance?: typeof prisma) {
    this.prisma = prismaInstance || prisma;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    logger.debug(`Creating new user with email: ${data.email}`);
    const newUser = await this.prisma.user.create({
      data,
    });
    return newUser;
  }

  async findUsers(filters?: Prisma.UserWhereInput): Promise<User[]> {
    logger.debug(`Fetching users with filters: ${JSON.stringify(filters)}`);
    const users = await this.prisma.user.findMany({
      where: filters,
    });
    return users.length > 0 ? users : [];
  }

  async findUser(filters?: Prisma.UserWhereInput): Promise<User | null> {
    logger.debug(`Fetching user with filters: ${JSON.stringify(filters)}`);
    const user = await this.prisma.user.findFirst({
      where: filters,
    });
    return user || null;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      logger.debug(`Updating user with ID: ${id}`, { data });

      const result = await this.prisma.user.update({
        where: { id },
        data,
      });
      return result;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`User not found with ID: ${id}`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<User> {
    try {
      const result = await this.prisma.user.delete({
        where: { id },
      });
      return result;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`User not found with ID: ${id}`);
      }
      throw error;
    }
  }
}
