import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  variant?: "default" | "child";
}

export function PageHeader({ title, subtitle, action, variant = "default" }: PageHeaderProps) {
  const isChild = variant === "child";

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className={isChild ? "font-display text-2xl font-bold text-white" : "text-2xl font-bold text-gray-900"}>
          {title}
        </h1>
        {subtitle && (
          <p className={isChild ? "mt-1 text-sm text-white/80" : "mt-1 text-sm text-gray-500"}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
