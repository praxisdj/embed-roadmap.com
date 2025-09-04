import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { RoadmapService } from "@/services/roadmap.service";
import { ForbiddenError } from "@/lib/utils/errors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { UpdateRoadmapSchema } from "@/types/roadmap.type";
const service = new RoadmapService();

export const GET = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new ForbiddenError("Unauthorized. Please login to continue.");
    }

    const { id: roadmapId } = await params;
    const featureStatus = req.nextUrl.searchParams.get("featureStatus");

    let roadmap;
    if (featureStatus) {
      roadmap = await service.findRoadmap(session.user.id, {
        id: roadmapId,
        features: { some: { status: featureStatus } },
      });
    } else {
      roadmap = await service.findRoadmap(session.user.id, { id: roadmapId });
    }

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    return NextResponse.json(roadmap, { status: 200 });
  },
);

export const PATCH = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new ForbiddenError("Unauthorized. Please login to continue.");
    }

    const { id: roadmapId } = await params;
    const body = await req.json();

    // Validate the request body
    const validatedBody = UpdateRoadmapSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedBody.error.issues },
        { status: 400 },
      );
    }

    // Check if user has access to this roadmap
    const roadmap = await service.findRoadmap(session.user.id, { id: roadmapId });
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // Check if user is a member of this roadmap
    const isMember = roadmap.users.some((user) => user.id === session.user.id);
    if (!isMember) {
      throw new ForbiddenError(
        "You don't have permission to update this roadmap.",
      );
    }

    // Update the roadmap
    const updatedRoadmap = await service.updateRoadmap(
      session.user.id,
      roadmapId,
      validatedBody.data,
    );

    if (!updatedRoadmap) {
      return NextResponse.json(
        { error: "Failed to update roadmap" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedRoadmap, { status: 200 });
  },
);
