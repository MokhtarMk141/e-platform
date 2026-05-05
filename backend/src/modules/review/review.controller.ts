import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { asyncHandler } from "../../utils/async-handler";
import { createReviewSchema } from "./dto/create-review.dto";
import { updateReviewSchema } from "./dto/update-review.dto";
import { sendSuccess } from "../../utils/api-response";
import { AuthRequest } from "../auth/auth.middleware";

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const result = await this.reviewService.getReviewsForProduct(productId);

    return sendSuccess(res, {
      message: "Reviews fetched successfully",
      data: result,
    });
  });

  createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = req.params.productId as string;
    const userId = req.user!.sub;
    const dto = createReviewSchema.parse(req.body);

    const review = await this.reviewService.createReview(userId, productId, dto);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Review created successfully",
      data: review,
    });
  });

  updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviewId = req.params.id as string;
    const userId = req.user!.sub;
    const dto = updateReviewSchema.parse(req.body);

    const review = await this.reviewService.updateReview(reviewId, userId, dto);

    return sendSuccess(res, {
      message: "Review updated successfully",
      data: review,
    });
  });

  deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviewId = req.params.id as string;
    const userId = req.user!.sub;
    const userRole = req.user!.role;

    await this.reviewService.deleteReview(reviewId, userId, userRole);

    return sendSuccess(res, {
      message: "Review deleted successfully",
      data: null,
    });
  });

  getTopRated = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 8;
    const products = await this.reviewService.getTopRatedProducts(limit);

    return sendSuccess(res, {
      message: "Top rated products fetched successfully",
      data: products,
    });
  });
}
