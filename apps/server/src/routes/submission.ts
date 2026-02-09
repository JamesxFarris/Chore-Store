import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authMiddleware, requireChild } from "../middleware/auth.js";
import { createSubmissionSchema } from "@chore-store/shared";
import * as submissionService from "../services/submission.js";

export const submissionRouter = Router();

submissionRouter.use(authMiddleware, requireChild);

submissionRouter.post(
  "/:choreInstanceId",
  validate(createSubmissionSchema),
  async (req, res, next) => {
    try {
      const result = await submissionService.createSubmission(
        req.params.choreInstanceId,
        req.child!.id,
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);
