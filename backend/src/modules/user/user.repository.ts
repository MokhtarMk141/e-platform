import { UserEntity } from "./entity/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { randomUUID } from "crypto";

export class UserRepository {
  private users: UserEntity[] = [];

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const user: UserEntity = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      password: dto.password,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.find(u => u.email === email) ?? null;
  }

  async findAll(): Promise<UserEntity[]> {
    return this.users;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity | null> {
    const user = await this.findById(id);
    if (!user) return null;

    Object.assign(user, dto, { updatedAt: new Date() });
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }
}
