import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: "indigo" | "amber" | "emerald" | "purple" | "red" | "blue";
  to?: string;
}

const colorMap = {
  indigo: { bg: "bg-primary-50", text: "text-primary-600", icon: "text-primary-500" },
  amber: { bg: "bg-points-50", text: "text-points-600", icon: "text-points-500" },
  emerald: { bg: "bg-accent-50", text: "text-accent-600", icon: "text-accent-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-500" },
  red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
};

export function StatCard({ label, value, subtitle, icon, color, to }: StatCardProps) {
  const c = colorMap[color];
  const content = (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }
  return content;
}
