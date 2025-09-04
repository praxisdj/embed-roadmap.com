import { NextRequest, NextResponse } from "next/server";
import { apiHandler, validateSession } from "@/lib/utils/apiHandler";
import { CreateRoadmapSchema } from "@/types/roadmap.type";
import { RoadmapService } from "@/services/roadmap.service";
import { ValidationError } from "@/lib/utils/errors";

export const GET = apiHandler(getHandler);
export const POST = apiHandler(postHandler);
export const DELETE = apiHandler(deleteHandler);

const service = new RoadmapService();

async function getHandler() {
  const session = await validateSession();
  const roadmaps = await service.findRoadmaps(session.user.id);
  return NextResponse.json(roadmaps, { status: 200 });
}

async function postHandler(req: NextRequest) {
  const session = await validateSession();
  const body = await req.json();

  const validatedBody = CreateRoadmapSchema.safeParse(body);

  if (!validatedBody.success) {
    throw new ValidationError(validatedBody.error.issues);
  }

  const roadmap = await service.createRoadmap(session.user.id, validatedBody.data);
  return NextResponse.json(roadmap, { status: 201 });
}

async function deleteHandler(req: NextRequest) {
  const session = await validateSession();
  const { id } = await req.json();
  await service.deleteRoadmap(session.user.id, id);
  return NextResponse.json({ message: "Roadmap deleted" }, { status: 200 });
}
