import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import { createRewardSchema, updateRewardSchema } from "@chore-store/shared";
import * as rewardService from "../services/reward.js";

export const rewardRouter = Router();

rewardRouter.use(authMiddleware, requireHousehold);

rewardRouter.post(
  "/",
  validate(createRewardSchema),
  async (req, res, next) => {
    try {
      const result = await rewardService.createReward(
        req.householdId!,
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

// All rewards (parent)
rewardRouter.get("/", async (req, res, next) => {
  try {
    const result = await rewardService.getRewards(req.householdId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Active rewards only (child shop)
rewardRouter.get("/shop", async (req, res, next) => {
  try {
    const result = await rewardService.getActiveRewards(req.householdId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

rewardRouter.patch(
  "/:id",
  validate(updateRewardSchema),
  async (req, res, next) => {
    try {
      const result = await rewardService.updateReward(
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

rewardRouter.delete("/:id", async (req, res, next) => {
  try {
    await rewardService.deleteReward(req.params.id, req.householdId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
