import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireParent } from "../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  childLoginSchema,
} from "@chore-store/shared";
import * as authService from "../services/auth.js";

export const authRouter = Router();

authRouter.post(
  "/register",
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
