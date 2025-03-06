
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import PinAuthentication from "@/components/PinAuthentication";
import { toast } from "sonner";

const ProfileSettings = () => {
  const { biometricEnabled, toggleBiometricEnabled } = useAuth();
  const [showPinAuth, setShowPinAuth] = useState(false);

  const handleBiometricToggle = async () => {
    if (!biometricEnabled) {
      // When enabling biometrics, first verify with PIN
      setShowPinAuth(true);
    } else {
      // When disabling, just toggle
      await toggleBiometricEnabled();
    }
  };

  const handlePinSuccess = async () => {
    setShowPinAuth(false);
    await toggleBiometricEnabled();
    toast.success("Biometric authentication enabled");
  };

  const handlePinCancel = () => {
    setShowPinAuth(false);
  };

  if (showPinAuth) {
    return (
      <PinAuthentication 
        mode="verify" 
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <h2 className="text-lg font-bold mb-3 px-1">Settings</h2>
      
      <GlassCard variant="dark" className="divide-y divide-border/30">
        <div className="py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gold mr-3" />
            <Label htmlFor="notifications">Notifications</Label>
          </div>
          <Switch id="notifications" defaultChecked />
        </div>
        
        <div className="py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gold mr-3" />
            <Label htmlFor="biometrics">Biometric Authentication</Label>
          </div>
          <Switch 
            id="biometrics" 
            checked={biometricEnabled}
            onCheckedChange={handleBiometricToggle}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ProfileSettings;
