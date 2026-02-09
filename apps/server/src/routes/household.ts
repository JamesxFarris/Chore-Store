import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireParent } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import { createHouseholdSchema, joinHouseholdSchema } from "@chore-store/shared";
import * as householdService from "../services/household.js";

export const householdRouter = Router();

householdRouter.use(authMiddleware, requireParent);

householdRouter.post(
  "/",
  validate(createHouseholdSchema),
  async (req, res, next) => {
    try {
      const result = await householdService.createHousehold(
        req.parent!.id,
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

householdRouter.post(
  "/join",
  validate(joinHouseholdSchema),
  async (req, res, next) => {
    try {
      const result = await householdService.joinHousehold(
        req.parent!.id,
        req.body.inviteCode,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

householdRouter.get(
  "/current",
  requireHousehold,
  async (req, res, next) => {
    try {
      const result = await householdService.getHousehold(req.householdId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
