import { useState, useEffect } from "react";
import { redemptionApi } from "../../api/redemptions.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
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
        <PageHeader title="My Rewards" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Rewards" subtitle={`${redemptions.length} redemption${redemptions.length !== 1 ? "s" : ""}`} />

      {redemptions.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">🎁</span>}
          title="No redemptions yet"
          description="Visit the shop to redeem rewards!"
        />
      ) : (
        <div className="space-y-3">
          {redemptions.map((r: any) => {
            const config = statusConfig[r.status as keyof typeof statusConfig] || statusConfig.REQUESTED;
            return (
              <Card key={r.id}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">{r.reward?.name}</div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <Badge color={config.color}>{config.label}</Badge>
                </div>
                {/* Status stepper */}
                <div className="mt-4 flex items-center gap-1">
                  {steps.map((step, i) => {
                    const active = i < config.step;
                    return (
                      <div key={step} className="flex flex-1 flex-col items-center gap-1">
                        <div className={`h-1.5 w-full rounded-full transition-colors ${active ? "bg-primary-500" : "bg-gray-200"}`} />
                        <span className={`text-[10px] ${active ? "font-medium text-primary-600" : "text-gray-400"}`}>
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
