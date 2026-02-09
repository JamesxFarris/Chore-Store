import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireHousehold } from "../middleware/require-household.js";
import * as choreInstanceService from "../services/chore-instance.js";

export const choreInstanceRouter = Router();

choreInstanceRouter.use(authMiddleware, requireHousehold);

// Generate recurring instances (called on dashboard load)
choreInstanceRouter.post("/generate", async (req, res, next) => {
  try {
    await choreInstanceService.generateInstances(
      req.householdId!,
      req.child?.id,
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Get instances for the current child's day
choreInstanceRouter.get("/my", async (req, res, next) => {
  try {
    if (!req.child) {
      res.status(401).json({ error: "Child access required" });
      return;
    }
    // Lazily generate instances first
    await choreInstanceService.generateInstances(
      req.child.householdId,
      req.child.id,
    );
    const result = await choreInstanceService.getInstancesForChild(
      req.child.id,
      req.query.date as string | undefined,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get all instances for household (parent view)
choreInstanceRouter.get("/", async (req, res, next) => {
  try {
    const result = await choreInstanceService.getInstancesForHousehold(
      req.householdId!,
      req.query.date as string | undefined,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get single instance
choreInstanceRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await choreInstanceService.getInstance(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Create one-time instance (assign to child)
choreInstanceRouter.post("/", async (req, res, next) => {
  try {
    const result = await choreInstanceService.createOneTimeInstance(
      req.body.templateId,
      req.body.childId,
      req.body.dueDate,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
