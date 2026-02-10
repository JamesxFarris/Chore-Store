import { useState, useEffect } from "react";
import { choreTemplateApi, choreInstanceApi } from "../../api/chores.js";
import { childrenApi } from "../../api/children.js";
import { createChoreTemplateSchema, updateChoreTemplateSchema } from "@chore-store/shared";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { Modal } from "../../components/ui/Modal.js";
import { Badge } from "../../components/ui/Badge.js";
import { Select } from "../../components/ui/Select.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import type { ChoreTemplate, Child } from "@chore-store/shared";
import toast from "react-hot-toast";

const recurrenceColors = { NONE: "gray", DAILY: "indigo", WEEKLY: "purple" } as const;
const recurrenceLabels = { NONE: "One-time", DAILY: "Daily", WEEKLY: "Weekly" } as const;

export function ChoresPage() {
  const [templates, setTemplates] = useState<ChoreTemplate[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ChoreTemplate | null>(null);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ChoreTemplate | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const load = async () => {
    try {
      const [t, c] = await Promise.all([
        choreTemplateApi.list(),
        childrenApi.list(),
      ]);
      setTemplates(t);
      setChildren(c);
    } catch (err: any) {
      toast.error(err.message || "Failed to load chores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await choreTemplateApi.update(deactivateTarget.id, { isActive: !deactivateTarget.isActive });
      toast.success(deactivateTarget.isActive ? "Chore deactivated" : "Chore activated");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update chore");
    } finally {
      setDeactivating(false);
      setDeactivateTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Chore Templates" />
        <SkeletonList count={4} />
      </div>
    );
  }

  const active = templates.filter((t) => t.isActive);
  const inactive = templates.filter((t) => !t.isActive);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chore Templates"
        subtitle={`${active.length} active template${active.length !== 1 ? "s" : ""}`}
        action={<Button onClick={() => setShowForm(true)}>Create Chore</Button>}
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">📋</span>}
          title="No chores yet"
          description="Create your first chore template to assign to children."
          action={<Button onClick={() => setShowForm(true)}>Create Chore</Button>}
        />
      ) : (
        <>
          <div className="space-y-3">
            {active.map((t) => (
              <Card key={t.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{t.title}</span>
                    <Badge color={recurrenceColors[t.recurrence as keyof typeof recurrenceColors]}>
                      {recurrenceLabels[t.recurrence as keyof typeof recurrenceLabels]}
                    </Badge>
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm text-gray-500">{t.description}</p>
                  )}
                  <div className="mt-1 text-sm font-bold text-points-600">
                    {t.points} points
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <Button variant="secondary" size="sm" onClick={() => setEditTemplate(t)}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowAssign(t.id)}>
                    Assign
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeactivateTarget(t)}>
                    Deactivate
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {inactive.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Inactive</h2>
              <div className="space-y-3 opacity-60">
                {inactive.map((t) => (
                  <Card key={t.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{t.title}</span>
                        <Badge color="red">Inactive</Badge>
                      </div>
                      <div className="mt-1 text-sm font-bold text-points-600">{t.points} points</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setDeactivateTarget(t)}>
                      Activate
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Chore">
        <ChoreForm onSuccess={() => { setShowForm(false); load(); }} />
      </Modal>

      <Modal open={!!editTemplate} onClose={() => setEditTemplate(null)} title="Edit Chore">
        {editTemplate && (
          <EditChoreForm template={editTemplate} onSuccess={() => { setEditTemplate(null); load(); }} />
        )}
      </Modal>

      <Modal open={!!showAssign} onClose={() => setShowAssign(null)} title="Assign Chore">
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

      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title={deactivateTarget?.isActive ? "Deactivate Chore" : "Activate Chore"}
        message={deactivateTarget?.isActive
          ? `Are you sure you want to deactivate "${deactivateTarget?.title}"? It won't generate new instances.`
          : `Activate "${deactivateTarget?.title}"?`
        }
        confirmLabel={deactivateTarget?.isActive ? "Deactivate" : "Activate"}
        variant={deactivateTarget?.isActive ? "danger" : "primary"}
        loading={deactivating}
      />
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
      toast.error(err.message || "Failed to create chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Make your bed" />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be done?" />
      <Input label="Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} error={errors.points} placeholder="e.g. 10" />
      <Select label="Recurrence" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
        <option value="NONE">One-time</option>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
      </Select>
      <Button type="submit" loading={loading} className="w-full">Create</Button>
    </form>
  );
}

function EditChoreForm({ template, onSuccess }: { template: ChoreTemplate; onSuccess: () => void }) {
  const [title, setTitle] = useState(template.title);
  const [description, setDescription] = useState(template.description || "");
  const [points, setPoints] = useState(String(template.points));
  const [recurrence, setRecurrence] = useState(template.recurrence);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = updateChoreTemplateSchema.safeParse({
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
      await choreTemplateApi.update(template.id, result.data);
      toast.success("Chore updated!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
      <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} error={errors.points} />
      <Select label="Recurrence" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
        <option value="NONE">One-time</option>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
      </Select>
      <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
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
      toast.error(err.message || "Failed to assign chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Child" value={childId} onChange={(e) => setChildId(e.target.value)}>
        {children.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>
      <Button type="submit" loading={loading} className="w-full">Assign</Button>
    </form>
  );
}
