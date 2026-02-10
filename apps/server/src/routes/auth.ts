import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireParent } from "../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  childLoginSchema,
} from "@chore-store/shared";
import * as authService from "../services/auth.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

authRouter.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  "/child-login",
  authLimiter,
  validate(childLoginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.childLogin(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.get(
  "/me",
  authMiddleware,
  requireParent,
  async (req, res, next) => {
    try {
      const result = await authService.getMe(req.parent!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
