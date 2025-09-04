import { apiHandler } from "@/lib/utils/apiHandler";
import { UpdateUserSchema } from "@/types/user.type";
import { UserService } from "@/services/user.service";
import { BadRequestError, NotFoundError } from "@/lib/utils/errors";
import { NextRequest, NextResponse } from "next/server";

const userService = new UserService();

export const GET = apiHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    if (!id) {
      throw new BadRequestError("Invalid user ID");
    }

    const user = await userService.findUser({ id });
    if (!user) {
      throw new NotFoundError(`User not found with ID: ${id}`);
    }
    return NextResponse.json(user, { status: 200 });
  },
);

export const PATCH = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedBody = UpdateUserSchema.safeParse(body);

  if (!validatedBody.success) {
    throw new BadRequestError(validatedBody.error.message);
  }
  const { id, ...updateData } = validatedBody.data;
  const updatedUser = await userService.update(id, updateData);
  return NextResponse.json(updatedUser, { status: 200 });
});

export const DELETE = apiHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    if (!id) {
      throw new BadRequestError("Invalid user ID");
    }

    const deletedUser = await userService.delete(id);
    return NextResponse.json(deletedUser, { status: 200 });
  },
);
