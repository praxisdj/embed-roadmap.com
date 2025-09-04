import { Prisma, Status } from "@prisma/client";
import { z } from "zod";

export type Feature = Prisma.FeatureGetPayload<{
  include: {
    roadmap: {
      include: {
        users: true;
      }
    };
    votes: true;
  };
}>;

export const CreateFeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  roadmapId: z.string(),
  status: z.nativeEnum(Status),
});

export const UpdateFeatureSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(Status),
});

export const FeatureResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  roadmapId: z.string(),
  status: z.nativeEnum(Status),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
  roadmap: z.object({
    id: z.string(),
    name: z.string(),
    isPublic: z.boolean(),
    createdAt: z.string(),
    deletedAt: z.string().nullable().optional(),
  }),
});
