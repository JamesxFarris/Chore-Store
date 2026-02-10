import { useState, useEffect } from "react";
import { pointsApi } from "../../api/points.js";

export function PointsBadge() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    pointsApi.balance().then((r) => setBalance(r.balance)).catch(() => {});
  }, []);

  if (balance === null) {
    return (
      <span className="inline-flex h-8 w-16 animate-pulse items-center rounded-full bg-points-100" />
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-points-100 px-3 py-1.5 text-sm font-bold text-points-700 shadow-sm">
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.38 5.38 0 01-.491-.921h2.755a1 1 0 100-2H8.003a7.36 7.36 0 010-1h3.997a1 1 0 100-2H8.245c.13-.332.3-.647.491-.921z" />
      </svg>
      {balance}
    </span>
  );
}
