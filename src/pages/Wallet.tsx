import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { WalletIcon, Plus, ArrowRight, ArrowRightLeft, AlertTriangle, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import CreateWalletFlow from "@/components/CreateWalletFlow";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";
import TransferWallet from "@/components/TransferWallet";

type Wallet = {
  id: string;
  name: string;
  created_at: string;
  balance: number;
};

interface WalletInUse {
  walletId: string;
  botType: 'contract' | 'arbitrage' | 'third-party';
  botName: string;
}

const WalletPage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showTransferFlow, setShowTransferFlow] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [walletsInUse, setWalletsInUse] = useState<WalletInUse[]>([]);
  const [animatedBalances, setAnimatedBalances] = useState<Record<string, number>>({});

  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching wallets:", error);
        toast({
          title: "Error",
          description: "Failed to load wallets",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && !loading,
  });

  // Fetch which wallets are in use by bots
  const { data: contractSettings } = useQuery({
    queryKey: ['contract_api_settings'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('contract_api_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching contract settings:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user && !loading,
  });
  
  const { data: arbitrageSettings } = useQuery({
    queryKey: ['arbitrage_operations'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('arbitrage_operations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching arbitrage settings:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user && !loading,
  });
  
  // Determine which wallets are in use by bots
  useEffect(() => {
    const inUse: WalletInUse[] = [];
    
    if (contractSettings?.wallet_id && contractSettings.is_active) {
      inUse.push({
        walletId: contractSettings.wallet_id,
        botType: 'contract',
        botName: 'Contract API'
      });
    }
    
    if (arbitrageSettings?.wallet_id && arbitrageSettings.is_active) {
      inUse.push({
        walletId: arbitrageSettings.wallet_id,
        botType: 'arbitrage',
        botName: 'Arbitrage System'
      });
    }
    
    setWalletsInUse(inUse);
  }, [contractSettings, arbitrageSettings]);

  // Animation effect for active contract wallets
  useEffect(() => {
    if (wallets && walletsInUse.length > 0) {
      const newAnimatedBalances: Record<string, number> = {};
      
      // Initialize animation balances
      walletsInUse.forEach(inUse => {
        const wallet = wallets.find(w => w.id === inUse.walletId);
        if (wallet) {
          newAnimatedBalances[inUse.walletId] = wallet.balance;
        }
      });
      
      setAnimatedBalances(newAnimatedBalances);
      
      // Set up animation
      if (Object.keys(newAnimatedBalances).length > 0) {
        let lastTimestamp = 0;
        
        const animate = (timestamp: number) => {
          if (!lastTimestamp) lastTimestamp = timestamp;
          const delta = timestamp - lastTimestamp;
          lastTimestamp = timestamp;
          
          const updatedBalances = { ...newAnimatedBalances };
          let hasChanges = false;
          
          // Update each animated balance
          Object.keys(updatedBalances).forEach(walletId => {
            const inUseInfo = walletsInUse.find(w => w.walletId === walletId);
            const isContractWallet = inUseInfo?.botType === 'contract';
            
            if (inUseInfo) {
              const wallet = wallets.find(w => w.id === walletId);
              if (!wallet) return;
              
              const currentBalance = updatedBalances[walletId];
              const baseBalance = wallet.balance;
              
              // Generate random change (more volatile for contract bot)
              const volatilityFactor = isContractWallet ? 0.2 : 0.05;
              const direction = Math.random() > 0.5 ? 1 : -1;
              const change = Math.random() * volatilityFactor * direction;
              
              // Ensure balance stays within reasonable range
              const newBalance = Math.max(baseBalance * 0.8, currentBalance + change);
              updatedBalances[walletId] = newBalance;
              hasChanges = true;
            }
          });
          
          if (hasChanges) {
            setAnimatedBalances(updatedBalances);
            requestAnimationFrame(animate);
          }
        };
        
        const animationId = requestAnimationFrame(animate);
        
        return () => {
          cancelAnimationFrame(animationId);
        };
      }
    }
  }, [wallets, walletsInUse]);

  useEffect(() => {
    if (wallets && wallets.length > 0) {
      const sum = wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0);
      setTotalBalance(sum);
    } else {
      setTotalBalance(0);
    }
  }, [wallets]);

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      setShowCreateFlow(true);
      return null;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWalletClick = (walletId: string) => {
    navigate(`/wallet/${walletId}`);
  };

  const handleTransferClick = (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWalletId(walletId);
    setShowTransferFlow(true);
  };

  // Check if a wallet is in use
  const isWalletInUse = (walletId: string) => {
    return walletsInUse.some(w => w.walletId === walletId);
  };
  
  // Get bot info for a wallet in use
  const getWalletInUseInfo = (walletId: string) => {
    return walletsInUse.find(w => w.walletId === walletId);
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <WalletIcon className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">My Wallet</h1>
        </div>
      </motion.header>

      <div className="flex-1 px-4 space-y-6">
        {showCreateFlow ? (
          <CreateWalletFlow onComplete={() => setShowCreateFlow(false)} onCancel={() => setShowCreateFlow(false)} />
        ) : showTransferFlow && selectedWalletId ? (
          <TransferWallet 
            currentWalletId={selectedWalletId} 
            onClose={() => {
              setShowTransferFlow(false);
              setSelectedWalletId(null);
            }} 
          />
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <GlassCard variant="gold" className="text-center">
                <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Balance</h2>
                <div className="text-3xl font-bold mb-1">{formatCurrency(totalBalance)}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <span>{wallets?.length ? `Across ${wallets.length} wallet${wallets.length > 1 ? 's' : ''}` : 'No wallets yet'}</span>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Your Wallets</h2>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gold/20 text-foreground hover:bg-gold/10"
                  onClick={() => createWalletMutation.mutate()}
                  disabled={createWalletMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wallet
                </Button>
              </div>
              
              <div className="space-y-3">
                {isLoadingWallets ? (
                  <div className="py-10 text-center">
                    <div className="animate-pulse text-muted-foreground">Loading wallets...</div>
                  </div>
                ) : wallets && wallets.length > 0 ? (
                  wallets.map((wallet, index) => {
                    const walletInUse = isWalletInUse(wallet.id);
                    const walletInUseInfo = getWalletInUseInfo(wallet.id);
                    const isContractWallet = walletInUseInfo?.botType === 'contract';
                    const hasAnimatedBalance = walletInUse && animatedBalances[wallet.id] !== undefined;
                    
                    return (
                      <GlassCard 
                        key={wallet.id}
                        variant="dark"
                        className={`flex justify-between items-center cursor-pointer hover:bg-card/90 ${walletInUse ? 'border border-red-500' : ''}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                        onClick={() => handleWalletClick(wallet.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                            {wallet.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{wallet.name}</div>
                            <div className="text-sm text-muted-foreground">Created: {new Date(wallet.created_at).toLocaleDateString()}</div>
                            {walletInUse && (
                              <div className="flex items-center text-xs text-red-500 mt-1">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                <span>In use by {walletInUseInfo?.botName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-3">
                            <div className={`font-medium ${hasAnimatedBalance ? 'animate-pulse' : ''}`}>
                              {hasAnimatedBalance 
                                ? formatCurrency(animatedBalances[wallet.id]) 
                                : formatCurrency(wallet.balance || 0)
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Available
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-gold/10"
                              onClick={(e) => handleTransferClick(wallet.id, e)}
                              disabled={walletInUse}
                            >
                              <ArrowRightLeft className={`h-4 w-4 ${walletInUse ? 'text-muted-foreground' : 'text-gold'}`} />
                            </Button>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })
                ) : (
                  <GlassCard variant="dark" className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">You don't have any wallets yet</p>
                    <Button 
                      variant="outline" 
                      className="border-gold/20 text-foreground hover:bg-gold/10"
                      onClick={() => createWalletMutation.mutate()}
                      disabled={createWalletMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Wallet
                    </Button>
                  </GlassCard>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
