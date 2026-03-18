
import { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  res.status(500).json({
    error: "Internal server error",
  });
}
