import type { ReactNode } from "react";

const colors = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10",
  green: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-600/10",
  yellow: "bg-points-50 text-points-700 ring-1 ring-inset ring-points-600/10",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
  gray: "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/10",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/10",
  indigo: "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/10",
  star: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

interface BadgeProps {
  color?: keyof typeof colors;
  size?: keyof typeof badgeSizes;
  children: ReactNode;
}

export function Badge({ color = "gray", size = "md", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${badgeSizes[size]} ${colors[color]}`}
    >
      {children}
    </span>
  );
}
