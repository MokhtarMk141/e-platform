import { UserRepository } from "../user/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserResponseDto } from "../user/dto/user-response.dto";

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

  async register(dto: RegisterDto): Promise<{ user: UserResponseDto; token: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({ ...dto, password: hashedPassword });

    const token = this.generateToken(user.id, user.role);
    return { user: this.toResponse(user), token };
  }

  async login(dto: LoginDto): Promise<{ user: UserResponseDto; token: string }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const token = this.generateToken(user.id, user.role);
    return { user: this.toResponse(user), token };
  }

  generateToken(userId: string, role: string) {
    return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
  }
}
