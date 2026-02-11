// src/modules/user/user.controller.ts
import { Request, Response } from "express";
import { UserService } from "./user.service";

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async findOne(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    try {
      const user = await userService.getUser(id);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}
