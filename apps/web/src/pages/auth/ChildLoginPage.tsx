import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { childLoginSchema } from "@chore-store/shared";
import { authApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
import toast from "react-hot-toast";

export function ChildLoginPage() {
  const navigate = useNavigate();
  const { loginChild } = useAuth();
  const [householdCode, setHouseholdCode] = useState("");
  const [childName, setChildName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = childLoginSchema.safeParse({ householdCode, childName, pin });
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
      const res = await authApi.childLogin(result.data);
      loginChild(res.token, res.child!);
      navigate("/child/chores");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Kid Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Household Code"
            value={householdCode}
            onChange={(e) => setHouseholdCode(e.target.value.toUpperCase())}
            error={errors.householdCode}
            placeholder="e.g. A1B2C3D4"
          />
          <Input
            label="Your Name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            error={errors.childName}
            placeholder="e.g. Emma"
          />
          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            error={errors.pin}
            placeholder="4-digit PIN"
          />
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="text-primary-600 hover:underline">
            Parent login
          </Link>
        </p>
      </Card>
    </div>
  );
}
