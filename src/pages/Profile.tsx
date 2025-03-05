
import { useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { User, Settings, Bell, Shield, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <User className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Profile info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="flex items-center">
            <Avatar className="h-16 w-16 border-2 border-gold">
              <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">JD</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-xl font-bold">John Doe</h2>
              <p className="text-muted-foreground">john.doe@example.com</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto border-gold/20 text-foreground hover:bg-gold/10">
              Edit
            </Button>
          </GlassCard>
        </motion.div>

        {/* Settings */}
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
              <Switch id="biometrics" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Account */}
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

        {/* Logout */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button 
            variant="outline" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
