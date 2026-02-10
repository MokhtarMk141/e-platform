import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

const userService = new UserService(new UserRepository());

export class UserController {

  async create(req: Request, res: Response) {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  }

  async findAll(req: Request, res: Response) {
    const users = await userService.getUsers();
    res.json(users);
  }

  async findOne(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.getUser(id);
    res.json(user);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.updateUser(id, req.body);
    res.json(user);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const ok = await userService.deleteUser(id);
    res.json({ deleted: ok });
  }
}
