import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createHouseholdSchema, joinHouseholdSchema, createChildSchema } from "@chore-store/shared";
import { useAuth } from "../../context/AuthContext.js";
import { householdApi } from "../../api/household.js";
import { childrenApi } from "../../api/children.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Logo } from "../../components/brand/Logo.js";
import { AnimatedBackground } from "../../components/auth/AnimatedBackground.js";
import { AuthCard } from "../../components/auth/AuthCard.js";
import { AuthFormField } from "../../components/auth/AuthFormField.js";
import toast from "react-hot-toast";

type Step = "household" | "child" | "complete";

const AVATAR_OPTIONS = ["🦊", "🐱", "🐶", "🐰", "🐼", "🦁", "🐸", "🐵", "🦄", "🐨", "🐯", "🐮"];

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ["household", "child", "complete"];
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i <= currentIdx ? "bg-white" : "bg-white/30"
            }`}
          />
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 transition-all ${
                i < currentIdx ? "bg-white" : "bg-white/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SetupWizard() {
  const navigate = useNavigate();
  const { parent, refreshParent } = useAuth();
  const [step, setStep] = useState<Step>("household");
  const [householdData, setHouseholdData] = useState<{ name: string; inviteCode: string } | null>(null);

  // Redirect if already has a household
  useEffect(() => {
    if (parent?.households?.length) {
      navigate("/parent/dashboard", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHouseholdCreated = (data: { name: string; inviteCode: string }) => {
    setHouseholdData(data);
    setStep("child");
  };

  return (
    <AnimatedBackground variant="parent">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="xl" variant="light" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              {step === "household" && "Set up your household"}
              {step === "child" && "Add your first child"}
              {step === "complete" && "You're all set!"}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {step === "household" && "Create a new household or join an existing one"}
              {step === "child" && "You can always add more children later"}
              {step === "complete" && "Your household is ready to go"}
            </p>
            <div className="mt-4">
              <StepIndicator current={step} />
            </div>
          </div>

          {step === "household" && (
            <HouseholdStep onComplete={handleHouseholdCreated} />
          )}
          {step === "child" && (
            <ChildStep onComplete={() => setStep("complete")} onSkip={() => setStep("complete")} />
          )}
          {step === "complete" && (
            <CompleteStep householdData={householdData} />
          )}
        </div>
      </div>
    </AnimatedBackground>
  );
}

function HouseholdStep({ onComplete }: { onComplete: (data: { name: string; inviteCode: string }) => void }) {
  const { refreshParent } = useAuth();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createHouseholdSchema.safeParse({ name });
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
      const res = await householdApi.create(result.data);
      await refreshParent();
      onComplete({ name: result.data.name, inviteCode: res.inviteCode });
    } catch (err: any) {
      toast.error(err.message || "Failed to create household");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = joinHouseholdSchema.safeParse({ inviteCode });
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
      const res = await householdApi.join(result.data);
      await refreshParent();
      onComplete({ name: res.name || "Your household", inviteCode: res.inviteCode || inviteCode });
    } catch (err: any) {
      toast.error(err.message || "Failed to join household");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
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
          <AuthFormField index={0}>
            <Input
              label="Household Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="e.g. The Smith Family"
            />
          </AuthFormField>
          <AuthFormField index={1}>
            <Button type="submit" loading={loading} className="w-full">
              Create Household
            </Button>
          </AuthFormField>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
          <AuthFormField index={0}>
            <Input
              label="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              error={errors.inviteCode}
              placeholder="e.g. A1B2C3D4"
              className="text-center font-mono tracking-widest"
            />
          </AuthFormField>
          <AuthFormField index={1}>
            <Button type="submit" loading={loading} className="w-full">
              Join Household
            </Button>
          </AuthFormField>
        </form>
      )}
    </AuthCard>
  );
}

function ChildStep({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createChildSchema.safeParse({ name, pin, avatar });
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
      await childrenApi.create(result.data);
      toast.success("Child added!");
      onComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to add child");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormField index={0}>
          <Input
            label="Child's Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g. Emma"
          />
        </AuthFormField>
        <AuthFormField index={1}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                    avatar === emoji
                      ? "bg-primary-100 ring-2 ring-primary-500 scale-110"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </AuthFormField>
        <AuthFormField index={2}>
          <Input
            label="PIN (4 digits)"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            error={errors.pin}
            placeholder="e.g. 1234"
          />
        </AuthFormField>
        <AuthFormField index={3}>
          <Button type="submit" loading={loading} className="w-full">
            Add Child
          </Button>
        </AuthFormField>
      </form>
      <button
        type="button"
        onClick={onSkip}
        className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Skip for now
      </button>
    </AuthCard>
  );
}

function CompleteStep({ householdData }: { householdData: { name: string; inviteCode: string } | null }) {
  const navigate = useNavigate();

  return (
    <AuthCard>
      <div className="text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Welcome to {householdData?.name || "your household"}!</h2>
        <p className="mt-2 text-sm text-gray-500">
          Share your invite code with other family members so they can join.
        </p>

        {householdData?.inviteCode && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Invite Code</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <code className="rounded-xl bg-gray-100 px-4 py-2.5 text-lg font-mono font-bold tracking-[0.2em] text-gray-900">
                {householdData.inviteCode}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(householdData.inviteCode);
                  toast.success("Copied to clipboard!");
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button onClick={() => navigate("/parent/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
