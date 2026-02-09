import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import {
  createRedemptionSchema,
  updateRedemptionStatusSchema,
} from "@chore-store/shared";
import * as redemptionService from "../services/redemption.js";

export const redemptionRouter = Router();

redemptionRouter.use(authMiddleware, requireHousehold);

// Child creates a redemption
redemptionRouter.post(
  "/",
  validate(createRedemptionSchema),
  async (req, res, next) => {
    try {
      if (!req.child) {
        res.status(401).json({ error: "Child access required" });
        return;
      }
      const result = await redemptionService.createRedemption(
        req.child.id,
        req.body.rewardId,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

// Child's own redemptions
redemptionRouter.get("/my", async (req, res, next) => {
  try {
    if (!req.child) {
      res.status(401).json({ error: "Child access required" });
      return;
    }
    const result = await redemptionService.getRedemptionsForChild(req.child.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Parent: all redemptions in household
redemptionRouter.get("/", async (req, res, next) => {
  try {
    const result = await redemptionService.getRedemptionsForHousehold(
      req.householdId!,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Parent updates redemption status
redemptionRouter.patch(
  "/:id",
  validate(updateRedemptionStatusSchema),
  async (req, res, next) => {
    try {
      const result = await redemptionService.updateRedemptionStatus(
        req.params.id,
        req.householdId!,
        req.body,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
