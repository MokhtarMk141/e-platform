// src/modules/user/user.repository.ts
import { User } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { prisma } from "../../config/database";

export class UserRepository {
  async create(dto: CreateUserDto): Promise<User> {
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

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
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
}
