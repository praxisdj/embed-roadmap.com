import { Prisma } from "@prisma/client";
import { z } from "zod";

export type Vote = Prisma.VoteGetPayload<object>;

export const CreateVoteSchema = z.object({
  featureId: z.string(),
  sessionId: z.string(),
});

export const VoteResponseSchema = z.object({
  id: z.string(),
  featureId: z.string(),
  sessionId: z.string(),
  createdAt: z.string(),
});
