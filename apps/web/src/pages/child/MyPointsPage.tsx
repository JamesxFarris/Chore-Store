import { useState, useEffect } from "react";
import { pointsApi } from "../../api/points.js";
import { Card } from "../../components/ui/Card.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { SkeletonCard, SkeletonList } from "../../components/ui/Skeleton.js";
import type { PointsTransaction } from "@chore-store/shared";
import toast from "react-hot-toast";

export function MyPointsPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([pointsApi.balance(), pointsApi.transactions()])
      .then(([b, t]) => {
        setBalance(b.balance);
        setTransactions(t);
      })
      .catch((err) => toast.error(err.message || "Failed to load points"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">My Points</h1>
        <SkeletonCard />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-white">My Points</h1>

      {/* Balance hero card */}
      <Card variant="child" className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white">
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          My Stars
        </div>
        <div className="mt-2 font-display text-6xl font-bold text-amber-500 animate-bounce-in">
          {balance}
        </div>
        <div className="mt-1 text-sm text-gray-400">points</div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-sm font-semibold text-white/90">Transaction History</h2>

        {transactions.length === 0 ? (
          <EmptyState
            variant="child"
            icon={<span className="text-3xl">💰</span>}
            title="No transactions yet"
            description="Complete chores to earn points!"
          />
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <Card key={t.id} variant="child" className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{t.reason}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <span className={`font-display text-base font-bold ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
