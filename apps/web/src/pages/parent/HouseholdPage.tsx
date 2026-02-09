import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { householdApi } from "../../api/household.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
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
      toast.error(err.message);
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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasHousehold && household) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Household</h1>
        <Card>
          <h2 className="text-lg font-semibold">{household.name}</h2>
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-sm text-gray-500">Invite Code:</span>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded bg-gray-100 px-3 py-1 text-lg font-mono font-bold tracking-wider">
                  {household.inviteCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(household.inviteCode);
                    toast.success("Copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Share this code with other parents to join, or use it for child login.
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Members:</span>
              <ul className="mt-1 space-y-1">
                {household.members.map((m) => (
                  <li key={m.id} className="text-sm">
                    {m.user.name} ({m.user.email}) - {m.role}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-sm text-gray-500">Children:</span>
              {household.children.length === 0 ? (
                <p className="mt-1 text-sm text-gray-400">No children yet.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {household.children.map((c) => (
                    <li key={c.id} className="text-sm">{c.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Set Up Your Household</h1>

        <div className="mb-6 flex rounded-lg border border-gray-200">
          <button
            className={`flex-1 rounded-l-lg py-2 text-sm font-medium ${mode === "create" ? "bg-primary-600 text-white" : "text-gray-600"}`}
            onClick={() => setMode("create")}
          >
            Create New
          </button>
          <button
            className={`flex-1 rounded-r-lg py-2 text-sm font-medium ${mode === "join" ? "bg-primary-600 text-white" : "text-gray-600"}`}
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
            />
            <Button type="submit" loading={loading} className="w-full">
              Join Household
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
