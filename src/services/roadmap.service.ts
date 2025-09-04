import { Roadmap } from "@/types/roadmap.type";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { CreateRoadmapSchema, UpdateRoadmapSchema, EmbedStyles } from "@/types/roadmap.type";
import { z } from "zod";

export class RoadmapService {
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

  constructor(prismaInstance?: typeof prisma) {
    this.prisma = prismaInstance || prisma;
  }

  async createRoadmap(
    data: z.infer<typeof CreateRoadmapSchema>
  ): Promise<Roadmap> {
    // First, verify that all user IDs exist
    const existingUsers = await this.prisma.user.findMany({
      where: {
        id: { in: data.users },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingUsers.length === 0) {
      throw new Error("No valid users found for roadmap creation");
    }

    // Transform the validated data to match Prisma's expected format
    const roadmapData = {
      name: data.name,
      isPublic: data.isPublic ?? false,
      users: {
        connect: existingUsers.map((user) => ({ id: user.id })),
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

  async findRoadmaps(filters?: Prisma.RoadmapWhereInput): Promise<Roadmap[]> {
    return this.prisma.roadmap.findMany({
      where: { ...filters, deletedAt: null },
      include: this.defaultInclude,
    });
  }

  async findRoadmap(where: Prisma.RoadmapWhereUniqueInput): Promise<Roadmap | null> {
    return this.prisma.roadmap.findUnique({
      where: { ...where, deletedAt: null },
      include: this.defaultInclude,
    });
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
    id: string,
    data: z.infer<typeof UpdateRoadmapSchema>
  ): Promise<Roadmap | null> {
    return this.prisma.roadmap.update({
      where: { id, deletedAt: null },
      data,
      include: this.defaultInclude,
    });
  }
}
