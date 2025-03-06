
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, User, Send, Activity, CirclesDashedLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
      <div className="flex justify-around items-center p-2">
        <Link
          to="/dashboard"
          className={cn(
            "flex flex-col items-center py-1 px-3 text-xs",
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home size={24} />
          <span>Home</span>
        </Link>
        
        <Link
          to="/wallet"
          className={cn(
            "flex flex-col items-center py-1 px-3 text-xs",
            isActive("/wallet") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Wallet size={24} />
          <span>Wallet</span>
        </Link>
        
        <Link
          to="/arbitrage"
          className={cn(
            "flex flex-col items-center py-1 px-3 text-xs",
            isActive("/arbitrage") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <CirclesDashedLine size={24} />
          <span>Arbitrage</span>
        </Link>
        
        <Link
          to="/transactions"
          className={cn(
            "flex flex-col items-center py-1 px-3 text-xs",
            isActive("/transactions") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Activity size={24} />
          <span>Activity</span>
        </Link>
        
        <Link
          to="/profile"
          className={cn(
            "flex flex-col items-center py-1 px-3 text-xs",
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User size={24} />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};
