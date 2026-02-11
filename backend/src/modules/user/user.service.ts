import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private repository: UserRepository) {}

  //the dto represente responce after create or modifiy  
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
    if (exist) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10); //const peut contenir n’importe quoi
    const user = await this.repository.create({ ...dto, password: hashedPassword });  //tout le dto sauf que le password 
    // doit être remplacé par hashedPassword  C’est juste une manière rapide et propre de copier tout l’objet
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
}
