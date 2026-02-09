import { useState, useEffect } from "react";
import { redemptionApi } from "../../api/redemptions.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";

const statusColors = {
  REQUESTED: "yellow",
  APPROVED: "blue",
  DELIVERED: "green",
} as const;

export function MyRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    redemptionApi
      .my()
      .then(setRedemptions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Rewards</h1>

      {redemptions.length === 0 ? (
        <EmptyState title="No redemptions yet" description="Visit the shop to redeem rewards!" />
      ) : (
        <div className="space-y-3">
          {redemptions.map((r: any) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.reward?.name}</div>
                <div className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Badge color={statusColors[r.status as keyof typeof statusColors] || "gray"}>
                {r.status}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
