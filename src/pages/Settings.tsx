
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ArrowLeft, 
  BookOpen, 
  Server, 
  Globe, 
  Trash2, 
  Moon, 
  DollarSign, 
  Languages, 
  Info, 
  ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ThemeSelectSheet } from "@/components/ThemeSelectSheet";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClearCache = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      toast.success("Cache cleared successfully");
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear cache");
    }
  };

  const handleAddressBookClick = () => {
    navigate("/address-book");
  };
  
  const handleNodeSettingsClick = () => {
    navigate("/node-settings");
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 rounded-full p-1 hover:bg-card/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </motion.header>

      <ThemeSelectSheet open={isThemeSheetOpen} onOpenChange={setIsThemeSheetOpen} />

      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div 
              className="py-3 flex items-center justify-between cursor-pointer"
              onClick={handleAddressBookClick}
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Address Book</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div 
              className="py-3 flex items-center justify-between cursor-pointer"
              onClick={handleNodeSettingsClick}
            >
              <div className="flex items-center">
                <Server className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Node Settings</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Custom Network</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div 
              className="py-3 flex items-center justify-between cursor-pointer"
              onClick={handleClearCache}
            >
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Clear Cache</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div 
              className="py-3 flex items-center justify-between cursor-pointer"
              onClick={() => setIsThemeSheetOpen(true)}
            >
              <div className="flex items-center">
                <Moon className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Appearance</div>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Dark Mode</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Fiat Currency</div>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">$ USD</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Languages className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Language</div>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">English</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">About</div>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">V4.8.6</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
