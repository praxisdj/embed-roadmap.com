import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { CreateUserSchema } from "@/types/user.type";
import { UserService } from "@/services/user.service";
import { ValidationError } from "@/lib/utils/errors";

const userService = new UserService();

export const GET = apiHandler(async () => {
  const users = await userService.findUsers();
  return NextResponse.json(users, { status: 200 });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedBody = CreateUserSchema.safeParse(body);

  if (!validatedBody.success) {
    throw new ValidationError(validatedBody.error.issues);
  }

  const user = await userService.createUser(validatedBody.data);
  return NextResponse.json(user, { status: 201 });
});
