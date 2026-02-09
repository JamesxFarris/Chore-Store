import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as pointsService from "../services/points.js";

export const pointsRouter = Router();

pointsRouter.use(authMiddleware);

// Get balance for current child
pointsRouter.get("/balance", async (req, res, next) => {
  try {
    const childId = req.child?.id || (req.query.childId as string);
    if (!childId) {
      res.status(400).json({ error: "childId required" });
      return;
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
    const childId = req.child?.id || (req.query.childId as string);
    if (!childId) {
      res.status(400).json({ error: "childId required" });
      return;
    }
    const transactions = await pointsService.getTransactions(childId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});
