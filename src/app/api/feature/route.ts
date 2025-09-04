import { NextRequest, NextResponse } from "next/server";
import { apiHandler, validateSession } from "@/lib/utils/apiHandler";
import { CreateFeatureSchema } from "@/types/feature.type";
import { FeatureService } from "@/services/feature.service";
import { ValidationError } from "@/lib/utils/errors";

export const POST = apiHandler(postHandler);

const service = new FeatureService();

async function postHandler(req: NextRequest) {
  const session = await validateSession();
  const body = await req.json();
  const validatedBody = CreateFeatureSchema.safeParse(body);

  if (!validatedBody.success) {
    throw new ValidationError(validatedBody.error.issues);
  }

  const feature = await service.createFeature(
    session.user.id,
    validatedBody.data,
  );

  return NextResponse.json(feature, { status: 201 });
}
