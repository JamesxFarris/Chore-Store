import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { PointsBadge } from "../points/PointsBadge.js";
import { Avatar } from "../ui/Avatar.js";

const navItems = [
  { to: "/child/chores", label: "My Chores", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", iconFilled: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { to: "/child/shop", label: "Shop", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", iconFilled: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { to: "/child/points", label: "Points", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", iconFilled: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { to: "/child/redemptions", label: "My Rewards", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7", iconFilled: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
];

export function ChildLayout() {
  const { child, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-400 to-emerald-500">
      <header className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={child?.name || "K"} avatar={child?.avatar} size="sm" />
          <span className="font-display text-lg font-bold text-white">{child?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <PointsBadge />
          <button
            onClick={logout}
            className="rounded-lg px-2 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto px-4 pb-24">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex rounded-t-3xl bg-white shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-4 text-xs transition-colors ${isActive ? "text-green-600 font-semibold" : "text-gray-400"}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? "rounded-2xl bg-green-100 p-2" : "p-2"}>
                  <svg
                    className="h-6 w-6"
                    fill={isActive ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isActive ? 0 : 1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={isActive ? item.iconFilled : item.icon} />
                  </svg>
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
