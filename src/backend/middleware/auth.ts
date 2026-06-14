import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "crm-secret-super-key-2026-dynamic-auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }

  // Expecting format: Bearer <token>
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Malformed authorization header. Expected 'Bearer <token>'" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid, expired, or corrupted authentication token." });
  }
}
