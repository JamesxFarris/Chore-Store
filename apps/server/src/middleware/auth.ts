import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { UnauthorizedError } from "../lib/errors.js";

declare global {
  namespace Express {
    interface Request {
      parent?: { id: string };
      child?: { id: string; householdId: string };
      tokenType?: "parent" | "child";
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing token"));
    }

    const token = header.slice(7);

    // 1. Try custom JWT first (child tokens)
    try {
      const payload = verifyToken(token);
      if (payload.type === "child") {
        req.child = { id: payload.sub, householdId: payload.householdId! };
        req.tokenType = "child";
        return next();
      }
    } catch {
      // Not a custom JWT — try Supabase token next
    }

    // 2. Try Supabase JWT (parent tokens)
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return next(new UnauthorizedError("Invalid token"));
    }

    req.parent = { id: data.user.id };
    req.tokenType = "parent";
    next();
  } catch (err) {
    next(err);
  }
}

export function requireParent(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.parent) {
    throw new UnauthorizedError("Parent access required");
  }
  next();
}

export function requireChild(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.child) {
    throw new UnauthorizedError("Child access required");
  }
  next();
}
