
import React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  variant?: "default" | "gold" | "dark";
  children: React.ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  transition?: any;
}

export function GlassCard({
  variant = "default",
  children,
  className,
  initial,
  animate,
  transition,
  ...props
}: GlassCardProps) {
  const variants = {
    default: "glass",
    gold: "glass-gold",
    dark: "bg-card/80 backdrop-blur-md border border-border/40",
  };

  return (
    <motion.div
      className={cn(variants[variant], "rounded-2xl p-5", className)}
      initial={initial}
      animate={animate}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
