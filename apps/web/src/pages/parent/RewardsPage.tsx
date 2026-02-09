import { useState, useEffect } from "react";
import { rewardApi } from "../../api/rewards.js";
import { createRewardSchema } from "@chore-store/shared";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { Modal } from "../../components/ui/Modal.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { Reward } from "@chore-store/shared";
import toast from "react-hot-toast";

export function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setRewards(await rewardApi.list());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Rewards</h1>
        <Button onClick={() => setShowForm(true)}>Add Reward</Button>
      </div>

      {rewards.length === 0 ? (
        <EmptyState
          title="No rewards yet"
          description="Create rewards for children to redeem with their points."
          action={<Button onClick={() => setShowForm(true)}>Add Reward</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  {r.description && (
                    <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                  )}
                  <div className="mt-2 text-sm font-bold text-yellow-600">
                    {r.pointCost} points
                  </div>
                </div>
                {!r.isActive && <Badge color="red">Inactive</Badge>}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await rewardApi.update(r.id, { isActive: !r.isActive });
                    load();
                  }}
                >
                  {r.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Reward">
        <RewardForm onSuccess={() => { setShowForm(false); load(); }} />
      </Modal>
    </div>
  );
}

function RewardForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointCost, setPointCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createRewardSchema.safeParse({
      name,
      description: description || null,
      pointCost: Number(pointCost),
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await rewardApi.create(result.data);
      toast.success("Reward created!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Point Cost" type="number" value={pointCost} onChange={(e) => setPointCost(e.target.value)} error={errors.pointCost} />
      <Button type="submit" loading={loading} className="w-full">Create</Button>
    </form>
  );
}
