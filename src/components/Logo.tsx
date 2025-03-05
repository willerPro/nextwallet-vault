
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ className, size = "md", withText = true }: LogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        className={cn(
          "relative rounded-lg bg-gradient-to-br from-gold-light via-gold to-gold-dark p-[1px]",
          sizes[size]
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 10,
          delay: 0.1
        }}
      >
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-background opacity-80 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-gold/10 z-0"></div>
        </div>
        <div className="relative z-20 w-full h-full flex items-center justify-center rounded-lg">
          <svg viewBox="0 0 24 24" className="h-2/3 w-2/3 text-gold">
            <path
              fill="currentColor"
              d="M12 2L4 6v12l8 4 8-4V6l-8-4zm6 15.8l-6 3-6-3V7.2l6-3 6 3v10.6z"
            />
            <path
              fill="currentColor"
              d="M12 5L7 7.6v8.8l5 2.5 5-2.5V7.6L12 5zm0 2l3 1.5v4.5l-3 1.5-3-1.5V8.5l3-1.5z"
            />
          </svg>
        </div>
      </motion.div>
      
      {withText && (
        <motion.div
          className="font-bold text-foreground"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="text-gradient-gold text-lg font-extrabold">Next</span>
          <span>Wallet</span>
        </motion.div>
      )}
    </div>
  );
}
