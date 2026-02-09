import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { verificationApi } from "../../api/verifications.js";
import { redemptionApi } from "../../api/redemptions.js";
import { choreInstanceApi } from "../../api/chores.js";
import { useHousehold } from "../../context/HouseholdContext.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Spinner } from "../../components/ui/Spinner.js";
import type { ChoreInstance, Redemption } from "@chore-store/shared";

export function DashboardPage() {
  const { household } = useHousehold();
  const [pending, setPending] = useState<ChoreInstance[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [todayChores, setTodayChores] = useState<ChoreInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household) return;
    // Generate instances then load dashboard data
    choreInstanceApi.generate().then(() =>
      Promise.all([
        verificationApi.pending(),
        redemptionApi.list(),
        choreInstanceApi.list(),
      ]).then(([p, r, c]) => {
        setPending(p);
        setRedemptions(r.filter((x: any) => x.status === "REQUESTED"));
        setTodayChores(c);
        setLoading(false);
      }),
    ).catch(() => setLoading(false));
  }, [household]);

  if (loading) return <Spinner />;

  if (!household) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">No Household Yet</h2>
        <p className="mt-2 text-gray-500">
          <Link to="/parent/household" className="text-primary-600 hover:underline">
            Create or join a household
          </Link>{" "}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/parent/chores">
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Today's Chores</div>
            <div className="mt-1 text-3xl font-bold">{todayChores.length}</div>
            <div className="mt-1 text-xs text-gray-400">
              {todayChores.filter((c) => c.status === "APPROVED").length} completed
            </div>
          </Card>
        </Link>

        <Link to="/parent/dashboard">
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Pending Verifications</div>
            <div className="mt-1 text-3xl font-bold text-orange-600">
              {pending.length}
            </div>
            <div className="mt-1 text-xs text-gray-400">awaiting your review</div>
          </Card>
        </Link>

        <Link to="/parent/redemptions">
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Reward Requests</div>
            <div className="mt-1 text-3xl font-bold text-purple-600">
              {redemptions.length}
            </div>
            <div className="mt-1 text-xs text-gray-400">waiting to be fulfilled</div>
          </Card>
        </Link>
      </div>

      {/* Pending verifications inline */}
      {pending.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Awaiting Verification</h2>
          <div className="space-y-3">
            {pending.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <div className="font-medium">{item.template?.title}</div>
                  <div className="text-sm text-gray-500">
                    by {item.assignedChild?.name}
                  </div>
                  {item.submission?.note && (
                    <div className="mt-1 text-xs text-gray-400">
                      "{item.submission.note}"
                    </div>
                  )}
                </div>
                <Badge color="yellow">Submitted</Badge>
              </div>
            ))}
          </div>
          <VerificationActions pending={pending} onUpdate={setPending} />
        </Card>
      )}
    </div>
  );
}

function VerificationActions({
  pending,
  onUpdate,
}: {
  pending: ChoreInstance[];
  onUpdate: (items: ChoreInstance[]) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleVerify = async (id: string, status: "APPROVED" | "DENIED") => {
    setLoading(id);
    try {
      await verificationApi.verify(id, { status });
      onUpdate(pending.filter((p) => p.id !== id));
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {pending.map((item) => (
        <div key={item.id} className="flex gap-2">
          <button
            disabled={loading === item.id}
            onClick={() => handleVerify(item.id, "APPROVED")}
            className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
          >
            Approve {(item as any).template?.title}
          </button>
          <button
            disabled={loading === item.id}
            onClick={() => handleVerify(item.id, "DENIED")}
            className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            Deny
          </button>
        </div>
      ))}
    </div>
  );
}
