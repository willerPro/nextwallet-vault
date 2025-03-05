
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  Wallet,
  Settings,
  User,
  LucideIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "Wallet",
    path: "/wallet",
    icon: Wallet,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
];

export function BottomNavigation() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Don't show navigation on authentication pages
  if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom"
      >
        <div className="mx-auto max-w-lg px-4 pb-4">
          <nav className="glass-gold rounded-2xl border border-gold/20 shadow-lg">
            <ul className="flex justify-around">
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </ul>
          </nav>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function NavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  
  const Icon = item.icon;
  
  return (
    <li className="relative">
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center justify-center py-3 px-3 transition-colors",
            isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
          )
        }
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              <Icon className="h-6 w-6" />
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-1 left-0 right-0 mx-auto h-1 w-1 rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
            <span className="mt-1 text-xs font-medium">{item.name}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}
