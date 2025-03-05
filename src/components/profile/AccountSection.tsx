
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, Settings, ChevronRight } from "lucide-react";

const AccountSection = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <h2 className="text-lg font-bold mb-3 px-1">Account</h2>
      
      <GlassCard variant="dark" className="divide-y divide-border/30">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gold mr-3" />
            <div>
              <div className="font-medium">Security</div>
              <div className="text-sm text-muted-foreground">Manage your security settings</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-gold mr-3" />
            <div>
              <div className="font-medium">Preferences</div>
              <div className="text-sm text-muted-foreground">Customize your experience</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AccountSection;
