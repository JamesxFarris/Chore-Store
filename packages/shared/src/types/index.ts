import type {
  Role,
  Recurrence,
  ChoreStatus,
  VerificationStatus,
  PointsType,
  RedemptionStatus,
} from "../constants/index.js";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: Role;
}

export interface Child {
  id: string;
  name: string;
  avatar: string | null;
  householdId: string;
  createdAt: string;
}

export interface ChoreTemplate {
  id: string;
  title: string;
  description: string | null;
  points: number;
  recurrence: Recurrence;
  householdId: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChoreInstance {
  id: string;
  templateId: string;
  assignedChildId: string | null;
  dueDate: string;
  status: ChoreStatus;
  createdAt: string;
  template?: ChoreTemplate;
  assignedChild?: Child | null;
  submission?: Submission | null;
  verification?: Verification | null;
}

export interface Submission {
  id: string;
  choreInstanceId: string;
  note: string | null;
  photoUrl: string | null;
  submittedAt: string;
}

export interface Verification {
  id: string;
  choreInstanceId: string;
  parentId: string;
  status: VerificationStatus;
  message: string | null;
  createdAt: string;
}

export interface PointsTransaction {
  id: string;
  childId: string;
  amount: number;
  type: PointsType;
  reason: string;
  choreInstanceId: string | null;
  redemptionId: string | null;
  createdAt: string;
}

export interface Reward {
  id: string;
  householdId: string;
  name: string;
  description: string | null;
  pointCost: number;
  isActive: boolean;
  createdAt: string;
}

export interface Redemption {
  id: string;
  childId: string;
  rewardId: string;
  status: RedemptionStatus;
  createdAt: string;
  reward?: Reward;
  child?: Child;
}

export interface AuthTokenPayload {
  sub: string;
  type: "parent" | "child";
  householdId?: string;
}
