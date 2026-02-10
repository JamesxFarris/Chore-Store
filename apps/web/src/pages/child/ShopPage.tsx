import { useState, useEffect } from "react";
import { rewardApi } from "../../api/rewards.js";
import { redemptionApi } from "../../api/redemptions.js";
import { pointsApi } from "../../api/points.js";
import { Button } from "../../components/ui/Button.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import { getRewardEmoji } from "../../lib/reward-emoji.js";
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
        <h1 className="font-display text-2xl font-bold text-white">Reward Shop</h1>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Reward Shop</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-md">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {balance}
        </span>
      </div>

      {rewards.length === 0 ? (
        <EmptyState
          variant="child"
          icon={<span className="text-3xl">🏪</span>}
          title="No rewards available"
          description="Check back later for new rewards!"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {rewards.map((r) => {
            const canAfford = balance >= r.pointCost;
            const remaining = r.pointCost - balance;

            return (
              <div
                key={r.id}
                onClick={canAfford ? () => setRedeemTarget(r) : undefined}
                className={`flex flex-col items-center rounded-3xl bg-white p-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] transition-transform ${canAfford ? "cursor-pointer active:scale-95" : "opacity-60"}`}
              >
                <span className="text-4xl">{getRewardEmoji(r.name)}</span>
                <span className="mt-2 text-center font-display text-sm font-semibold text-gray-900 leading-tight">
                  {r.name}
                </span>
                <div className="mt-2">
                  <StarPoints value={r.pointCost} size="sm" />
                </div>
                {!canAfford && (
                  <span className="mt-1 text-[11px] text-gray-400">{remaining} more needed</span>
                )}
              </div>
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
