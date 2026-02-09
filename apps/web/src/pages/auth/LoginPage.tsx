import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "@chore-store/shared";
import { authApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Card } from "../../components/ui/Card.js";
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Parent Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="parent@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="********"
          />
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>
        <div className="mt-4 space-y-2 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register
            </Link>
          </p>
          <p>
            <Link to="/child-login" className="text-primary-600 hover:underline">
              Child login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
