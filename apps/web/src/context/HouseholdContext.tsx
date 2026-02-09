import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { householdApi } from "../api/household.js";
import { useAuth } from "./AuthContext.js";

interface HouseholdData {
  id: string;
  name: string;
  inviteCode: string;
  members: { id: string; role: string; user: { id: string; name: string; email: string } }[];
  children: { id: string; name: string; avatar: string | null; createdAt: string }[];
}

interface HouseholdContextValue {
  household: HouseholdData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { token, type, parent } = useAuth();
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await householdApi.getCurrent();
      setHousehold(data);
    } catch {
      setHousehold(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && type === "parent" && parent?.households?.length) {
      fetch();
    } else {
      setLoading(false);
    }
  }, [token, type, parent, fetch]);

  return (
    <HouseholdContext.Provider value={{ household, loading, refresh: fetch }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx)
    throw new Error("useHousehold must be used within HouseholdProvider");
  return ctx;
}
