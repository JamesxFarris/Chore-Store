import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { HouseholdProvider } from "./context/HouseholdContext.js";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.js";
import { ParentLayout } from "./components/layout/ParentLayout.js";
import { ChildLayout } from "./components/layout/ChildLayout.js";
import { Spinner } from "./components/ui/Spinner.js";

// Pages
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegisterPage } from "./pages/auth/RegisterPage.js";
import { ChildLoginPage } from "./pages/auth/ChildLoginPage.js";
import { DashboardPage } from "./pages/parent/DashboardPage.js";
import { ChildrenPage } from "./pages/parent/ChildrenPage.js";
import { ChoresPage } from "./pages/parent/ChoresPage.js";
import { RewardsPage } from "./pages/parent/RewardsPage.js";
import { RedemptionsPage } from "./pages/parent/RedemptionsPage.js";
import { HouseholdPage } from "./pages/parent/HouseholdPage.js";
import { MyChoresPage } from "./pages/child/MyChoresPage.js";
import { ShopPage } from "./pages/child/ShopPage.js";
import { MyPointsPage } from "./pages/child/MyPointsPage.js";
import { MyRedemptionsPage } from "./pages/child/MyRedemptionsPage.js";

function AppRoutes() {
  const { loading, token, type } = useAuth();

  if (loading) return <Spinner />;

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={token ? <Navigate to={type === "parent" ? "/parent/dashboard" : "/child/chores"} /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/parent/household" /> : <RegisterPage />} />
      <Route path="/child-login" element={token ? <Navigate to="/child/chores" /> : <ChildLoginPage />} />

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute type="parent"><HouseholdProvider><ParentLayout /></HouseholdProvider></ProtectedRoute>}>
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
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
