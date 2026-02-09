import { useState, useEffect } from "react";
import { rewardApi } from "../../api/rewards.js";
import { redemptionApi } from "../../api/redemptions.js";
import { pointsApi } from "../../api/points.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { Reward } from "@chore-store/shared";
import toast from "react-hot-toast";

export function ShopPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([rewardApi.shop(), pointsApi.balance()])
      .then(([r, b]) => {
        setRewards(r);
        setBalance(b.balance);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      await redemptionApi.create(rewardId);
      toast.success("Reward redeemed!");
      const b = await pointsApi.balance();
      setBalance(b.balance);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reward Shop</h1>
        <span className="rounded-full bg-yellow-100 px-4 py-1 text-sm font-bold text-yellow-800">
          Balance: {balance} pts
        </span>
      </div>

      {rewards.length === 0 ? (
        <EmptyState title="No rewards available" description="Check back later!" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((r) => (
            <Card key={r.id}>
              <div className="font-semibold">{r.name}</div>
              {r.description && (
                <p className="mt-1 text-sm text-gray-500">{r.description}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-yellow-600">
                  {r.pointCost} pts
                </span>
                <Button
                  size="sm"
                  loading={redeeming === r.id}
                  disabled={balance < r.pointCost}
                  onClick={() => handleRedeem(r.id)}
                >
                  {balance < r.pointCost ? "Not enough" : "Redeem"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
