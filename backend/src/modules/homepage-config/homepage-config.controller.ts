import { Request, Response, NextFunction } from "express";
import { HomepageConfigService } from "./homepage-config.service";

export class HomepageConfigController {
  static async getConfig(_req: Request, res: Response, next: NextFunction) {
    try {
      const config = await HomepageConfigService.getConfig();
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  static async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { heroSlides, features, flashTitle, sections, aiCta } = req.body;
      const config = await HomepageConfigService.updateConfig({
        heroSlides,
        features,
        flashTitle,
        sections,
        aiCta,
      });
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }
}
