import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { asyncHandler } from "../../utils/async-handler";
import { AuthRequest } from "../auth/auth.middleware";
import { AppError } from "../../exceptions/app-error";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.getUsers();
    res.json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  });

  findOne = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      throw new AppError("User ID is required", 400);
    }

    const user = await this.userService.getUser(id);
    res.json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.sub;
    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const user = await this.userService.getUser(userId);
    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  });
}
