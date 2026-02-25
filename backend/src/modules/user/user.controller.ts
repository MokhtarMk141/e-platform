import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { asyncHandler } from "../../utils/async-handler";
import { AuthRequest } from "../auth/auth.middleware";
import { AppError } from "../../exceptions/app-error";
import { sendSuccess } from "../../utils/api-response";
import { getAuthenticatedUserId } from "../../utils/auth-utils";
import { CreateUserDto, CreateUserDtoType } from "./dto/create-user.dto";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as CreateUserDtoType;
    const user = await this.userService.createUser(payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: "User created successfully",
      data: user,
    });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.getUsers();

    return sendSuccess(res, {
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

    return sendSuccess(res, {
      message: "User fetched successfully",
      data: user,
    });
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    const user = await this.userService.getUser(userId);

    return sendSuccess(res, {
      message: "Profile fetched successfully",
      data: user,
    });
  });

  updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const payload = req.body;

    const user = await this.userService.updateUser(userId, payload);

    return sendSuccess(res, {
      message: "Profile updated successfully",
      data: user,
    });
  });
}
