import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { asyncHandler } from "../../utils/async-handler";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new UserRepository());

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }
//register : reçoit les données du client, appelle le service pour créer un utilisateur et renvoie le token.

  async register(req: Request, res: Response) {
    const result = await this.authService.register(req.body);
    res.status(201).json(result);
  }
//login : reçoit email et mot de passe, vérifie l’utilisateur, puis renvoie le token si tout est correct.
  async login(req: Request, res: Response) {
    const result = await this.authService.login(req.body);
    res.json(result);
  }
}
