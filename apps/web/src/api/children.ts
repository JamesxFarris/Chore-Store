import { api } from "./client.js";
import type { CreateChildInput, UpdateChildInput, Child } from "@chore-store/shared";

export const childrenApi = {
  list: () => api.get<Child[]>("/children"),
  get: (id: string) => api.get<Child>(`/children/${id}`),
  create: (data: CreateChildInput) => api.post<Child>("/children", data),
  update: (id: string, data: UpdateChildInput) => api.patch<Child>(`/children/${id}`, data),
  delete: (id: string) => api.delete<void>(`/children/${id}`),
};
