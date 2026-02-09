import { useState, useEffect } from "react";
import { childrenApi } from "../../api/children.js";
import { createChildSchema } from "@chore-store/shared";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { Modal } from "../../components/ui/Modal.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { Child } from "@chore-store/shared";
import toast from "react-hot-toast";

export function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const data = await childrenApi.list();
      setChildren(data);
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
        <h1 className="text-2xl font-bold">Children</h1>
        <Button onClick={() => setShowForm(true)}>Add Child</Button>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="No children yet"
          description="Add your first child to get started with chores."
          action={<Button onClick={() => setShowForm(true)}>Add Child</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                  {child.avatar || child.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{child.name}</div>
                  <div className="text-xs text-gray-400">
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
    </div>
  );
}

function ChildForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createChildSchema.safeParse({ name, pin });
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
      toast.error(err.message);
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
