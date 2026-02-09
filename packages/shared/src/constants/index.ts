export const Role = {
  PARENT: "PARENT",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Recurrence = {
  NONE: "NONE",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
} as const;
export type Recurrence = (typeof Recurrence)[keyof typeof Recurrence];

export const ChoreStatus = {
  TODO: "TODO",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;
export type ChoreStatus = (typeof ChoreStatus)[keyof typeof ChoreStatus];

export const VerificationStatus = {
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const PointsType = {
  EARNED: "EARNED",
  SPENT: "SPENT",
} as const;
export type PointsType = (typeof PointsType)[keyof typeof PointsType];

export const RedemptionStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  DELIVERED: "DELIVERED",
} as const;
export type RedemptionStatus =
  (typeof RedemptionStatus)[keyof typeof RedemptionStatus];

export const TokenType = {
  PARENT: "parent",
  CHILD: "child",
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];
