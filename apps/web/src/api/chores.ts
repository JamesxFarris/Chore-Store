import { api } from "./client.js";
import type {
  CreateChoreTemplateInput,
  UpdateChoreTemplateInput,
  ChoreTemplate,
  ChoreInstance,
} from "@chore-store/shared";

export const choreTemplateApi = {
  list: () => api.get<ChoreTemplate[]>("/chore-templates"),
  get: (id: string) => api.get<ChoreTemplate>(`/chore-templates/${id}`),
  create: (data: CreateChoreTemplateInput) =>
    api.post<ChoreTemplate>("/chore-templates", data),
  update: (id: string, data: UpdateChoreTemplateInput) =>
    api.patch<ChoreTemplate>(`/chore-templates/${id}`, data),
  delete: (id: string) => api.delete<void>(`/chore-templates/${id}`),
};

export const choreInstanceApi = {
  generate: () => api.post<{ ok: boolean }>("/chore-instances/generate"),
  myChores: (date?: string) =>
    api.get<ChoreInstance[]>(
      `/chore-instances/my${date ? `?date=${date}` : ""}`,
    ),
  list: (date?: string) =>
    api.get<ChoreInstance[]>(
      `/chore-instances${date ? `?date=${date}` : ""}`,
    ),
  get: (id: string) => api.get<ChoreInstance>(`/chore-instances/${id}`),
  create: (data: { templateId: string; childId: string; dueDate?: string }) =>
    api.post<ChoreInstance>("/chore-instances", data),
};
