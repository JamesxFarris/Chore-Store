import { motion } from "framer-motion";

interface AuthFormFieldProps {
  index: number;
  children: React.ReactNode;
}

export function AuthFormField({ index, children }: AuthFormFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.15 + index * 0.08,
      }}
    >
      {children}
    </motion.div>
  );
}
