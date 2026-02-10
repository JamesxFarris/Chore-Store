import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import { ForbiddenError, BadRequestError } from "../lib/errors.js";
import { supabaseAdmin } from "../lib/supabase.js";
import * as pointsService from "../services/points.js";

export const pointsRouter = Router();

pointsRouter.use(authMiddleware, requireHousehold);

// Get balance for current child or specified child (parent)
pointsRouter.get("/balance", async (req, res, next) => {
  try {
    let childId: string;

    if (req.child) {
      // Children can only see their own balance
      childId = req.child.id;
    } else if (req.parent) {
      childId = req.query.childId as string;
      if (!childId) {
        throw new BadRequestError("childId required");
      }
      // Verify child belongs to parent's household
      const { data: child } = await supabaseAdmin
        .from("children")
        .select("id")
        .eq("id", childId)
        .eq("household_id", req.householdId!)
        .maybeSingle();
      if (!child) {
        throw new ForbiddenError("Child not in your household");
      }
    } else {
      throw new BadRequestError("childId required");
    }

    const balance = await pointsService.getBalance(childId);
    res.json({ balance });
  } catch (err) {
    next(err);
  }
});

// Get transaction history
pointsRouter.get("/transactions", async (req, res, next) => {
  try {
    let childId: string;

    if (req.child) {
      childId = req.child.id;
    } else if (req.parent) {
      childId = req.query.childId as string;
      if (!childId) {
        throw new BadRequestError("childId required");
      }
      const { data: child } = await supabaseAdmin
        .from("children")
        .select("id")
        .eq("id", childId)
        .eq("household_id", req.householdId!)
        .maybeSingle();
      if (!child) {
        throw new ForbiddenError("Child not in your household");
      }
    } else {
      throw new BadRequestError("childId required");
    }

    const transactions = await pointsService.getTransactions(childId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});
