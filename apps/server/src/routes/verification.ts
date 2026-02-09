import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireParent } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import { createVerificationSchema } from "@chore-store/shared";
import * as verificationService from "../services/verification.js";

export const verificationRouter = Router();

verificationRouter.use(authMiddleware, requireParent, requireHousehold);

verificationRouter.get("/pending", async (req, res, next) => {
  try {
    const result = await verificationService.getPendingVerifications(
      req.householdId!,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

verificationRouter.post(
  "/:choreInstanceId",
  validate(createVerificationSchema),
  async (req, res, next) => {
    try {
      const result = await verificationService.verify(
        req.params.choreInstanceId,
        req.parent!.id,
        req.householdId!,
        req.body,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
