
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Key } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WalletSetup = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checkingWallets, setCheckingWallets] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Redirect to home if not authenticated
    if (!loading && !user) {
      navigate('/');
      return;
    }

    // Check if user already has wallets
    const checkForExistingWallets = async () => {
      if (!user) return;
      
      try {
        const { data: wallets, error } = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) throw error;
        
        // If wallets exist, redirect to wallet page
        if (wallets && wallets.length > 0) {
          navigate('/wallet');
        }
      } catch (err) {
        console.error("Error checking wallets:", err);
        toast.error("Something went wrong");
      } finally {
        setCheckingWallets(false);
      }
    };
    
    if (user) {
      checkForExistingWallets();
    }
  }, [user, loading, navigate]);

  const handleCreateWallet = () => {
    // Will be implemented later
    navigate("/wallet");
  };

  const handleAddWallet = () => {
    // Will be implemented later
    navigate("/wallet");
  };

  // Show loading state for authentication or wallet checking
  if (loading || checkingWallets) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gold">Loading...</div>
    </div>;
  }

  // Return nothing if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10 px-6 py-10">
        <div className="flex-1 flex flex-col justify-center items-center">
          <motion.div
            className="text-center mb-10 w-full max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center items-center mb-6">
              <Wallet className="h-12 w-12 text-gold mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold">
                Personal Blockchain Wallet
              </h1>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Manage your digital assets with our secure blockchain wallet. Create a new wallet or add your existing one.
            </p>
            
            <GlassCard 
              variant="gold"
              className="p-8 shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="space-y-6">
                <Button 
                  onClick={handleCreateWallet} 
                  className="w-full py-6 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary-foreground hover:shadow-lg hover:shadow-gold/20 transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Wallet
                </Button>
                
                <Button 
                  onClick={handleAddWallet} 
                  variant="outline" 
                  className="w-full py-6 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all"
                >
                  <Key className="mr-2 h-5 w-5" />
                  Add Existing Wallet
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WalletSetup;
