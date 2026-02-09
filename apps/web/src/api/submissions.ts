import { api } from "./client.js";
import type { CreateSubmissionInput, Submission } from "@chore-store/shared";

export const submissionApi = {
  create: (choreInstanceId: string, data: CreateSubmissionInput) =>
    api.post<Submission>(`/submissions/${choreInstanceId}`, data),
};
