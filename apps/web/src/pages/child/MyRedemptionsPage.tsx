import { useState, useEffect } from "react";
import { redemptionApi } from "../../api/redemptions.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import { getRewardEmoji } from "../../lib/reward-emoji.js";
import toast from "react-hot-toast";

const statusConfig = {
  REQUESTED: { color: "yellow" as const, label: "Requested", step: 1 },
  APPROVED: { color: "blue" as const, label: "Approved", step: 2 },
  DELIVERED: { color: "green" as const, label: "Delivered", step: 3 },
};

const steps = ["Requested", "Approved", "Delivered"];

export function MyRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    redemptionApi
      .my()
      .then(setRedemptions)
      .catch((err) => toast.error(err.message || "Failed to load redemptions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white">My Rewards</h1>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-white">My Rewards</h1>

      {redemptions.length === 0 ? (
        <EmptyState
          variant="child"
          icon={<span className="text-3xl">🎁</span>}
          title="No redemptions yet"
          description="Visit the shop to redeem rewards!"
        />
      ) : (
        <div className="space-y-3">
          {redemptions.map((r: any) => {
            const config = statusConfig[r.status as keyof typeof statusConfig] || statusConfig.REQUESTED;
            const rewardName = r.reward?.name || "Reward";
            return (
              <Card key={r.id} variant="child">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                    {getRewardEmoji(rewardName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-display font-semibold text-gray-900">{rewardName}</div>
                      <Badge color={config.color}>{config.label}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StarPoints value={r.reward?.pointCost || 0} size="sm" />
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Status stepper */}
                <div className="mt-4 flex items-center gap-1">
                  {steps.map((step, i) => {
                    const active = i < config.step;
                    return (
                      <div key={step} className="flex flex-1 flex-col items-center gap-1">
                        <div className={`h-2 w-full rounded-full transition-colors ${active ? "bg-green-500" : "bg-gray-200"}`} />
                        <span className={`text-[10px] ${active ? "font-medium text-green-600" : "text-gray-400"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
