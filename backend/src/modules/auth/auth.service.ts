import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../user/user.repository";
import { RegisterDtoType } from "./dto/register.dto";
import { LoginDtoType } from "./dto/login.dto";
import { UserResponseDto } from "../user/dto/user-response.dto";
import { AppError } from "../../exceptions/app-error";

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
  async register(dto: RegisterDtoType) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new AppError("Email already exists", 400);

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.create({ ...dto, password: hashed });

    const token = this.generateToken(user.id, user.role);

    return { user: this.toResponse(user), token };
  }

  async login(dto: LoginDtoType) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new AppError("Invalid email or password", 400);

    const valid = await bcrypt.compare(dto.password, user.password); //On compare le mot de passe avec bcrypt.compare.
    if (!valid) throw new AppError("Invalid email or password", 400);

    const token = this.generateToken(user.id, user.role);

    return { user: this.toResponse(user), token };
  }

  generateToken(userId: string, role: string) {
    return jwt.sign(
      { sub: userId, role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
  } //jwt.sign crée un token JWT qui contient l’ID et le rôle de l’utilisateur.
    //expiresIn: "7d" : le token expire après 7 jours. =>expiresIn: "7d" fait que le token devient invalide
    //  après 7 jours pour limiter les risques de vol ou d’utilisation abusive du token.
}
