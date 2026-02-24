import { User } from "@prisma/client";
import { CreateUserDto, CreateUserDtoType } from "./dto/create-user.dto";
import { UpdateUserDto, UpdateUserDtoType } from "./dto/update-user.dto";
import { prisma } from "../../config/database";

export class UserRepository {
  async create(dto: CreateUserDto): Promise<User> {
    return prisma.user.create({ data: dto });
  }

  async create(dto: CreateUserDtoType): Promise<User> {
    return prisma.user.create({ data: dto });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async update(id: string, dto: UpdateUserDtoType): Promise<User | null> {
    return prisma.user.update({ where: { id }, data: dto }).catch(() => null);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
