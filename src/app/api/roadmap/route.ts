import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { CreateRoadmapSchema } from "@/types/roadmap.type";
import { RoadmapService } from "@/services/roadmap.service";
import { ForbiddenError, ValidationError } from "@/lib/utils/errors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const service = new RoadmapService();

export const GET = apiHandler(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new ForbiddenError("Unauthorized. Please login to continue.");
    }

  const roadmaps = await service.findRoadmaps({
    users: {
      some: {
        id: session.user.id
      }
    }
  });
  return NextResponse.json(roadmaps, { status: 200 });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new ForbiddenError("Unauthorized. Please login to continue.");
  }

  const body = await req.json();

  // Ensure the current user is included in the users array
  const bodyWithUser = {
    ...body,
    users: body.users ? [...new Set([...body.users, session.user.id])] : [session.user.id]
  };

  const validatedBody = CreateRoadmapSchema.safeParse(bodyWithUser);

  if (!validatedBody.success) {
    throw new ValidationError(validatedBody.error.issues);
  }

  const roadmap = await service.createRoadmap(validatedBody.data);
  return NextResponse.json(roadmap, { status: 201 });
});

