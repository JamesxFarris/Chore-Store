import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.js";

interface ParentUser {
  id: string;
  email: string;
  name: string;
  households: { id: string; name: string; inviteCode: string; role: string }[];
}

interface ChildUser {
  id: string;
  name: string;
  avatar: string | null;
  householdId: string;
}

interface AuthState {
  token: string | null;
  type: "parent" | "child" | null;
  parent: ParentUser | null;
  child: ChildUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  loginParent: (token: string) => Promise<void>;
  loginChild: (token: string, child: ChildUser) => void;
  logout: () => void;
  refreshParent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem("token"),
    type: localStorage.getItem("tokenType") as "parent" | "child" | null,
    parent: null,
    child: null,
    loading: true,
  });

  const fetchParent = useCallback(async () => {
    try {
      const data = await authApi.me();
      setState((s) => ({ ...s, parent: data, loading: false }));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenType");
      setState({ token: null, type: null, parent: null, child: null, loading: false });
    }
  }, []);

  useEffect(() => {
    if (state.token && state.type === "parent") {
      fetchParent();
    } else if (state.token && state.type === "child") {
      const stored = localStorage.getItem("childUser");
      if (stored) {
        setState((s) => ({ ...s, child: JSON.parse(stored), loading: false }));
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loginParent = async (token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("tokenType", "parent");
    setState((s) => ({ ...s, token, type: "parent", child: null }));
    const data = await authApi.me();
    setState((s) => ({ ...s, parent: data, loading: false }));
  };

  const loginChild = (token: string, child: ChildUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("tokenType", "child");
    localStorage.setItem("childUser", JSON.stringify(child));
    setState({ token, type: "child", parent: null, child, loading: false });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("childUser");
    setState({ token: null, type: null, parent: null, child: null, loading: false });
  };

  const refreshParent = async () => {
    await fetchParent();
  };

  return (
    <AuthContext.Provider
      value={{ ...state, loginParent, loginChild, logout, refreshParent }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
