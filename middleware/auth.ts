
import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";

/**
 * Authentication middleware using JWT.
 * Renamed to authMiddleware to match its usage in server.ts.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    // Request.user is defined in types/express.d.ts
    req.user = payload as any;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
