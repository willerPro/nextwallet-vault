
import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "gold" | "dark";
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({
  variant = "default",
  children,
  className,
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
      {...props}
    >
      {children}
    </motion.div>
  );
}
