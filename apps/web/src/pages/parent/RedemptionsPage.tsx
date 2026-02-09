import { useState, useEffect } from "react";
import { redemptionApi } from "../../api/redemptions.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { Spinner } from "../../components/ui/Spinner.js";
import toast from "react-hot-toast";

const statusColors = {
  REQUESTED: "yellow",
  APPROVED: "blue",
  DELIVERED: "green",
} as const;

export function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setRedemptions(await redemptionApi.list());
    } catch {
      // ignore
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
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Redemptions</h1>

      {redemptions.length === 0 ? (
        <EmptyState title="No redemptions yet" description="Children will request rewards here." />
      ) : (
        <div className="space-y-3">
          {redemptions.map((r: any) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.reward?.name}</div>
                <div className="text-sm text-gray-500">
                  by {r.child?.name} &middot; {r.reward?.pointCost} points
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={statusColors[r.status as keyof typeof statusColors] || "gray"}>
                  {r.status}
                </Badge>
                {r.status === "REQUESTED" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="success" onClick={() => handleUpdate(r.id, "APPROVED")}>
                      Approve
                    </Button>
                  </div>
                )}
                {r.status === "APPROVED" && (
                  <Button size="sm" onClick={() => handleUpdate(r.id, "DELIVERED")}>
                    Mark Delivered
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
