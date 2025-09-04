import { Roadmap } from "@/types/roadmap.type";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CreateRoadmapSchema,
  UpdateRoadmapSchema,
  EmbedStyles,
} from "@/types/roadmap.type";
import { z } from "zod";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/utils/errors";
import { UserService } from "@services/user.service";

export class RoadmapService {
  private userService: UserService;
  private prisma: typeof prisma;
  private defaultInclude = {
    users: {
      where: {
        deletedAt: null,
      },
    },
    features: {
      include: {
        votes: true,
      },
      where: {
        deletedAt: null,
      },
    },
  };

  constructor(prismaInstance?: typeof prisma, userService?: UserService) {
    this.userService = userService || new UserService();
    this.prisma = prismaInstance || prisma;
  }

  async createRoadmap(
    userId: string,
    data: z.infer<typeof CreateRoadmapSchema>,
  ): Promise<Roadmap> {
    // First, verify that this user exists
    const existingUser = await this.userService.findUser({ id: userId });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    // Transform the validated data to match Prisma's expected format
    const roadmapData = {
      name: data.name,
      isPublic: data.isPublic ?? false,
      users: {
        connect: [{ id: existingUser.id }],
      },
    };

    const roadmap = await this.prisma.roadmap.create({
      data: roadmapData,
      include: {
        users: true,
        features: {
          include: {
            votes: true,
          },
        },
      },
    });
    return roadmap;
  }

  async findRoadmaps(userId: string, filters?: Prisma.RoadmapWhereInput): Promise<Roadmap[]> {
    return this.prisma.roadmap.findMany({
      where: { ...filters, deletedAt: null, users: { some: { id: userId } } },
      include: this.defaultInclude,
    });
  }

  async findRoadmap(
    userId: string,
    where: Prisma.RoadmapWhereUniqueInput,
  ): Promise<Roadmap | null> {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { ...where, deletedAt: null },
      include: this.defaultInclude,
    });

    if (roadmap && !roadmap.users.some((user) => user.id === userId)) {
      throw new UnauthorizedError("You are not authorized to access this roadmap.", false, { roadmapId: where.id, userId });
    }

    return roadmap;
  }

  async getEmbedData(id: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    features: Array<{
      id: string;
      title: string;
      description: string | null;
      status: string;
      createdAt: Date;
      voteCount: number;
    }>;
    embedStyles: EmbedStyles;
  } | null> {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id, deletedAt: null },
      include: {
        features: {
          where: { deletedAt: null },
          include: {
            votes: true,
          },
        },
      },
    });

    if (!roadmap || !roadmap.isPublic) {
      return null;
    }

    // Type assertion for the new embed fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roadmapWithEmbed = roadmap as any;

    return {
      id: roadmap.id,
      name: roadmap.name,
      createdAt: roadmap.createdAt,
      features: roadmap.features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        status: feature.status,
        createdAt: feature.createdAt,
        voteCount: feature.votes.length,
      })),
      embedStyles: (roadmapWithEmbed.embedStyles as EmbedStyles) || {},
    };
  }

  async updateRoadmap(
    userId: string,
    id: string,
    data: z.infer<typeof UpdateRoadmapSchema>,
  ): Promise<Roadmap | null> {
    const roadmap = await this.findRoadmap(userId, { id });
    if (!roadmap) {
      throw new NotFoundError("Roadmap not found");
    }

    if (roadmap.users.some((user) => user.id !== userId)) {
      throw new ForbiddenError("You don't have permission to update this roadmap.");
    }

    return this.prisma.roadmap.update({
      where: { id, deletedAt: null },
      data,
      include: this.defaultInclude,
    });
  }

  async deleteRoadmap(userId: string, id: string): Promise<void> {
    const roadmap = await this.findRoadmap(userId, { id });
    if (!roadmap) {
      throw new NotFoundError("Roadmap not found");
    }

    if (roadmap.users.some((user) => user.id !== userId)) {
      throw new ForbiddenError("You don't have permission to delete this roadmap.");
    }

    await this.prisma.roadmap.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
