import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../exceptions/app-error";
//un middleware pour Express, qui va vérifier que l’utilisateur a fourni un token JWT valide. 
// AuthRequest est une version personnalisée de Request où on peut stocker user
export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) { //Bearer est juste un mot-clé qui dit au serveur : 
  // “Voici le token que je porte pour m’authentifier”. C’est un standard dans les APIs REST sécurisées.
  //Le serveur s’attend à ce format : Bearer <token>.
  // header = valeur de l’en-tête Authorization. La condition vérifie :
//Si l’en-tête existe (!header).
//Si l’en-tête commence par "Bearer " (!header.startsWith("Bearer ")).
//Si l’une de ces conditions n’est pas remplie, on rejette la requête avec une erreur 401 (Unauthorized).
    throw new AppError("Unauthorized", 401);
  }


  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
//On extrait le token après "Bearer ".
//jwt.verify vérifie que le token est valide et non expiré.
//Si valide, on met les informations du token dans req.user.
//Sinon, on renvoie une erreur Invalid token.
}
//Ce middleware sert à protéger les routes ; seulement les requêtes avec un token JWT valide peuvent passer.