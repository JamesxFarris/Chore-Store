import { useState, useEffect } from "react";
import { childrenApi } from "../../api/children.js";
import { pointsApi } from "../../api/points.js";
import { createChildSchema, updateChildSchema } from "@chore-store/shared";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { Modal } from "../../components/ui/Modal.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import type { Child } from "@chore-store/shared";
import toast from "react-hot-toast";

const AVATAR_OPTIONS = ["🦊", "🐱", "🐶", "🐰", "🐼", "🦁", "🐸", "🐵", "🦄", "🐨", "🐯", "🐮"];

export function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);

  const load = async () => {
    try {
      const data = await childrenApi.list();
      setChildren(data);
      // Load balances
      const results = await Promise.all(
        data.map((c) => pointsApi.balance(c.id).then((b) => ({ id: c.id, balance: b.balance })).catch(() => ({ id: c.id, balance: 0 })))
      );
      const map: Record<string, number> = {};
      results.forEach((r) => { map[r.id] = r.balance; });
      setBalances(map);
    } catch (err: any) {
      toast.error(err.message || "Failed to load children");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Children" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Children"
        subtitle={`${children.length} child${children.length !== 1 ? "ren" : ""} in your household`}
        action={<Button onClick={() => setShowForm(true)}>Add Child</Button>}
      />

      {children.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">👶</span>}
          title="No children yet"
          description="Add your first child to get started with chores and rewards."
          action={<Button onClick={() => setShowForm(true)}>Add Child</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id} variant="interactive" onClick={() => setEditChild(child)}>
              <div className="flex items-center gap-4">
                <Avatar name={child.name} avatar={child.avatar} size="xl" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">{child.name}</div>
                  <div className="mt-0.5">
                    <StarPoints value={balances[child.id] ?? 0} size="sm" />
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    Added {new Date(child.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Child">
        <ChildForm
          onSuccess={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <Modal open={!!editChild} onClose={() => setEditChild(null)} title="Edit Child">
        {editChild && (
          <EditChildForm
            child={editChild}
            onSuccess={() => {
              setEditChild(null);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function ChildForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createChildSchema.safeParse({ name, pin, avatar });
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
      await childrenApi.create(result.data);
      toast.success("Child added!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to add child");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Child's name"
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${avatar === emoji ? "bg-primary-100 ring-2 ring-primary-500 scale-110" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <Input
        label="PIN (4 digits)"
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        error={errors.pin}
        placeholder="e.g. 1234"
      />
      <Button type="submit" loading={loading} className="w-full">
        Add Child
      </Button>
    </form>
  );
}

function EditChildForm({ child, onSuccess }: { child: Child; onSuccess: () => void }) {
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState<string | null>(child.avatar);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: any = {};
    if (name !== child.name) payload.name = name;
    if (avatar !== child.avatar) payload.avatar = avatar;
    if (pin) payload.pin = pin;

    const result = updateChildSchema.safeParse(payload);
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
      await childrenApi.update(child.id, result.data);
      toast.success("Child updated!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update child");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${avatar === emoji ? "bg-primary-100 ring-2 ring-primary-500 scale-110" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <Input
        label="New PIN (leave blank to keep current)"
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        error={errors.pin}
        placeholder="New 4-digit PIN"
      />
      <Button type="submit" loading={loading} className="w-full">
        Save Changes
      </Button>
    </form>
  );
}
