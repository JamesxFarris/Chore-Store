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

function StorefrontIcon({ size, variant }: { size: number; variant: Variant }) {
  const isLight = variant === "light";

  // Awning: light indigo on dark bg, full indigo on light bg — always reads as purple
  const awning = isLight ? "fill-primary-200" : "fill-primary-600";
  // Body: subtle light fill
  const body = isLight ? "fill-white/70" : "fill-primary-50";
  const bodyStroke = isLight ? "rgba(255,255,255,0.25)" : "#c7d2fe";
  // Door: green accent — echoes "Store"
  const door = isLight ? "fill-accent-300" : "fill-accent-500";
  // Star: gold — reward/achievement flavor
  const star = isLight ? "fill-points-300" : "fill-points-400";
  const windowOpacity = isLight ? "0.4" : "0.85";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Store body */}
      <rect
        x="6" y="16" width="28" height="20" rx="1.5"
        className={body}
        stroke={bodyStroke}
        strokeWidth="0.75"
      />
      {/* Awning */}
      <path
        d="M3 16L9 5h22l6 11H3z"
        className={awning}
      />
      {/* Awning stripe details */}
      <line x1="14" y1="6.5" x2="11" y2="16" stroke="white" strokeOpacity="0.3" strokeWidth="0.75" />
      <line x1="22" y1="5.8" x2="19" y2="16" stroke="white" strokeOpacity="0.3" strokeWidth="0.75" />
      <line x1="30" y1="6.5" x2="27" y2="16" stroke="white" strokeOpacity="0.3" strokeWidth="0.75" />
      {/* Left window */}
      <rect x="9" y="20" width="7" height="6" rx="0.75" fill="white" fillOpacity={windowOpacity} />
      {/* Right window */}
      <rect x="24" y="20" width="7" height="6" rx="0.75" fill="white" fillOpacity={windowOpacity} />
      {/* Door */}
      <rect x="16" y="23" width="8" height="13" rx="1" className={door} />
      {/* Door handle */}
      <circle cx="22" cy="30" r="0.75" fill="white" fillOpacity="0.7" />
      {/* Small sparkle above awning */}
      <path
        d="M20 2l0.8 1.6L22.4 4.4l-1.6 0.8L20 6.8l-0.8-1.6L17.6 4.4l1.6-0.8L20 2z"
        className={star}
      />
    </svg>
  );
}

export function Logo({ size = "md", iconOnly = false, variant = "dark", className = "" }: LogoProps) {
  const s = sizes[size];

  const choreColor = variant === "light" ? "text-white" : "text-primary-600";
  const storeColor = variant === "light" ? "text-accent-300" : "text-accent-600";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <StorefrontIcon size={s.icon} variant={variant} />
      {!iconOnly && (
        <span className={`font-display font-semibold ${s.text} leading-none`}>
          <span className={choreColor}>Chore</span>
          <span className={storeColor}>Store</span>
        </span>
      )}
    </div>
  );
}
