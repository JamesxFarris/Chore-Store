import { useState, useEffect } from "react";
import { pointsApi } from "../../api/points.js";

export function PointsBadge() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    pointsApi.balance().then((r) => setBalance(r.balance)).catch(() => {});
  }, []);

  if (balance === null) {
    return (
      <span className="inline-flex h-8 w-16 animate-pulse items-center rounded-full bg-amber-100" />
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-md">
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {balance}
    </span>
  );
}
