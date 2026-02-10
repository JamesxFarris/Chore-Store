import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  default: "border border-gray-200 bg-white shadow-card",
  elevated: "bg-white shadow-card-hover",
  interactive: "border border-gray-200 bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-gray-300 cursor-pointer",
  stat: "bg-white shadow-card border border-gray-100",
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
