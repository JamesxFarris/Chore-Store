import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  default: "border border-gray-200 bg-white shadow-card",
  elevated: "bg-white shadow-card-hover",
  interactive: "border border-gray-200 bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-gray-300 cursor-pointer",
  stat: "bg-white shadow-card border border-gray-100",
  child: "rounded-3xl bg-white p-5 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]",
  "child-completed": "rounded-3xl bg-green-50 border border-green-200 p-5 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: keyof typeof variants;
}

export function Card({ children, variant = "default", className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
