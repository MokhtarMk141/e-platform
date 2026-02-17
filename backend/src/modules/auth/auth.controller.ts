import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { AuthRequest } from "./auth.middleware";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new UserRepository());
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
    this.logoutAll = this.logoutAll.bind(this);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true, // not accessible by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  async register(req: Request, res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(req.body);

    this.setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  }

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(req.body);

    this.setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: { user, accessToken },
    });
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshAccessToken(token);

    // Set the new refresh token cookie (rotation)
    this.setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: { accessToken },
    });
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
  }

  // Logout from ALL devices
  async logoutAll(req: AuthRequest, res: Response) {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    await this.authService.logoutAll(userId);
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out from all devices" });
  }
}