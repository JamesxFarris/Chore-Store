import { api } from "./client.js";
import type { Redemption } from "@chore-store/shared";

export const redemptionApi = {
  create: (rewardId: string) =>
    api.post<Redemption>("/redemptions", { rewardId }),
  my: () => api.get<Redemption[]>("/redemptions/my"),
  list: () => api.get<Redemption[]>("/redemptions"),
  updateStatus: (id: string, status: string) =>
    api.patch<Redemption>(`/redemptions/${id}`, { status }),
};
