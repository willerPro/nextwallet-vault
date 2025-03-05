
import { useEffect } from "react";
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
  BarChart, 
  HelpCircle, 
  HeadphonesIcon, 
  Users, 
  Info, 
  ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
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

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Network Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Address Book</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="py-3 flex items-center justify-between">
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
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Clear Cache</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div className="py-3 flex items-center justify-between">
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
                <div className="font-medium">Transaction Cost</div>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">Middle</span>
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
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">K-Line Color</div>
              </div>
              <div className="flex items-center">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="divide-y divide-border/30">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Help Center</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <HeadphonesIcon className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Support</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gold mr-3" />
                <div className="font-medium">Community</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
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
