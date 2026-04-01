import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { AnalyticsService } from "./analytics.service";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getOverview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await this.analyticsService.getOverview();

    return sendSuccess(res, {
      message: "Analytics overview fetched successfully",
      data,
    });
  });
}
