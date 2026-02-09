import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireParent } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import { createChildSchema, updateChildSchema } from "@chore-store/shared";
import * as childService from "../services/child.js";

export const childRouter = Router();

childRouter.use(authMiddleware, requireParent, requireHousehold);

childRouter.post(
  "/",
  validate(createChildSchema),
  async (req, res, next) => {
    try {
      const result = await childService.createChild(req.householdId!, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

childRouter.get("/", async (req, res, next) => {
  try {
    const result = await childService.getChildren(req.householdId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

childRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await childService.getChild(req.params.id, req.householdId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

childRouter.patch(
  "/:id",
  validate(updateChildSchema),
  async (req, res, next) => {
    try {
      const result = await childService.updateChild(
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

childRouter.delete("/:id", async (req, res, next) => {
  try {
    await childService.deleteChild(req.params.id, req.householdId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
