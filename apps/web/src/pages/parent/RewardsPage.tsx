import { useState, useEffect } from "react";
import { rewardApi } from "../../api/rewards.js";
import { createRewardSchema, updateRewardSchema } from "@chore-store/shared";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { Modal } from "../../components/ui/Modal.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import { getRewardEmoji } from "../../lib/reward-emoji.js";
import type { Reward } from "@chore-store/shared";
import toast from "react-hot-toast";

export function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Reward | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setRewards(await rewardApi.list());
    } catch (err: any) {
      toast.error(err.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await rewardApi.update(toggleTarget.id, { isActive: !toggleTarget.isActive });
      toast.success(toggleTarget.isActive ? "Reward deactivated" : "Reward activated");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update reward");
    } finally {
      setToggling(false);
      setToggleTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await rewardApi.delete(deleteTarget.id);
      toast.success("Reward deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete reward");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Manage Rewards" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Rewards"
        subtitle={`${rewards.filter(r => r.isActive).length} active reward${rewards.filter(r => r.isActive).length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setShowForm(true)}>Add Reward</Button>}
      />

      {rewards.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">🎁</span>}
          title="No rewards yet"
          description="Create rewards for children to redeem with their points."
          action={<Button onClick={() => setShowForm(true)}>Add Reward</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => (
            <Card key={r.id} className={!r.isActive ? "opacity-60" : ""}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getRewardEmoji(r.name)}</span>
                    <span className="font-semibold text-gray-900">{r.name}</span>
                    {!r.isActive && <Badge color="red">Inactive</Badge>}
                  </div>
                  {r.description && (
                    <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                  )}
                  <div className="mt-3">
                    <StarPoints value={r.pointCost} size="md" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <Button variant="ghost" size="sm" onClick={() => setEditReward(r)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setToggleTarget(r)}>
                  {r.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r)} className="text-red-600 hover:bg-red-50">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Reward">
        <RewardForm onSuccess={() => { setShowForm(false); load(); }} />
      </Modal>

      <Modal open={!!editReward} onClose={() => setEditReward(null)} title="Edit Reward">
        {editReward && <EditRewardForm reward={editReward} onSuccess={() => { setEditReward(null); load(); }} />}
      </Modal>

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.isActive ? "Deactivate Reward" : "Activate Reward"}
        message={toggleTarget?.isActive ? `Deactivate "${toggleTarget.name}"? Children won't see it in the shop.` : `Activate "${toggleTarget?.name}"?`}
        confirmLabel={toggleTarget?.isActive ? "Deactivate" : "Activate"}
        variant={toggleTarget?.isActive ? "danger" : "primary"}
        loading={toggling}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Reward"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
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
      toast.error(err.message || "Failed to create reward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Extra screen time" />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do they get?" />
      <Input label="Point Cost" type="number" value={pointCost} onChange={(e) => setPointCost(e.target.value)} error={errors.pointCost} placeholder="e.g. 50" />
      <Button type="submit" loading={loading} className="w-full">Create</Button>
    </form>
  );
}

function EditRewardForm({ reward, onSuccess }: { reward: Reward; onSuccess: () => void }) {
  const [name, setName] = useState(reward.name);
  const [description, setDescription] = useState(reward.description || "");
  const [pointCost, setPointCost] = useState(String(reward.pointCost));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = updateRewardSchema.safeParse({
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
      await rewardApi.update(reward.id, result.data);
      toast.success("Reward updated!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update reward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Point Cost" type="number" value={pointCost} onChange={(e) => setPointCost(e.target.value)} error={errors.pointCost} />
      <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
    </form>
  );
}
