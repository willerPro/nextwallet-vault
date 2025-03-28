import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Smartphone, 
  Clock, 
  Info, 
  Download, 
  Key, 
  Upload, 
  Plus, 
  Trash2, 
  Shield,
  ArrowRight,
  Check,
  AlertTriangle,
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Pen } from "lucide-react";
import { ExportKeySheet } from "@/components/ExportKeySheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import PinAuthentication from "@/components/PinAuthentication";

type Wallet = {
  id: string;
  name: string;
  created_at: string;
  balance: number;
  backup_status?: "backed_up" | "not_backed_up";
};

const WalletDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exportKeyOpen, setExportKeyOpen] = useState(false);
  const [exportKeyType, setExportKeyType] = useState<"public" | "private">("public");
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [isWalletInUse, setIsWalletInUse] = useState(false);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [isContractBot, setIsContractBot] = useState(false);

  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet-details', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching wallet:", error);
        toast.error("Failed to load wallet details");
        return null;
      }
      
      return data as Wallet;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (user && id) {
      const checkBotUsage = async () => {
        const { data: contractData, error: contractError } = await supabase
          .from('contract_api_settings')
          .select('*')
          .eq('wallet_id', id)
          .eq('is_active', true)
          .maybeSingle();
          
        if (contractError) {
          console.error("Error checking contract bot usage:", contractError);
        } else if (contractData) {
          setIsWalletInUse(true);
          setIsContractBot(true);
        } else {
          const { data: arbitrageData, error: arbitrageError } = await supabase
            .from('arbitrage_operations')
            .select('*')
            .eq('wallet_id', id)
            .eq('is_active', true)
            .maybeSingle();
            
          if (arbitrageError) {
            console.error("Error checking arbitrage bot usage:", arbitrageError);
          } else if (arbitrageData) {
            setIsWalletInUse(true);
          }
        }
      };
      
      checkBotUsage();
    }
  }, [user, id]);

  useEffect(() => {
    if (isWalletInUse && isContractBot && wallet) {
      let lastTimestamp = 0;
      let currentBalance = wallet.balance;
      let direction = -1;
      let phaseTime = 0;
      
      const animateBalance = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        phaseTime += delta;
        
        if (phaseTime > 2000) {
          direction = Math.random() > 0.5 ? 1 : -1;
          phaseTime = 0;
        }
        
        const change = Math.random() * 0.2 * direction;
        currentBalance = Math.max(0, currentBalance + change);
        
        setAnimatedBalance(currentBalance);
        requestAnimationFrame(animateBalance);
      };
      
      const animationId = requestAnimationFrame(animateBalance);
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    } else if (wallet) {
      setAnimatedBalance(wallet.balance);
    }
  }, [isWalletInUse, isContractBot, wallet]);

  useEffect(() => {
    if (wallet) {
      setWalletName(wallet.name);
      setAnimatedBalance(wallet.balance);
    }
  }, [wallet]);

  const handleUpdateName = async () => {
    if (!user || !id || !walletName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ name: walletName })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Wallet name updated");
      setIsEditing(false);
      
      queryClient.invalidateQueries({ queryKey: ['wallet-details', id] });
    } catch (error) {
      console.error("Error updating wallet name:", error);
      toast.error("Failed to update wallet name");
    }
  };

  const handleDeleteWallet = async () => {
    if (!user || !id) return;
    
    try {
      console.log("Deleting wallet with ID:", id);
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting wallet:", error);
        throw error;
      }
      
      toast.success("Wallet has been removed");
      
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      
      navigate('/wallet');
    } catch (error: any) {
      console.error("Error deleting wallet:", error);
      toast.error("Failed to delete wallet: " + (error.message || "Unknown error"));
    }
  };

  const handleExportKey = (type: "public" | "private") => {
    setExportKeyType(type);
    setExportKeyOpen(true);
  };

  const handleClearCacheClick = () => {
    setShowPinVerification(true);
  };

  const handleClearCacheSuccess = async () => {
    setShowPinVerification(false);
    
    try {
      if (user) {
        const { error: arbitrageError } = await supabase
          .from('arbitrage_operations')
          .update({ is_active: false })
          .eq('user_id', user.id);
          
        if (arbitrageError) {
          console.error("Error stopping arbitrage operations:", arbitrageError);
        }
        
        const { error: transactionsError } = await supabase
          .from('transactions')
          .delete()
          .eq('user_id', user.id);
          
        if (transactionsError) {
          console.error("Error deleting transactions:", transactionsError);
        }
      }
      
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      toast.success("Cache cleared, arbitrage bot stopped, and transactions deleted");
      
      navigate('/wallet');
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear cache and stop operations");
    }
  };

  const handlePinCancel = () => {
    setShowPinVerification(false);
  };

  const securitySuffix = id ? id.substring(0, 3).toUpperCase() : "UTV";

  if (isLoadingWallet) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="animate-pulse">Loading wallet details...</div>
      </div>
    );
  }

  const isBackedUp = id?.endsWith('4');

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {showPinVerification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-full max-w-md px-4">
            <PinAuthentication 
              mode="verify" 
              onSuccess={handleClearCacheSuccess}
              onCancel={handlePinCancel}
            />
          </div>
        </div>
      )}
      
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/wallet')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Wallet Details</h1>
      </motion.header>

      {isWalletInUse && (
        <motion.div
          className="mx-4 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start">
            <AlertTriangle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-500">Wallet In Use</h3>
              <p className="text-sm text-red-400">
                {isContractBot 
                  ? "This wallet is currently being used by the Contract API Bot. Do not perform any actions on this wallet until the bot is deactivated."
                  : "This wallet is currently being used by a bot. Do not perform any actions on this wallet until the bot is deactivated."}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
                onClick={() => navigate('/arbitrage')}
              >
                <Bot className="h-4 w-4 mr-1" />
                Manage Bots
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 px-4 space-y-6">
        <motion.div
          className="flex flex-col items-center justify-center py-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isWalletInUse ? 'bg-red-200 border-2 border-red-500' : 'bg-gray-200'}`}>
            <Smartphone className={`h-10 w-10 ${isWalletInUse ? 'text-red-600' : 'text-gray-600'}`} />
          </div>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gold"
                autoFocus
              />
              <Button size="sm" onClick={handleUpdateName}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-2xl font-bold mr-2">{walletName || "My Wallet"}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsEditing(true)}
                disabled={isWalletInUse}
              >
                <Pen className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created By</span>
              <span>Mnemonic Phrase</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created Time</span>
              <span>{wallet?.created_at ? new Date(wallet.created_at).toLocaleString() : "N/A"}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Security Suffix</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground">
                  <Info className="h-3 w-3" />
                </Button>
              </div>
              <span>{securitySuffix}</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Backup</span>
              <div className="flex items-center">
                {isBackedUp ? (
                  <span className="text-green-500 mr-2 flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Backed up
                  </span>
                ) : (
                  <span className="text-red-500 mr-2">No backup</span>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <Separator />
            
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleExportKey("public")}
            >
              <div className="flex items-center">
                <span>Export Public Key</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground ml-1">
                  <Info className="h-3 w-3" />
                </Button>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleExportKey("private")}
            >
              <span>Export Private Key</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={handleClearCacheClick}
            >
              <span>Clear Cache</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <GlassCard 
            variant="dark" 
            className={`flex justify-between items-center ${isWalletInUse && isContractBot ? 'border border-red-500' : ''}`}
          >
            <span>Coins</span>
            <span className={isWalletInUse && isContractBot ? "animate-pulse" : ""}>
              ${isWalletInUse && isContractBot ? animatedBalance.toFixed(2) : wallet?.balance?.toFixed(2) || "0.00"}
            </span>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button 
            className="w-full bg-red-500 hover:bg-red-600 text-white" 
            onClick={() => setShowDeleteDialog(true)}
            disabled={isWalletInUse}
          >
            Remove Wallet
          </Button>
          {isWalletInUse && (
            <p className="text-xs text-red-500 text-center mt-2">
              You cannot remove this wallet while it's being used by a bot.
            </p>
          )}
        </motion.div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this wallet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWallet}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportKeySheet
        open={exportKeyOpen}
        onOpenChange={setExportKeyOpen}
        keyType={exportKeyType}
        keyValue=""
      />
    </div>
  );
};

export default WalletDetails;
