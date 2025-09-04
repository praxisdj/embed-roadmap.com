import { FeatureService } from "@services/feature.service";
import { RoadmapService } from "@services/roadmap.service";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

export class AccessService {
  private roadmapService: RoadmapService;
  private featureService: FeatureService;

  constructor(roadmapService: RoadmapService, featureService: FeatureService) {
    this.roadmapService = roadmapService;
    this.featureService = featureService;
  }

  async checkAccess(
    userId: string,
    roadmapId?: string,
    featureId?: string
  ): Promise<void> {
    let usersWithAccess: string[] = [];
    if (roadmapId) {
      const roadmap = await this.roadmapService.findRoadmap({ id: roadmapId });
      if (!roadmap) {
        throw new NotFoundError("Roadmap not found.");
      }
      usersWithAccess = roadmap.users.map((user) => user.id);
    }

    if (featureId) {
      const feature = await this.featureService.findFeature({ id: featureId });
      if (!feature) {
        throw new NotFoundError("Feature not found.");
      }
      usersWithAccess = feature.roadmap.users.map((user) => user.id);
    }

    if (!usersWithAccess.includes(userId)) {
      throw new UnauthorizedError(
        "You are not authorized to access this resource."
      );
    }
  }
}
