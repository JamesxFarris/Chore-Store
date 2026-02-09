import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.js";
import { householdRouter } from "./routes/household.js";
import { childRouter } from "./routes/child.js";
import { choreTemplateRouter } from "./routes/chore-template.js";
import { choreInstanceRouter } from "./routes/chore-instance.js";
import { submissionRouter } from "./routes/submission.js";
import { verificationRouter } from "./routes/verification.js";
import { pointsRouter } from "./routes/points.js";
import { rewardRouter } from "./routes/reward.js";
import { redemptionRouter } from "./routes/redemption.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Public routes
app.use("/api/auth", authRouter);

// Protected routes (auth middleware applied in each router)
app.use("/api/households", householdRouter);
app.use("/api/children", childRouter);
app.use("/api/chore-templates", choreTemplateRouter);
app.use("/api/chore-instances", choreInstanceRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/verifications", verificationRouter);
app.use("/api/points", pointsRouter);
app.use("/api/rewards", rewardRouter);
app.use("/api/redemptions", redemptionRouter);

app.use(errorHandler);
