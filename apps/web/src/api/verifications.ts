import { api } from "./client.js";
import type { CreateVerificationInput, ChoreInstance } from "@chore-store/shared";

export const verificationApi = {
  pending: () => api.get<ChoreInstance[]>("/verifications/pending"),
  verify: (choreInstanceId: string, data: CreateVerificationInput) =>
    api.post<any>(`/verifications/${choreInstanceId}`, data),
};
