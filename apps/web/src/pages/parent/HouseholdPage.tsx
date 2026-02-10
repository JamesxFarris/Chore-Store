import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { householdApi } from "../../api/household.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import { PageHeader } from "../../components/ui/PageHeader.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { Badge } from "../../components/ui/Badge.js";
import { useHousehold } from "../../context/HouseholdContext.js";
import toast from "react-hot-toast";

export function HouseholdPage() {
  const { parent, refreshParent } = useAuth();
  const { household, refresh } = useHousehold();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const hasHousehold = parent?.households?.length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await householdApi.create({ name });
      await refreshParent();
      await refresh();
      toast.success("Household created!");
      navigate("/parent/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create household");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await householdApi.join({ inviteCode });
      await refreshParent();
      await refresh();
      toast.success("Joined household!");
      navigate("/parent/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to join household");
    } finally {
      setLoading(false);
    }
  };

  if (hasHousehold && household) {
    return (
      <div className="space-y-6">
        <PageHeader title="Household" subtitle={household.name} />

        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Invite Code</h3>
              <div className="mt-2 flex items-center gap-3">
                <code className="rounded-xl bg-gray-100 px-4 py-2.5 text-lg font-mono font-bold tracking-[0.2em] text-gray-900">
                  {household.inviteCode}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(household.inviteCode);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Share this code with other parents to join, or use it for child login.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Members</h3>
              <div className="mt-2 space-y-2">
                {household.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                    <Avatar name={m.user.name || m.user.email} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                      <p className="text-xs text-gray-500">{m.user.email}</p>
                    </div>
                    <Badge color="indigo">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Children</h3>
              {household.children.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">No children yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {household.children.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                      <Avatar name={c.name} avatar={c.avatar} size="sm" />
                      <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-6 text-center">
          <span className="text-4xl">🏠</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Set Up Your Household</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new household or join an existing one</p>
        </div>
        <Card variant="elevated" className="p-8">
          <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${mode === "create" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              onClick={() => setMode("create")}
            >
              Create New
            </button>
            <button
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${mode === "join" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              onClick={() => setMode("join")}
            >
              Join Existing
            </button>
          </div>

          {mode === "create" ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Household Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Smith Family"
              />
              <Button type="submit" loading={loading} className="w-full">
                Create Household
              </Button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                label="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="text-center font-mono tracking-widest"
              />
              <Button type="submit" loading={loading} className="w-full">
                Join Household
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
