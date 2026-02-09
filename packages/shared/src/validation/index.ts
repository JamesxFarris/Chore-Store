import { z } from "zod";

// Auth
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const childLoginSchema = z.object({
  householdCode: z.string().min(1),
  childName: z.string().min(1),
  pin: z.string().length(4, "PIN must be 4 digits"),
});
export type ChildLoginInput = z.infer<typeof childLoginSchema>;

// Household
export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});
export type JoinHouseholdInput = z.infer<typeof joinHouseholdSchema>;

// Child
export const createChildSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  avatar: z.string().nullable().optional(),
  pin: z.string().length(4, "PIN must be 4 digits").regex(/^\d{4}$/, "PIN must be 4 digits"),
});
export type CreateChildInput = z.infer<typeof createChildSchema>;

export const updateChildSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().nullable().optional(),
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
});
export type UpdateChildInput = z.infer<typeof updateChildSchema>;

// Chore Template
export const createChoreTemplateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).nullable().optional(),
  points: z.number().int().min(1, "Points must be at least 1"),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY"]),
  assignedChildId: z.string().uuid().nullable().optional(),
});
export type CreateChoreTemplateInput = z.infer<typeof createChoreTemplateSchema>;

export const updateChoreTemplateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  points: z.number().int().min(1).optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY"]).optional(),
  isActive: z.boolean().optional(),
  assignedChildId: z.string().uuid().nullable().optional(),
});
export type UpdateChoreTemplateInput = z.infer<typeof updateChoreTemplateSchema>;

// Submission
export const createSubmissionSchema = z.object({
  note: z.string().max(500).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
});
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

// Verification
export const createVerificationSchema = z.object({
  status: z.enum(["APPROVED", "DENIED"]),
  message: z.string().max(500).nullable().optional(),
});
export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;

// Reward
export const createRewardSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).nullable().optional(),
  pointCost: z.number().int().min(1, "Point cost must be at least 1"),
});
export type CreateRewardInput = z.infer<typeof createRewardSchema>;

export const updateRewardSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  pointCost: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;

// Redemption
export const createRedemptionSchema = z.object({
  rewardId: z.string().uuid(),
});
export type CreateRedemptionInput = z.infer<typeof createRedemptionSchema>;

export const updateRedemptionStatusSchema = z.object({
  status: z.enum(["APPROVED", "DELIVERED"]),
});
export type UpdateRedemptionStatusInput = z.infer<typeof updateRedemptionStatusSchema>;
