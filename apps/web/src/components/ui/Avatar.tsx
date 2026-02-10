const bgColors = [
  "bg-primary-100 text-primary-700",
  "bg-accent-100 text-accent-700",
  "bg-points-100 text-points-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-red-100 text-red-700",
  "bg-teal-100 text-teal-700",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: keyof typeof sizes;
}

export function Avatar({ name, avatar, size = "md" }: AvatarProps) {
  const colorClass = getColorForName(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizes[size]} ${colorClass}`}
    >
      {avatar || name[0]?.toUpperCase() || "?"}
    </div>
  );
}
