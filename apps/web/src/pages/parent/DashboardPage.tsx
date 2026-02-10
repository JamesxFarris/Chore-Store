import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { verificationApi } from "../../api/verifications.js";
import { redemptionApi } from "../../api/redemptions.js";
import { choreInstanceApi } from "../../api/chores.js";
import { pointsApi } from "../../api/points.js";
import { useHousehold } from "../../context/HouseholdContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Button } from "../../components/ui/Button.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { StatCard } from "../../components/ui/StatCard.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { StarPoints } from "../../components/ui/StarPoints.js";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog.js";
import { SkeletonCard, SkeletonList } from "../../components/ui/Skeleton.js";
import type { ChoreInstance, Redemption } from "@chore-store/shared";
import toast from "react-hot-toast";

export function DashboardPage() {
  const { household } = useHousehold();
  const { parent } = useAuth();
  const [pending, setPending] = useState<ChoreInstance[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [todayChores, setTodayChores] = useState<ChoreInstance[]>([]);
  const [childBalances, setChildBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [denyTarget, setDenyTarget] = useState<ChoreInstance | null>(null);

  useEffect(() => {
    if (!household) {
      setLoading(false);
      return;
    }
    choreInstanceApi.generate().then(() =>
      Promise.all([
        verificationApi.pending(),
        redemptionApi.list(),
        choreInstanceApi.list(),
      ]).then(([p, r, c]) => {
        setPending(p);
        setRedemptions(r.filter((x: any) => x.status === "REQUESTED"));
        setTodayChores(c);
      }),
    ).catch((err) => toast.error(err.message || "Failed to load dashboard"))
    .finally(() => setLoading(false));

    // Load child balances
    if (household.children.length > 0) {
      Promise.all(
        household.children.map((c) =>
          pointsApi.balance(c.id).then((b) => ({ id: c.id, balance: b.balance }))
        )
      ).then((results) => {
        const map: Record<string, number> = {};
        results.forEach((r) => { map[r.id] = r.balance; });
        setChildBalances(map);
      }).catch(() => {});
    }
  }, [household]);

  const handleVerify = async (id: string, status: "APPROVED" | "DENIED") => {
    setVerifyingId(id);
    try {
      await verificationApi.verify(id, { status });
      setPending((prev) => prev.filter((p) => p.id !== id));
      toast.success(status === "APPROVED" ? "Chore approved!" : "Chore denied");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifyingId(null);
      setDenyTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  if (!household) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={<span className="text-3xl">🏠</span>}
          title="Welcome to Chore Store!"
          description="Create a household to start managing chores and rewards for your family."
          action={
            <Link to="/parent/household">
              <Button>Create a Household</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const completedCount = todayChores.filter((c) => c.status === "APPROVED").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const parentName = parent?.name || household?.name || "";

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle={`${greeting}, ${parentName}! Here's your family's day.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Today's Chores"
          value={todayChores.length}
          subtitle={`${completedCount} completed`}
          color="indigo"
          to="/parent/chores"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />
        <StatCard
          label="Pending Verifications"
          value={pending.length}
          subtitle="awaiting your review"
          color="amber"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Reward Requests"
          value={redemptions.length}
          subtitle="waiting to be fulfilled"
          color="purple"
          to="/parent/redemptions"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>}
        />
      </div>

      {/* Child point balances */}
      {household.children.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Point Balances</h2>
          <div className="flex flex-wrap gap-4">
            {household.children.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5">
                <Avatar name={c.name} avatar={c.avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <StarPoints value={childBalances[c.id] ?? 0} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/parent/chores"><Button variant="secondary" size="sm">Manage Chores</Button></Link>
          <Link to="/parent/children"><Button variant="secondary" size="sm">Manage Children</Button></Link>
          <Link to="/parent/rewards"><Button variant="secondary" size="sm">Manage Rewards</Button></Link>
          <Link to="/parent/household"><Button variant="secondary" size="sm">Household Settings</Button></Link>
        </div>
      </Card>

      {/* Pending verifications */}
      {pending.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Awaiting Verification</h2>
          <div className="space-y-3">
            {pending.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 border-l-4 border-l-amber-400 bg-gray-50/50 p-4 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.assignedChild && <Avatar name={item.assignedChild.name} avatar={item.assignedChild.avatar} size="sm" />}
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{item.template?.title}</div>
                    <div className="text-sm text-gray-500">
                      by {item.assignedChild?.name} &middot; {item.template?.points} pts
                    </div>
                    {item.submission?.note && (
                      <div className="mt-1 text-xs text-gray-400 italic">
                        "{item.submission.note}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Button
                    size="sm"
                    variant="success"
                    loading={verifyingId === item.id}
                    onClick={() => handleVerify(item.id, "APPROVED")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={verifyingId === item.id}
                    onClick={() => setDenyTarget(item)}
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!denyTarget}
        onClose={() => setDenyTarget(null)}
        onConfirm={() => denyTarget && handleVerify(denyTarget.id, "DENIED")}
        title="Deny Chore"
        message={`Are you sure you want to deny "${(denyTarget as any)?.template?.title}"? The child will need to redo it.`}
        confirmLabel="Deny"
        variant="danger"
        loading={verifyingId === denyTarget?.id}
      />
    </div>
  );
}
