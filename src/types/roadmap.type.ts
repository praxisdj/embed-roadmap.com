import { Prisma } from "@prisma/client";
import { z } from "zod";
import { FeatureResponseSchema } from "./feature.type";
import { SingleUserResponseSchema } from "./user.type";

export type Roadmap = Prisma.RoadmapGetPayload<{
  include: {
    users: true,
    features: {
      include: {
        votes: true,
      }
    },
  },
}>;

// Embed styling configuration types
export interface EmbedStyles {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  statusColors?: {
    BACKLOG?: string
    NEXT_UP?: string
    IN_PROGRESS?: string
    DONE?: string
  }
}



// Use Prisma's generated type as the single source of truth
export type CreateRoadmapInput = Prisma.RoadmapCreateInput;

// Create a validation schema that matches Prisma's structure
export const CreateRoadmapSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().optional(),
  users: z.array(z.string()),
});

export const UpdateRoadmapSchema = z.object({
  name: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  embedStyles: z.object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    borderColor: z.string().optional(),
    statusColors: z.object({
      BACKLOG: z.string().optional(),
      NEXT_UP: z.string().optional(),
      IN_PROGRESS: z.string().optional(),
      DONE: z.string().optional(),
    }).optional(),
  }).optional(),
});

const ROADMAP_ZOD_DEFINITION = z.object({
  id: z.string(),
  name: z.string(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
  features: z.array(FeatureResponseSchema),
  users: z.array(SingleUserResponseSchema),
});

export const RoadmapsResponseSchema = ROADMAP_ZOD_DEFINITION.array();
export const SingleRoadmapResponseSchema = ROADMAP_ZOD_DEFINITION;
