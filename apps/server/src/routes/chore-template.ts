import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireParent } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import {
  createChoreTemplateSchema,
  updateChoreTemplateSchema,
} from "@chore-store/shared";
import * as choreTemplateService from "../services/chore-template.js";

export const choreTemplateRouter = Router();

choreTemplateRouter.use(authMiddleware, requireParent, requireHousehold);

choreTemplateRouter.post(
  "/",
  validate(createChoreTemplateSchema),
  async (req, res, next) => {
    try {
      const result = await choreTemplateService.createChoreTemplate(
        req.householdId!,
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

choreTemplateRouter.get("/", async (req, res, next) => {
  try {
    const result = await choreTemplateService.getChoreTemplates(
      req.householdId!,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

choreTemplateRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await choreTemplateService.getChoreTemplate(
      req.params.id,
      req.householdId!,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

choreTemplateRouter.patch(
  "/:id",
  validate(updateChoreTemplateSchema),
  async (req, res, next) => {
    try {
      const result = await choreTemplateService.updateChoreTemplate(
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

choreTemplateRouter.delete("/:id", async (req, res, next) => {
  try {
    await choreTemplateService.deleteChoreTemplate(
      req.params.id,
      req.householdId!,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
