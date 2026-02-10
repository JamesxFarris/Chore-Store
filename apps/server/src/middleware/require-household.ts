import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { ForbiddenError } from "../lib/errors.js";

declare global {
  namespace Express {
    interface Request {
      householdId?: string;
    }
  }
}

export async function requireHousehold(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (req.child) {
      req.householdId = req.child.householdId;
      return next();
    }

    if (req.parent) {
      const { data: membership } = await supabaseAdmin
        .from("household_members")
        .select("household_id")
        .eq("user_id", req.parent.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        return next(new ForbiddenError("You must belong to a household"));
      }
      req.householdId = membership.household_id;
      return next();
    }

    next(new ForbiddenError("Authentication required"));
  } catch (err) {
    next(err);
  }
}
