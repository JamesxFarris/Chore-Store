import { useState, useEffect } from "react";
import { pointsApi } from "../../api/points.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
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
        <PageHeader title="My Points" />
        <SkeletonCard />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Points" />

      <Card className="text-center bg-gradient-to-br from-points-50 to-points-100/50">
        <div className="text-sm font-medium text-points-600">Current Balance</div>
        <div className="mt-1 text-5xl font-bold text-points-700">{balance}</div>
        <div className="mt-1 text-sm text-points-500">points</div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Transaction History</h2>

        {transactions.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">💰</span>}
            title="No transactions yet"
            description="Complete chores to earn points!"
          />
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <Card key={t.id} className="flex items-center justify-between py-4">
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
                <Badge color={t.amount > 0 ? "green" : "red"}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
