import { useState, useEffect } from "react";
import { choreInstanceApi } from "../../api/chores.js";
import { submissionApi } from "../../api/submissions.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Modal } from "../../components/ui/Modal.js";
import { Input } from "../../components/ui/Input.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import type { ChoreInstance } from "@chore-store/shared";
import toast from "react-hot-toast";

const statusConfig = {
  TODO: { color: "blue" as const, label: "To Do", step: 1 },
  SUBMITTED: { color: "yellow" as const, label: "Submitted", step: 2 },
  APPROVED: { color: "green" as const, label: "Approved", step: 3 },
  DENIED: { color: "red" as const, label: "Denied", step: 0 },
};

export function MyChoresPage() {
  const [chores, setChores] = useState<ChoreInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState<string | null>(null);

  const load = async () => {
    try {
      setChores(await choreInstanceApi.myChores());
    } catch (err: any) {
      toast.error(err.message || "Failed to load chores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Chores Today" />
        <SkeletonList count={3} />
      </div>
    );
  }

  const completed = chores.filter((c) => c.status === "APPROVED").length;
  const total = chores.length;
  const allDone = total > 0 && completed === total;

  return (
    <div className="space-y-6">
      <PageHeader title="My Chores Today" subtitle={total > 0 ? `${completed} of ${total} done` : undefined} />

      {/* Progress bar */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
          {allDone && (
            <div className="rounded-2xl bg-accent-50 p-4 text-center animate-scale-in">
              <span className="text-2xl">🎉</span>
              <p className="mt-1 text-sm font-semibold text-accent-700">All chores done! Great job!</p>
            </div>
          )}
        </div>
      )}

      {chores.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">🌟</span>}
          title="No chores today!"
          description="Enjoy your free time!"
        />
      ) : (
        <div className="space-y-3">
          {chores.map((chore) => {
            const config = statusConfig[chore.status as keyof typeof statusConfig] || statusConfig.TODO;
            return (
              <Card key={chore.id} className="animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{(chore as any).template?.title}</span>
                      <Badge color={config.color}>{config.label}</Badge>
                    </div>
                    {(chore as any).template?.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {(chore as any).template.description}
                      </p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-points-50 px-2.5 py-1 text-sm font-bold text-points-700">
                      {(chore as any).template?.points} pts
                    </div>
                    {(chore as any).verification?.message && (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 italic">
                        Feedback: {(chore as any).verification.message}
                      </p>
                    )}
                  </div>
                  {chore.status === "TODO" && (
                    <Button size="sm" onClick={() => setSubmitId(chore.id)} className="shrink-0 ml-3">
                      Submit
                    </Button>
                  )}
                  {chore.status === "APPROVED" && (
                    <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!submitId} onClose={() => setSubmitId(null)} title="Submit Chore">
        {submitId && (
          <SubmitForm
            choreInstanceId={submitId}
            onSuccess={() => {
              setSubmitId(null);
              // Optimistic: update status locally
              setChores((prev) =>
                prev.map((c) =>
                  c.id === submitId ? { ...c, status: "SUBMITTED" as any } : c
                )
              );
              toast.success("Chore submitted!");
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function SubmitForm({
  choreInstanceId,
  onSuccess,
}: {
  choreInstanceId: string;
  onSuccess: () => void;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submissionApi.create(choreInstanceId, { note: note || null });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="How did it go?"
      />
      <Button type="submit" loading={loading} className="w-full">
        Submit
      </Button>
    </form>
  );
}
