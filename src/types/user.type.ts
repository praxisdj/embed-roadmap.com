import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  MAX_LIMIT_LENGTH_USERNAME,
  MIN_LIMIT_LENGTH_USERNAME,
} from "@constants";

export type User = Prisma.UserGetPayload<object>;

export const CreateUserSchema = z.object({
  name: z.string(),
  username: z
    .string()
    .min(MIN_LIMIT_LENGTH_USERNAME)
    .max(MAX_LIMIT_LENGTH_USERNAME)
    .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscore")
    .toLowerCase(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const USER_ZOD_DEFINITION = z.object({
  id: z.string(),
  name: z.string(),
  username: z
    .string()
    .min(MIN_LIMIT_LENGTH_USERNAME)
    .max(MAX_LIMIT_LENGTH_USERNAME)
    .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscore")
    .toLowerCase(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SingleUserResponseSchema = USER_ZOD_DEFINITION;
export const UsersResponseSchema = USER_ZOD_DEFINITION.array();