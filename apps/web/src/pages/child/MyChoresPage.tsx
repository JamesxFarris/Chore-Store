import { useState, useEffect } from "react";
import { choreInstanceApi } from "../../api/chores.js";
import { submissionApi } from "../../api/submissions.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Modal } from "../../components/ui/Modal.js";
import { Input } from "../../components/ui/Input.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { ChoreInstance } from "@chore-store/shared";
import toast from "react-hot-toast";

const statusColors = {
  TODO: "blue",
  SUBMITTED: "yellow",
  APPROVED: "green",
  DENIED: "red",
} as const;

export function MyChoresPage() {
  const [chores, setChores] = useState<ChoreInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState<string | null>(null);

  const load = async () => {
    try {
      setChores(await choreInstanceApi.myChores());
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
      <h1 className="text-2xl font-bold">My Chores Today</h1>

      {chores.length === 0 ? (
        <EmptyState title="No chores today!" description="Enjoy your free time!" />
      ) : (
        <div className="space-y-3">
          {chores.map((chore) => (
            <Card key={chore.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{chore.template?.title}</span>
                  <Badge color={statusColors[chore.status as keyof typeof statusColors]}>
                    {chore.status}
                  </Badge>
                </div>
                {chore.template?.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {chore.template.description}
                  </p>
                )}
                <div className="mt-1 text-sm font-medium text-yellow-600">
                  {chore.template?.points} points
                </div>
                {chore.verification?.message && (
                  <p className="mt-1 text-sm text-gray-500 italic">
                    Feedback: {chore.verification.message}
                  </p>
                )}
              </div>
              {chore.status === "TODO" && (
                <Button size="sm" onClick={() => setSubmitId(chore.id)}>
                  Submit
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!submitId}
        onClose={() => setSubmitId(null)}
        title="Submit Chore"
      >
        {submitId && (
          <SubmitForm
            choreInstanceId={submitId}
            onSuccess={() => {
              setSubmitId(null);
              load();
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
      toast.success("Chore submitted!");
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
