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
  if (req.child) {
    req.householdId = req.child.householdId;
    next();
    return;
  }

  if (req.parent) {
    const { data: membership } = await supabaseAdmin
      .from("household_members")
      .select("household_id")
      .eq("user_id", req.parent.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      throw new ForbiddenError("You must belong to a household");
    }
    req.householdId = membership.household_id;
    next();
    return;
  }

  throw new ForbiddenError("Authentication required");
}
