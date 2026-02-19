import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import bcrypt from "bcryptjs";
import { AppError } from "../../exceptions/app-error";

export class UserService {
  constructor(private repository: UserRepository) {}

  private toResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const exist = await this.repository.findByEmail(dto.email);
    if (exist) throw new AppError("Email already exists", 400);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.repository.create({ ...dto, password: hashedPassword });
    return this.toResponse(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return this.toResponse(user);
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.repository.findAll();
    return users.map(u => this.toResponse(u));
  }
}
