import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.js";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
      <div className="text-center animate-slide-up">
        <div className="text-6xl">🔍</div>
        <h1 className="mt-4 text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-500">Page not found</p>
        <p className="mt-1 text-sm text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/login">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
