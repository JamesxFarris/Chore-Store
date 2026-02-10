const sizes = {
  sm: { icon: 20, text: "text-base", gap: "gap-1.5" },
  md: { icon: 24, text: "text-lg", gap: "gap-2" },
  lg: { icon: 32, text: "text-2xl", gap: "gap-2.5" },
  xl: { icon: 44, text: "text-4xl", gap: "gap-3" },
} as const;

type Variant = "dark" | "light";

interface LogoProps {
  size?: keyof typeof sizes;
  iconOnly?: boolean;
  variant?: Variant;
  className?: string;
}

function HouseIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 20L20 6l14 14v14a2 2 0 01-2 2H8a2 2 0 01-2-2V20z"
        className="fill-accent-400"
      />
      <path
        d="M6 20L20 6l14 14"
        className="stroke-red-500"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="16" y="24" width="8" height="12" rx="1" className="fill-points-300" />
      <rect x="12" y="18" width="5" height="5" rx="0.5" fill="white" fillOpacity="0.8" />
      <rect x="23" y="18" width="5" height="5" rx="0.5" fill="white" fillOpacity="0.8" />
    </svg>
  );
}

export function Logo({ size = "md", iconOnly = false, variant = "dark", className = "" }: LogoProps) {
  const s = sizes[size];

  const choreColor = variant === "light" ? "text-points-300" : "text-primary-600";
  const storeColor = variant === "light" ? "text-accent-300" : "text-accent-600";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <HouseIcon size={s.icon} />
      {!iconOnly && (
        <span className={`font-display font-semibold ${s.text} leading-none`}>
          <span className={choreColor}>Chore</span>
          <span className={storeColor}>Store</span>
        </span>
      )}
    </div>
  );
}
