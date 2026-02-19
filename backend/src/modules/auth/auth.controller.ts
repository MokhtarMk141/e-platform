import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { AuthRequest } from "./auth.middleware";
import { asyncHandler } from "../../utils/async-handler";

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
    const { user, accessToken, refreshToken } =
      await this.authService.register(req.body);

    this.setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user, accessToken },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } =
      await this.authService.login(req.body);

    this.setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: "Login successful",
      data: { user, accessToken },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No refresh token provided",
      });
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshAccessToken(token);

    // Set the new refresh token cookie (rotation)
    this.setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ success: true, message: "Logged out successfully" });
  });

  logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    await this.authService.logoutAll(userId);
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ success: true, message: "Logged out from all devices" });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await this.authService.resetPassword(token, password);
    res.json({
      success: true,
      message: "Password has been reset successfully. Please login with your new password.",
    });
  });
}