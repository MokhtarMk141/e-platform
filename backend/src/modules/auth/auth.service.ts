import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRepository } from "../user/user.repository";
import { RegisterDtoType } from "./dto/register.dto";
import { LoginDtoType } from "./dto/login.dto";
import { UserResponseDto } from "../user/dto/user-response.dto";
import { AppError } from "../../exceptions/app-error";
import { prisma } from "../../config/database";
import { env } from "../../config/env";

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  private toResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  /**
   * Hash a refresh token with SHA-256 before storing in DB.
   * The raw token is only ever sent to the client — we never store it.
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  // Short lived — 15 minutes
  generateAccessToken(userId: string, role: string) {
    return jwt.sign(
      { sub: userId, role },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );
  }

  // Random string — sent to client, stored as hash in DB
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  // Save hashed refresh token to DB
  async saveRefreshToken(userId: string, rawToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    return prisma.refreshToken.create({
      data: {
        token: this.hashToken(rawToken),
        userId,
        expiresAt,
      },
    });
  }

  // Revoke all tokens for this user
  async revokeAllUserTokens(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async register(dto: RegisterDtoType) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new AppError("Email already exists", 400);

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({ ...dto, password: hashed });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user.id, refreshToken);

    return { user: this.toResponse(user), accessToken, refreshToken };
  }

  async login(dto: LoginDtoType) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new AppError("Invalid email or password", 400);

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new AppError("Invalid email or password", 400);

    // Revoke all previous tokens on new login
    await this.revokeAllUserTokens(user.id);

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user.id, refreshToken);

    return { user: this.toResponse(user), accessToken, refreshToken };
  }

  async refreshAccessToken(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    // Find token in DB by its hash
    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!stored) throw new AppError("Invalid refresh token", 401);

    if (stored.revoked) throw new AppError("Refresh token has been revoked", 401);

    if (new Date() > stored.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      });
      throw new AppError("Refresh token has expired, please login again", 401);
    }

    // Token rotation — revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const newAccessToken = this.generateAccessToken(stored.user.id, stored.user.role);
    const newRefreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(stored.user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });
    if (!stored) throw new AppError("Invalid refresh token", 401);

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
  }

  async logoutAll(userId: string) {
    await this.revokeAllUserTokens(userId);
  }
}