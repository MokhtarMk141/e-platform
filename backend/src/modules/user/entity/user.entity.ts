import { User, UserRole } from "@prisma/client";

export class UserEntity {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static toEntity(user: User): UserEntity {
    return new UserEntity(user);
  }
}
