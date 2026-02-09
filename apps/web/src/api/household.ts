import { api } from "./client.js";
import type { CreateHouseholdInput, JoinHouseholdInput } from "@chore-store/shared";

export const householdApi = {
  create: (data: CreateHouseholdInput) => api.post<any>("/households", data),
  join: (data: JoinHouseholdInput) => api.post<any>("/households/join", data),
  getCurrent: () => api.get<any>("/households/current"),
};
