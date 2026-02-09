import { api } from "./client.js";
import type { RegisterInput, LoginInput, ChildLoginInput } from "@chore-store/shared";

interface AuthResponse {
  token: string;
  user?: { id: string; email: string; name: string };
  child?: { id: string; name: string; avatar: string | null; householdId: string };
}

interface MeResponse {
  id: string;
  email: string;
  name: string;
  households: { id: string; name: string; inviteCode: string; role: string }[];
}

export const authApi = {
  register: (data: RegisterInput) => api.post<AuthResponse>("/auth/register", data),
  login: (data: LoginInput) => api.post<AuthResponse>("/auth/login", data),
  childLogin: (data: ChildLoginInput) => api.post<AuthResponse>("/auth/child-login", data),
  me: () => api.get<MeResponse>("/auth/me"),
};
