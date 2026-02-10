import { useState, useEffect } from "react";
import { rewardApi } from "../../api/rewards.js";
import { redemptionApi } from "../../api/redemptions.js";
import { pointsApi } from "../../api/points.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import type { Reward } from "@chore-store/shared";
import toast from "react-hot-toast";

export function ShopPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    Promise.all([rewardApi.shop(), pointsApi.balance()])
      .then(([r, b]) => {
        setRewards(r);
        setBalance(b.balance);
      })
      .catch((err) => toast.error(err.message || "Failed to load shop"))
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async () => {
    if (!redeemTarget) return;
    setRedeeming(true);
    try {
      await redemptionApi.create(redeemTarget.id);
      toast.success("Reward redeemed! Ask your parent to deliver it.");
      // Optimistic update
      setBalance((prev) => prev - redeemTarget.pointCost);
      setRedeemTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to redeem reward");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reward Shop" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward Shop"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-points-100 px-4 py-2 text-sm font-bold text-points-700">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.38 5.38 0 01-.491-.921h2.755a1 1 0 100-2H8.003a7.36 7.36 0 010-1h3.997a1 1 0 100-2H8.245c.13-.332.3-.647.491-.921z" />
            </svg>
            {balance} pts
          </span>
        }
      />

      {rewards.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">🏪</span>}
          title="No rewards available"
          description="Check back later for new rewards!"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((r) => {
            const canAfford = balance >= r.pointCost;
            const progress = Math.min((balance / r.pointCost) * 100, 100);
            const remaining = r.pointCost - balance;

            return (
              <Card key={r.id}>
                <div className="font-semibold text-gray-900">{r.name}</div>
                {r.description && (
                  <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                )}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-points-600">{r.pointCost} pts</span>
                    {!canAfford && (
                      <span className="text-xs text-gray-400">{remaining} more needed</span>
                    )}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${canAfford ? "bg-accent-500" : "bg-points-400"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!canAfford}
                    onClick={() => setRedeemTarget(r)}
                  >
                    {canAfford ? "Redeem" : `${remaining} more pts needed`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!redeemTarget}
        onClose={() => setRedeemTarget(null)}
        onConfirm={handleRedeem}
        title="Redeem Reward"
        message={`Redeem "${redeemTarget?.name}" for ${redeemTarget?.pointCost} points? You'll have ${balance - (redeemTarget?.pointCost || 0)} points left.`}
        confirmLabel="Redeem"
        variant="primary"
        loading={redeeming}
      />
    </div>
  );
}
