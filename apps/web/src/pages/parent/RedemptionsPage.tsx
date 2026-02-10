import { useState, useEffect } from "react";
import { redemptionApi } from "../../api/redemptions.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { SkeletonList } from "../../components/ui/Skeleton.js";
import toast from "react-hot-toast";

const statusColors = {
  REQUESTED: "yellow",
  APPROVED: "blue",
  DELIVERED: "green",
} as const;

const tabs = ["All", "Requested", "Approved", "Delivered"] as const;
const tabFilter: Record<string, string | null> = { All: null, Requested: "REQUESTED", Approved: "APPROVED", Delivered: "DELIVERED" };

export function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");

  const load = async () => {
    try {
      setRedemptions(await redemptionApi.list());
    } catch (err: any) {
      toast.error(err.message || "Failed to load redemptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await redemptionApi.updateStatus(id, status);
      toast.success(`Redemption ${status.toLowerCase()}`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update redemption");
    }
  };

  const filtered = tabFilter[activeTab]
    ? redemptions.filter((r) => r.status === tabFilter[activeTab])
    : redemptions;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Redemptions" />
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Redemptions" subtitle={`${redemptions.length} total redemption${redemptions.length !== 1 ? "s" : ""}`} />

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1.5 text-xs text-gray-400">
                {redemptions.filter((r) => r.status === tabFilter[tab]).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<span className="text-3xl">🛍️</span>}
          title={activeTab === "All" ? "No redemptions yet" : `No ${activeTab.toLowerCase()} redemptions`}
          description="Children will request rewards here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {r.child && <Avatar name={r.child.name} avatar={r.child.avatar} size="sm" />}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{r.reward?.name}</div>
                  <div className="text-sm text-gray-500">
                    {r.child?.name} &middot; <span className="font-medium text-points-600">{r.reward?.pointCost} pts</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge color={statusColors[r.status as keyof typeof statusColors] || "gray"}>
                  {r.status}
                </Badge>
                {r.status === "REQUESTED" && (
                  <Button size="sm" variant="success" onClick={() => handleUpdate(r.id, "APPROVED")}>
                    Approve
                  </Button>
                )}
                {r.status === "APPROVED" && (
                  <Button size="sm" onClick={() => handleUpdate(r.id, "DELIVERED")}>
                    Delivered
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
