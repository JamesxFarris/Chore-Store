import { useState, useEffect } from "react";
import { choreTemplateApi, choreInstanceApi } from "../../api/chores.js";
import { childrenApi } from "../../api/children.js";
import { createChoreTemplateSchema } from "@chore-store/shared";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { Modal } from "../../components/ui/Modal.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { ChoreTemplate, Child } from "@chore-store/shared";
import toast from "react-hot-toast";

const recurrenceColors = { NONE: "gray", DAILY: "blue", WEEKLY: "purple" } as const;

export function ChoresPage() {
  const [templates, setTemplates] = useState<ChoreTemplate[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);

  const load = async () => {
    try {
      const [t, c] = await Promise.all([
        choreTemplateApi.list(),
        childrenApi.list(),
      ]);
      setTemplates(t);
      setChildren(c);
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
        <h1 className="text-2xl font-bold">Chore Templates</h1>
        <Button onClick={() => setShowForm(true)}>Create Chore</Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          title="No chores yet"
          description="Create your first chore template."
          action={<Button onClick={() => setShowForm(true)}>Create Chore</Button>}
        />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.title}</span>
                  <Badge color={recurrenceColors[t.recurrence as keyof typeof recurrenceColors]}>
                    {t.recurrence}
                  </Badge>
                  {!t.isActive && <Badge color="red">Inactive</Badge>}
                </div>
                {t.description && (
                  <p className="mt-1 text-sm text-gray-500">{t.description}</p>
                )}
                <div className="mt-1 text-sm font-medium text-yellow-600">
                  {t.points} points
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAssign(t.id)}
                >
                  Assign
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await choreTemplateApi.delete(t.id);
                    toast.success("Chore deactivated");
                    load();
                  }}
                >
                  Deactivate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Chore">
        <ChoreForm onSuccess={() => { setShowForm(false); load(); }} />
      </Modal>

      <Modal
        open={!!showAssign}
        onClose={() => setShowAssign(null)}
        title="Assign Chore"
      >
        {showAssign && (
          <AssignForm
            templateId={showAssign}
            children={children}
            onSuccess={() => {
              setShowAssign(null);
              toast.success("Chore assigned!");
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function ChoreForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [recurrence, setRecurrence] = useState("NONE");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createChoreTemplateSchema.safeParse({
      title,
      description: description || null,
      points: Number(points),
      recurrence,
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
      await choreTemplateApi.create(result.data);
      toast.success("Chore created!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} error={errors.points} />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Recurrence</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="NONE">One-time</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
        </select>
      </div>
      <Button type="submit" loading={loading} className="w-full">Create</Button>
    </form>
  );
}

function AssignForm({
  templateId,
  children,
  onSuccess,
}: {
  templateId: string;
  children: Child[];
  onSuccess: () => void;
}) {
  const [childId, setChildId] = useState(children[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await choreInstanceApi.create({ templateId, childId });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Child</label>
        <select
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <Button type="submit" loading={loading} className="w-full">Assign</Button>
    </form>
  );
}
