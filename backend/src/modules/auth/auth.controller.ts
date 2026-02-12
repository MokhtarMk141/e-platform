import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { asyncHandler } from "../../utils/async-handler";

const authService = new AuthService(new UserRepository());

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(result);
  });
}
