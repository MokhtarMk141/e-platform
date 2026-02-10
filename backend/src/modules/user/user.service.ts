import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import bcrypt from "bcryptjs";
import { UserEntity } from "./entity/user.entity";

export class UserService {
  constructor(private repository: UserRepository) {}


private toResponse(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}


  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const exist = await this.repository.findByEmail(dto.email);
    if (exist) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.repository.create({
      ...dto,
      password: hashedPassword
    });

    return this.toResponse(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.repository.findById(id);
    if (!user) throw new Error("User not found");

    return this.toResponse(user);
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.repository.findAll();
    return users.map(u => this.toResponse(u));
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.repository.update(id, dto);
    if (!user) throw new Error("User not found");

    return this.toResponse(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
