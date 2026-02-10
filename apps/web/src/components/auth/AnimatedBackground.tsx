import { motion } from "framer-motion";
import { Star, Sparkle, CheckCircle, Trophy, Gift, Coin, ShoppingBag, PriceTag } from "./FloatingIcons.js";

// Store-themed icon set: rewards, shopping, achievements
const icons = [Star, ShoppingBag, Sparkle, Coin, Trophy, PriceTag, Gift, CheckCircle, Star, ShoppingBag, Coin, Sparkle];

const positions = [
  { top: "5%", left: "8%", size: "w-8 h-8" },
  { top: "12%", right: "12%", size: "w-6 h-6" },
  { top: "25%", left: "5%", size: "w-10 h-10" },
  { top: "35%", right: "8%", size: "w-7 h-7" },
  { top: "55%", left: "10%", size: "w-6 h-6" },
  { top: "65%", right: "6%", size: "w-9 h-9" },
  { top: "78%", left: "15%", size: "w-7 h-7" },
  { top: "85%", right: "15%", size: "w-8 h-8" },
  { top: "45%", left: "3%", size: "w-5 h-5" },
  { top: "18%", left: "20%", size: "w-5 h-5" },
  { top: "70%", right: "20%", size: "w-6 h-6" },
  { top: "92%", left: "6%", size: "w-6 h-6" },
];

interface AnimatedBackgroundProps {
  variant: "parent" | "child";
  children: React.ReactNode;
}

export function AnimatedBackground({ variant, children }: AnimatedBackgroundProps) {
  // Parent: deep indigo — brand primary
  // Child: warm gold into green — brand accent/reward colors
  const gradientClass =
    variant === "parent"
      ? "from-primary-800 via-primary-600 to-primary-500"
      : "from-points-400 via-accent-400 to-accent-600";

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${gradientClass}`}>
      {/* Radial overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />

      {/* Floating icons */}
      {icons.map((Icon, i) => {
        const pos = positions[i];
        const duration = 6 + (i % 3) * 1.5;
        const delay = i * 0.4;
        return (
          <motion.div
            key={i}
            className={`absolute text-white/15 ${pos.size}`}
            style={{ top: pos.top, left: pos.left, right: pos.right }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
          >
            <Icon className="h-full w-full" />
          </motion.div>
        );
      })}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
