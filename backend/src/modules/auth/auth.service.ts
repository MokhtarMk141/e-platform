import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, UserRole } from "@prisma/client";
import { UserRepository } from "../user/user.repository";
import { RegisterDtoType } from "./dto/register.dto";
import { LoginDtoType } from "./dto/login.dto";
import { UserResponseDto } from "../user/dto/user-response.dto";
import { AppError } from "../../exceptions/app-error";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { sendEmail } from "../../utils/send-email";
import { expression } from "joi";
import { ref } from "process";

export class AuthService {
  constructor(private userRepository: UserRepository) { }

  private toResponse(
    user: Pick<User, "id" | "name" | "email" | "role" | "createdAt">
  ): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  //make a hush for the tokne with hex type 
  private hashToken(toekn: string): string {
    return crypto.createHash("sha256").update(toekn).digest("hex")
  }


  //-------------------------------------------------------------------------------------------------------------------------  
  //Cette fonction sert à créer un Access Token (JWT) que le client utilisera pour accéder aux routes protégées.
  //sub is just the official JWT claim name for “the subject of the token” (the user the token is about).
  //It could technically be called userId instead of sub, and it would still work.
  //But using sub makes your token JWT-standard, so other libraries and tools recognize it automatically.
  //jwt.sign This is the function from the JWT library that creates the token. the payload is userid and his role 
  //env.jwt_secret is a secret vlaue This is a secret value only your server knows. It ensures the token: cannot be faked and cannot be modified 

  generateAccessToken(userId: string, role: UserRole): string {
    return jwt.sign({ sub: userId, role: role }, env.JWT_SECRET, { expiresIn: "15m" });
  }
  //-------------------------------------------------------------------------------------------------------------------------  


  //-------------------------------------------------------------------------------------------------------------------------  

  // Random string — sent to client, stored as hash in DB
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  //crypto est un module intégré de Node.js qui sert à générer des données cryptographiquement sécurisées.
  //génère 64 octets aléatoires
  //convert  the  buffer to chaîne hexadécimale. Exemple :  octet 255 become "ff" on  hexadécimal.


  //-------------------------------------------------------------------------------------------------------------------------  


  //-------------------------------------------------------------------------------------------------------------------------  

  // Save hashed refresh token to DB

  async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return prisma.refreshToken.create({
      data: {
        token: this.hashToken(token),
        userId,
        expiresAt,
      }
    })

  }




  /*ajoute une nouvelle ligne dans la table refreshToken.
  
  data contient les champs à enregistrer :
  
  token -> le refresh token généré précédemment
  
  userId -> l'utilisateur auquel le token appartient
  
  expiresAt -> date d'expiration du token*/

  //-------------------------------------------------------------------------------------------------------------------------  


  async revokeAllUserTokens(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
  /*Avec Prisma, prisma.refreshToken permet de faire des opérations sur cette table, comme :
  
  findMany -> lire plusieurs tokens
  
  create -> ajouter un token
  
  updateMany > modifier plusieurs tokens à la fois
  
  delete -> supprimer un token
  
  *data = ce qu'on change dans les lignes sélectionnées.
  
  Ici : on met revoked: true - on révoque ces tokens.
  
  * where: { userId, revoked: false } - on sélectionne tous les tokens actifs pour cet utilisateur.
  
  data: { revoked: true } -> on met ces tokens comme révoqués, donc plus aucun token actif ne peut être utilisé
  Résultat : aucun refresh token actif - l'utilisateur devra se reconnecter pour obtenir un nouveau token.
  
  */
  async register(dto: RegisterDtoType) {
    const exist = await this.userRepository.findByEmail(dto.email);
    if (exist) throw new AppError("email already exist", 400);
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({ ...dto, password: hashed })
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user.id, refreshToken);
    return { user: this.toResponse(user), accessToken, refreshToken };
  }


  /*On hash le mot de passe avec bcrypt pour ne pas le stocker en clair.
  
  10 = nombre de salt rounds, plus le nombre est grand, plus c'est sécurisé (mais plus lent).
  
  Exemple : "mypassword" devient "a9f8d7c6e5 ... " (hash sécurisé).
  
  le return comme ca : {
  "user": {
  "id": "123",
  "email": "alice@example.com",
  "name": "Alice"
  
  "accessToken": "eyJhbGciOiJIUzI1 ... ",
  "refreshToken": "a9f8d7c6e5 ... "
  
  Le frontend peut alors :
  
  Afficher le nom de l'utilisateur
  
  Stocker l'access token pour les futures requêtes
  
  Stocker le refresh token pour le renouvellement
  
  L'access token et le refresh token circulent dans la réponse HTTP.
  
  Si quelqu'un intercepte cette réponse (ex : via un réseau non sécurisé ou un bug XSS dans le frontend) :
  
  L'attaquant peut utiliser le refresh token pour générer un nouveau access token et se connecter comme l'utilisateur.
  
  L'access token seul donne accès temporaire aux ressources sécurisées.
  
  Donc il faut toujours protéger ces tokens.
  suivant les bonnes pratiques : HTTPS, stockage sécurisé, HttpOnly cookie, expiration courte, révoquer les tokens -
  le risque est très faible.
  HTTPS :
  Les tokens ne doivent jamais transiter en clair sur HTTP.
  HTTPS chiffre la communication entre client et serveur.
  
  */

  async login(dto: LoginDtoType) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new AppError("Invalid email or password", 400);

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new AppError("Invalid email or password", 400);

    // Revoke all previous tokens on new login
    await this.revokeAllUserTokens(user.id);
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user.id, refreshToken);
    return { user: this.toResponse(user), accessToken, refreshToken };
  }



  async refreshAccessToken(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    // Find token in DB by its hash
    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!stored) throw new AppError("Invalid refresh token", 401);

    if (stored.revoked) throw new AppError("Refresh token has been revoked", 401);

    if (new Date() > stored.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      });
      throw new AppError("Refresh token has expired, please login again", 401);
    }

    // Token rotation — revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const newAccessToken = this.generateAccessToken(stored.user.id, stored.user.role);
    const newRefreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(stored.user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }


  async logoutAll(userId: string) {
    await this.revokeAllUserTokens(userId);
  }





  async logout(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });
    if (!stored) throw new AppError("Invalid refresh token", 401);

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
  }
















  // ─── Forgot / Reset Password ───────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) return;

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate a random token (raw) and store its hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Build reset URL (frontend will handle this route)
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const hashedToken = this.hashToken(rawToken);

    const stored = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!stored) throw new AppError("Invalid or expired reset token", 400);

    if (new Date() > stored.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: stored.id } });
      throw new AppError("Reset token has expired, please request a new one", 400);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(stored.userId, hashedPassword);

    // Delete the used token (single-use)
    await prisma.passwordResetToken.delete({ where: { id: stored.id } });

    // Revoke all refresh tokens (force re-login on all devices)
    await this.revokeAllUserTokens(stored.userId);
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) throw new AppError("Invalid current password", 400);

    const hashed = await bcrypt.hash(newPass, 10);
    await this.userRepository.updatePassword(userId, hashed);

    // Revoke all other sessions on password change
    await this.revokeAllUserTokens(userId);
  }
}
