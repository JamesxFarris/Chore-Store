import { api } from "./client.js";
import type { PointsTransaction } from "@chore-store/shared";

export const pointsApi = {
  balance: (childId?: string) =>
    api.get<{ balance: number }>(
      `/points/balance${childId ? `?childId=${childId}` : ""}`,
    ),
  transactions: (childId?: string) =>
    api.get<PointsTransaction[]>(
      `/points/transactions${childId ? `?childId=${childId}` : ""}`,
    ),
};
