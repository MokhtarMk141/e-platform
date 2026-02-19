import { User } from "@prisma/client"; // le type TypeScript généré par Prisma pour la table user de ta base.
import { CreateUserDto } from "./dto/create-user.dto"; //un objet (Data Transfer Object) 
import { UpdateUserDto } from "./dto/update-user.dto"; 
import { prisma } from "../../config/database";

//class 
export class UserRepository {

// async => Cette fonction va travailler avec des choses qui prennent du temps (comme des requêtes sur Internet) et elle va renvoyer une promesse
  async create(dto: CreateUserDto): Promise<User> {     //promise  est un objet qui représente le résultat futur d’une opération qui prend du temps.
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


  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

}