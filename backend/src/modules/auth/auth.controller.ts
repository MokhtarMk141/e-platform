import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { AuthRequest } from "./auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../exceptions/app-error";
import { sendSuccess } from "../../utils/api-response";
import { getAuthenticatedUserId } from "../../utils/auth-utils";
import { RegisterDtoType } from "./dto/register.dto";
import { LoginDtoType } from "./dto/login.dto";
import { ForgotPasswordDtoType } from "./dto/forgot-password.dto";
import { ResetPasswordDtoType } from "./dto/reset-password.dto";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new UserRepository());
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true, // not accessible by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth", // only send cookie to auth endpoints
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as RegisterDtoType;
    const { user, accessToken, refreshToken } =
      await this.authService.register(payload);

    this.setRefreshCookie(res, refreshToken);

    return sendSuccess(res, {
      statusCode: 201,
      message: "User registered successfully",
      data: { user, accessToken },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as LoginDtoType;
    const { user, accessToken, refreshToken } =
      await this.authService.login(payload);

    this.setRefreshCookie(res, refreshToken);

    return sendSuccess(res, {
      message: "Login successful",
      data: { user, accessToken },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      throw new AppError("No refresh token provided", 401);
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshAccessToken(token);

    // Set the new refresh token cookie (rotation)
    this.setRefreshCookie(res, refreshToken);

    return sendSuccess(res, {
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return sendSuccess(res, {
      message: "Logged out successfully",
      data: null,
    });
  });

  logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = getAuthenticatedUserId(req);

    await this.authService.logoutAll(userId);
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return sendSuccess(res, {
      message: "Logged out from all devices",
      data: null,
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as ForgotPasswordDtoType;
    await this.authService.forgotPassword(payload.email);
    return sendSuccess(res, {
      message: "If an account exists with that email, a password reset link has been sent.",
      data: null,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body as ResetPasswordDtoType;
    await this.authService.resetPassword(token, password);
    return sendSuccess(res, {
      message: "Password has been reset successfully. Please login with your new password.",
      data: null,
    });
  });
}
