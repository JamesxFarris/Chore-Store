import { useState, useEffect } from "react";
import { choreInstanceApi } from "../../api/chores.js";
import { submissionApi } from "../../api/submissions.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Modal } from "../../components/ui/Modal.js";
import { Input } from "../../components/ui/Input.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import { getChoreEmoji } from "../../lib/chore-emoji.js";
import type { ChoreInstance } from "@chore-store/shared";
import toast from "react-hot-toast";

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
        <h1 className="font-display text-2xl font-bold text-white">My Chores Today</h1>
        <SkeletonList count={3} />
      </div>
    );
  }

  const completed = chores.filter((c) => c.status === "APPROVED").length;
  const total = chores.length;
  const allDone = total > 0 && completed === total;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-white">My Chores Today</h1>

      {/* Progress bar card */}
      {total > 0 && (
        <Card variant="child">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm font-semibold text-gray-700">Daily Progress</span>
            <span className="text-sm font-bold text-green-600">{pct}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {allDone && (
            <div className="mt-3 text-center animate-bounce-in">
              <span className="text-3xl">🎉</span>
              <p className="mt-1 font-display text-sm font-semibold text-green-600">All chores done! Great job!</p>
            </div>
          )}
        </Card>
      )}

      {chores.length === 0 ? (
        <EmptyState
          variant="child"
          icon={<span className="text-3xl">🌟</span>}
          title="No chores today!"
          description="Enjoy your free time!"
        />
      ) : (
        <div className="space-y-3">
          {chores.map((chore) => {
            const isApproved = chore.status === "APPROVED";
            const isSubmitted = chore.status === "SUBMITTED";
            const isDenied = chore.status === "DENIED";
            const title = (chore as any).template?.title || "Chore";

            return (
              <Card key={chore.id} variant={isApproved ? "child-completed" : "child"} className="animate-slide-up">
                <div className="flex items-center gap-3">
                  {/* Emoji icon */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                    {getChoreEmoji(title)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold text-gray-900">{title}</div>
                    {(chore as any).template?.description && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {(chore as any).template.description}
                      </p>
                    )}
                    <div className="mt-1">
                      <StarPoints value={(chore as any).template?.points || 0} size="sm" />
                    </div>
                    {(chore as any).verification?.message && (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 italic">
                        Feedback: {(chore as any).verification.message}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {chore.status === "TODO" && (
                      <Button variant="child-primary" size="sm" onClick={() => setSubmitId(chore.id)}>
                        Done!
                      </Button>
                    )}
                    {isSubmitted && (
                      <Badge color="yellow" size="lg">Waiting</Badge>
                    )}
                    {isDenied && (
                      <Badge color="red" size="lg">Redo</Badge>
                    )}
                    {isApproved && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white animate-bounce-in">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
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
