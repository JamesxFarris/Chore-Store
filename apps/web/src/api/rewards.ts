import { api } from "./client.js";
import type { CreateRewardInput, UpdateRewardInput, Reward } from "@chore-store/shared";

export const rewardApi = {
  list: () => api.get<Reward[]>("/rewards"),
  shop: () => api.get<Reward[]>("/rewards/shop"),
  create: (data: CreateRewardInput) => api.post<Reward>("/rewards", data),
  update: (id: string, data: UpdateRewardInput) =>
    api.patch<Reward>(`/rewards/${id}`, data),
  delete: (id: string) => api.delete<void>(`/rewards/${id}`),
};
