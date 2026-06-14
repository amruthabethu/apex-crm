import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "crm-secret-super-key-2026-dynamic-auth";
const TOKEN_EXPIRY = "24h";

export class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required parameters." });
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password credential." });
      }

      // Check password hash
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password credential." });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return res.status(200).json({
        message: "Successfully authenticated admin workspace.",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Login controller error:", error);
      return res.status(500).json({ error: "An unexpected authentication error occurred." });
    }
  }

  // Get current logged-in user profile
  public static async getCurrentUser(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication state unresolved." });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User detail could not be loaded." });
      }

      return res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Get Current User error:", error);
      return res.status(500).json({ error: "Failed to fetch user state." });
    }
  }
}
