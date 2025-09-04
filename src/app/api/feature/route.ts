import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { CreateFeatureSchema, UpdateFeatureSchema } from "@/types/feature.type";
import { FeatureService } from "@/services/feature.service";
import { ForbiddenError, ValidationError } from "@/lib/utils/errors";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const service = new FeatureService();

export const POST = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new ForbiddenError("Unauthorized. Please login to continue.");
  }

  const body = await req.json();
  const validatedBody = CreateFeatureSchema.safeParse(body);

  if (!validatedBody.success) {
    throw new ValidationError(validatedBody.error.issues);
  }

  const feature = await service.createFeature(validatedBody.data, session.user.id);
  return NextResponse.json(feature, { status: 201 });
});
