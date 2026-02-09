import { useState, useEffect } from "react";
import { pointsApi } from "../../api/points.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { PointsTransaction } from "@chore-store/shared";

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Points</h1>

      <Card className="text-center">
        <div className="text-sm text-gray-500">Current Balance</div>
        <div className="mt-1 text-4xl font-bold text-yellow-600">{balance}</div>
        <div className="text-sm text-gray-400">points</div>
      </Card>

      <h2 className="text-lg font-semibold">Transaction History</h2>

      {transactions.length === 0 ? (
        <EmptyState title="No transactions yet" description="Complete chores to earn points!" />
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <Card
              key={t.id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <div className="text-sm font-medium">{t.reason}</div>
                <div className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
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
  );
}
