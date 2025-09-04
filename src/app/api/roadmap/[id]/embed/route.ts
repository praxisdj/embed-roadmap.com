import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { RoadmapService } from "@/services/roadmap.service";

const service = new RoadmapService();

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id: roadmapId } = await params;

  const embedData = await service.getEmbedData(roadmapId);

  if (!embedData) {
    return NextResponse.json({ error: "Roadmap not found or not public" }, { status: 404 });
  }

  // Set CORS headers for cross-origin embedding
  const response = NextResponse.json(embedData, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
});

// Handle preflight CORS request
export const OPTIONS = async () => {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};
