import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { Avatar } from "../ui/Avatar.js";
import { Logo } from "../brand/Logo.js";

const navItems = [
  { to: "/parent/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/parent/chores", label: "Chores", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { to: "/parent/children", label: "Children", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { to: "/parent/rewards", label: "Rewards", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
  { to: "/parent/redemptions", label: "Redemptions", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { to: "/parent/household", label: "Household", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

export function ParentLayout() {
  const { parent, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#fafaf8]">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-gray-200/80 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <Logo size="md" />
        </div>
        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
              }
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={parent?.name || "P"} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{parent?.name}</p>
              <button
                onClick={logout}
                className="text-xs text-gray-500 transition-colors hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200/80 bg-white px-4 lg:px-8">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:inline">{parent?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        {/* Mobile bottom nav */}
        <nav className="flex border-t border-gray-200 bg-white lg:hidden">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${isActive ? "text-emerald-700 font-medium" : "text-gray-400"}`
              }
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
