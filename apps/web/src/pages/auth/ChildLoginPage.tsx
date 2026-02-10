import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { childLoginSchema } from "@chore-store/shared";
import { authApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Logo } from "../../components/brand/Logo.js";
import { AnimatedBackground } from "../../components/auth/AnimatedBackground.js";
import { AuthCard } from "../../components/auth/AuthCard.js";
import { AuthFormField } from "../../components/auth/AuthFormField.js";
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
    <AnimatedBackground variant="child">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="xl" variant="light" />
            <motion.h1
              className="mt-4 text-2xl font-bold text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            >
              Hey there!
            </motion.h1>
            <p className="mt-1 text-base text-white/70">Sign in to see your chores and earn rewards</p>
          </div>
          <AuthCard>
            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthFormField index={0}>
                <Input
                  label="Family Code"
                  value={householdCode}
                  onChange={(e) => setHouseholdCode(e.target.value.toUpperCase())}
                  error={errors.householdCode}
                  placeholder="e.g. A1B2C3D4"
                  className="text-center text-lg font-mono tracking-widest"
                />
              </AuthFormField>
              <AuthFormField index={1}>
                <Input
                  label="Your Name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  error={errors.childName}
                  placeholder="e.g. Emma"
                />
              </AuthFormField>
              <AuthFormField index={2}>
                <Input
                  label="PIN"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  error={errors.pin}
                  placeholder="4-digit PIN"
                  className="text-center text-lg tracking-[0.5em]"
                />
              </AuthFormField>
              <AuthFormField index={3}>
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Let's go!
                </Button>
              </AuthFormField>
            </form>
          </AuthCard>
          <p className="mt-6 text-center text-sm text-white/70">
            Are you a parent?{" "}
            <Link to="/login" className="font-medium text-white underline underline-offset-2 hover:text-white/90">
              Parent login
            </Link>
          </p>
        </div>
      </div>
    </AnimatedBackground>
  );
}
