import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "@chore-store/shared";
import { authApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Logo } from "../../components/brand/Logo.js";
import { AnimatedBackground } from "../../components/auth/AnimatedBackground.js";
import { AuthCard } from "../../components/auth/AuthCard.js";
import { AuthFormField } from "../../components/auth/AuthFormField.js";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginParent } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
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
      const res = await authApi.login(result.data);
      await loginParent(res.token);
      navigate("/parent/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground variant="parent">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="xl" variant="light" />
            <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-white/70">Sign in to manage chores and rewards</p>
          </div>
          <AuthCard>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthFormField index={0}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="parent@example.com"
                />
              </AuthFormField>
              <AuthFormField index={1}>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="Enter your password"
                />
              </AuthFormField>
              <AuthFormField index={2}>
                <Button type="submit" loading={loading} className="w-full">
                  Sign in
                </Button>
              </AuthFormField>
            </form>
          </AuthCard>
          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-white/70">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-white underline underline-offset-2 hover:text-white/90">
                Create one
              </Link>
            </p>
            <p>
              <Link to="/child-login" className="font-medium text-white underline underline-offset-2 hover:text-white/90">
                I'm a kid
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
