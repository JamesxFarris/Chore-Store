import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { HouseholdProvider } from "./context/HouseholdContext.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.js";
import { ParentLayout } from "./components/layout/ParentLayout.js";
import { ChildLayout } from "./components/layout/ChildLayout.js";
import { Spinner } from "./components/ui/Spinner.js";

function HouseholdGuard({ children }: { children: React.ReactNode }) {
  const { parent, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!parent?.households?.length) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

// Code-split page components
const LoginPage = lazy(() => import("./pages/auth/LoginPage.js").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.js").then(m => ({ default: m.RegisterPage })));
const ChildLoginPage = lazy(() => import("./pages/auth/ChildLoginPage.js").then(m => ({ default: m.ChildLoginPage })));
const DashboardPage = lazy(() => import("./pages/parent/DashboardPage.js").then(m => ({ default: m.DashboardPage })));
const ChildrenPage = lazy(() => import("./pages/parent/ChildrenPage.js").then(m => ({ default: m.ChildrenPage })));
const ChoresPage = lazy(() => import("./pages/parent/ChoresPage.js").then(m => ({ default: m.ChoresPage })));
const RewardsPage = lazy(() => import("./pages/parent/RewardsPage.js").then(m => ({ default: m.RewardsPage })));
const RedemptionsPage = lazy(() => import("./pages/parent/RedemptionsPage.js").then(m => ({ default: m.RedemptionsPage })));
const HouseholdPage = lazy(() => import("./pages/parent/HouseholdPage.js").then(m => ({ default: m.HouseholdPage })));
const MyChoresPage = lazy(() => import("./pages/child/MyChoresPage.js").then(m => ({ default: m.MyChoresPage })));
const ShopPage = lazy(() => import("./pages/child/ShopPage.js").then(m => ({ default: m.ShopPage })));
const MyPointsPage = lazy(() => import("./pages/child/MyPointsPage.js").then(m => ({ default: m.MyPointsPage })));
const MyRedemptionsPage = lazy(() => import("./pages/child/MyRedemptionsPage.js").then(m => ({ default: m.MyRedemptionsPage })));
const SetupWizard = lazy(() => import("./pages/setup/SetupWizard.js").then(m => ({ default: m.SetupWizard })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.js").then(m => ({ default: m.NotFoundPage })));

function AppRoutes() {
  const { loading, token, type } = useAuth();

  if (loading) return <Spinner />;

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={token ? <Navigate to={type === "parent" ? "/parent/dashboard" : "/child/chores"} /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/setup" /> : <RegisterPage />} />
        <Route path="/child-login" element={token ? <Navigate to="/child/chores" /> : <ChildLoginPage />} />

        {/* Setup Wizard */}
        <Route path="/setup" element={token && type === "parent" ? <SetupWizard /> : <Navigate to="/login" />} />

        {/* Parent */}
        <Route path="/parent" element={<ProtectedRoute type="parent"><HouseholdGuard><HouseholdProvider><ParentLayout /></HouseholdProvider></HouseholdGuard></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="children" element={<ChildrenPage />} />
          <Route path="chores" element={<ChoresPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="redemptions" element={<RedemptionsPage />} />
          <Route path="household" element={<HouseholdPage />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Child */}
        <Route path="/child" element={<ProtectedRoute type="child"><ChildLayout /></ProtectedRoute>}>
          <Route path="chores" element={<MyChoresPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="points" element={<MyPointsPage />} />
          <Route path="redemptions" element={<MyRedemptionsPage />} />
          <Route index element={<Navigate to="chores" />} />
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#1f2937",
                color: "#f9fafb",
                fontSize: "14px",
              },
            }}
          />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
