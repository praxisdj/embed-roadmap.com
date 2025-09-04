import { Feature, UpdateFeatureSchema } from "@/types/feature.type";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { RoadmapService } from "./roadmap.service";
import { CreateFeatureSchema } from "@/types/feature.type";
import { z } from "zod";
import { AccessService } from "@services/access.service";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger();

export class FeatureService {
  private prisma: typeof prisma;
  private roadmapService: RoadmapService;
  private accessService: AccessService;
  private defaultInclude = {
    roadmap: {
      include: {
        users: true,
      },
    },
    votes: true,
  };

  constructor(
    prismaInstance?: typeof prisma,
    roadmapService?: RoadmapService,
    accessService?: AccessService,
  ) {
    this.prisma = prismaInstance || prisma;
    this.roadmapService = roadmapService || new RoadmapService();
    this.accessService =
      accessService || new AccessService(this.roadmapService, this);
  }

  async createFeature(
    data: z.infer<typeof CreateFeatureSchema>,
    userId: string,
  ): Promise<Feature> {
    await this.accessService.checkAccess(userId, data.roadmapId);
    logger.debug(`Creating feature for user: ${userId}`);

    // Transform Zod schema data to Prisma format
    const prismaData: Prisma.FeatureCreateInput = {
      title: data.title,
      description: data.description,
      status: data.status,
      roadmap: {
        connect: { id: data.roadmapId },
      },
    };

    const feature = await this.prisma.feature.create({
      data: prismaData,
      include: this.defaultInclude,
    });
    return feature;
  }

  async findFeatures(filters?: Prisma.FeatureWhereInput): Promise<Feature[]> {
    return this.prisma.feature.findMany({
      where: filters,
      include: this.defaultInclude,
    });
  }

  async findFeature(
    filters: Prisma.FeatureWhereUniqueInput,
  ): Promise<Feature | null> {
    return this.prisma.feature.findUnique({
      where: filters,
      include: this.defaultInclude,
    });
  }

  async updateFeature(
    id: string,
    data: z.infer<typeof UpdateFeatureSchema>,
    userId: string,
  ): Promise<Feature> {
    await this.accessService.checkAccess(userId, undefined, id);
    logger.debug(`Updating feature with id: ${id}`);

    const updatedFeature = await this.prisma.feature.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });

    return updatedFeature;
  }

  async deleteFeature(id: string, userId: string): Promise<Feature> {
    await this.accessService.checkAccess(userId, undefined, id);
    logger.debug(`Deleting feature with id: ${id}`);

    const feature = await this.prisma.feature.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });

    return feature;
  }
}
