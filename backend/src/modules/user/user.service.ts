import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import bcrypt from "bcryptjs";
import { AppError } from "../../exceptions/app-error";
import { User } from "@prisma/client";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  private toResponse(
    user: Pick<User, "id" | "name" | "email" | "createdAt">
  ): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new AppError("Email already exists", 400);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return this.toResponse(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return this.toResponse(user);
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toResponse(user));
  }
}
