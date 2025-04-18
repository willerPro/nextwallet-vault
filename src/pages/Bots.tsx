
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AddThirdPartyModal from '@/components/bots/AddThirdPartyModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ThirdPartyApplication } from '@/types/wallet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const Bots = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [botToToggle, setBotToToggle] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [animatedBalances, setAnimatedBalances] = useState<Record<string, number>>({});
  
  // Fetch wallets for passing to components
  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error fetching wallets:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch contract API settings
  const { data: contractApiSettings, refetch: refetchContractApi } = useQuery({
    queryKey: ['contract_api_settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_api_settings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contract API settings:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Fetch arbitrage operations
  const { data: arbitrageOperations, refetch: refetchArbitrage } = useQuery({
    queryKey: ['arbitrage_operations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('arbitrage_operations')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching arbitrage operations:', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });
  
  // Fetch third-party applications
  const { data: applications = [], refetch: refetchApps } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('third_party_applications')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Add default system bots
  const allBots = [
    {
      id: 'contract-api',
      name: 'Contract API',
      type: 'system',
      is_active: contractApiSettings?.is_active || false,
      income: 0,
      wallet_id: contractApiSettings?.wallet_id || null,
    },
    {
      id: 'arbitrage',
      name: 'Arbitrage System',
      type: 'system',
      is_active: arbitrageOperations?.is_active || false,
      income: 0,
      wallet_id: arbitrageOperations?.wallet_id || null,
    },
    ...applications.map((app: ThirdPartyApplication) => ({
      id: app.id,
      name: app.name,
      type: 'third-party',
      is_active: app.is_active || false,
      income: 0, // This would be fetched from a separate table in a real implementation
      wallet_id: app.wallet_id || null,
    })),
  ];

  // Animation effect for active contract bots
  useEffect(() => {
    const activeContractBot = allBots.find(b => b.id === 'contract-api' && b.is_active);
    const activeArbitrageBot = allBots.find(b => b.id === 'arbitrage' && b.is_active);
    
    if ((activeContractBot || activeArbitrageBot) && wallets.length > 0) {
      // Start animations for active bots
      const newAnimatedBalances = { ...animatedBalances };
      
      if (activeContractBot?.wallet_id) {
        const contractWallet = wallets.find(w => w.id === activeContractBot.wallet_id);
        if (contractWallet) {
          newAnimatedBalances[contractWallet.id] = contractWallet.balance;
        }
      }
      
      if (activeArbitrageBot?.wallet_id) {
        const arbitrageWallet = wallets.find(w => w.id === activeArbitrageBot.wallet_id);
        if (arbitrageWallet) {
          newAnimatedBalances[arbitrageWallet.id] = arbitrageWallet.balance;
        }
      }
      
      setAnimatedBalances(newAnimatedBalances);
      
      // Set up animation frame
      let lastTimestamp = 0;
      
      const animate = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        const updatedBalances = { ...newAnimatedBalances };
        let hasChanges = false;
        
        // Update each animated balance
        Object.keys(updatedBalances).forEach(walletId => {
          const isContractWallet = activeContractBot?.wallet_id === walletId;
          
          if (isContractWallet || activeArbitrageBot?.wallet_id === walletId) {
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
  }, [allBots, wallets]);

  const handleBotClick = (botId: string) => {
    navigate(`/bots/${botId}`);
  };

  const handleToggleBot = async () => {
    if (!botToToggle || !user) return;
    
    setIsConnecting(true);
    const bot = allBots.find(b => b.id === botToToggle);
    
    if (!bot) {
      setIsConnecting(false);
      return;
    }
    
    try {
      const newStatus = !bot.is_active;
      const action = newStatus ? 'connected' : 'disconnected';
      
      if (bot.type === 'third-party') {
        // Update third-party application
        const { error } = await supabase
          .from('third_party_applications')
          .update({ is_active: newStatus })
          .eq('id', bot.id)
          .eq('user_id', user.id);
          
        if (error) {
          throw new Error(error.message);
        }
        await refetchApps();
      } else if (bot.id === 'contract-api') {
        // Check if contract API settings exist and get the most recent one
        const { data: existingSettings } = await supabase
          .from('contract_api_settings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (existingSettings) {
          // Update existing settings - use id to ensure we update the correct record
          const { error } = await supabase
            .from('contract_api_settings')
            .update({ is_active: newStatus })
            .eq('id', existingSettings.id)
            .eq('user_id', user.id);
            
          if (error) {
            throw new Error(error.message);
          }
        } else {
          // Create new settings
          const { error } = await supabase
            .from('contract_api_settings')
            .insert({
              user_id: user.id,
              is_active: newStatus,
              api_key: '', // Default empty values
              api_secret: '',
              wallet_id: null,
            });
            
          if (error) {
            throw new Error(error.message);
          }
        }
        await refetchContractApi();
      } else if (bot.id === 'arbitrage') {
        // Check if arbitrage operations exist
        const { data: existingOperations } = await supabase
          .from('arbitrage_operations')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (existingOperations) {
          // Update existing operations
          const { error } = await supabase
            .from('arbitrage_operations')
            .update({
              is_active: newStatus,
              ...(newStatus ? { started_at: new Date().toISOString() } : { stopped_at: new Date().toISOString() })
            })
            .eq('id', existingOperations.id)
            .eq('user_id', user.id);
            
          if (error) {
            throw new Error(error.message);
          }
        } else {
          // Create new operations
          const { error } = await supabase
            .from('arbitrage_operations')
            .insert({
              user_id: user.id,
              is_active: newStatus,
              transactions_per_second: 1, // Default value
              wallet_id: null,
              ...(newStatus ? { started_at: new Date().toISOString() } : { stopped_at: new Date().toISOString() })
            });
            
          if (error) {
            throw new Error(error.message);
          }
        }
        await refetchArbitrage();
      }
      
      toast.success(`Bot successfully ${action}`);
    } catch (error) {
      console.error('Error toggling bot status:', error);
      toast.error('Failed to update bot status');
    } finally {
      setIsConnecting(false);
      setIsDialogOpen(false);
      setBotToToggle(null);
    }
  };

  // Find wallet details for a bot
  const getWalletDetails = (walletId: string | null) => {
    if (!walletId) return null;
    return wallets.find(w => w.id === walletId);
  };

  // Function to refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      refetchApps(),
      refetchContractApi(),
      refetchArbitrage()
    ]);
  };

  // Refresh data when component mounts
  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user]);

  return (
    <div className="container max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bots & Integrations</h1>
          <p className="text-muted-foreground">Manage your connected trading bots and services</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="secondary" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Connect
        </Button>
      </header>

      <div className="space-y-3">
        {allBots.map((bot) => {
          const walletDetails = getWalletDetails(bot.wallet_id);
          const isActive = bot.is_active;
          const walletId = bot.wallet_id;
          
          // Determine if this is a contract bot for special styling
          const isContractBot = bot.id === 'contract-api';
          const hasAnimatedBalance = isActive && walletId && animatedBalances[walletId];
          
          return (
            <Card 
              key={bot.id} 
              className={`p-4 hover:bg-secondary/10 transition-colors cursor-pointer ${isActive && isContractBot ? 'border-red-500 border' : ''}`}
              onClick={() => handleBotClick(bot.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{bot.name}</h3>
                  <span className={`text-xs ${bot.is_active ? 'text-green-500' : 'text-yellow-500'}`}>
                    {bot.is_active ? 'Running' : 'Stopped'}
                  </span>
                  {isActive && walletDetails && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Connected to: {walletDetails.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Income</span>
                  <span className={`font-medium ${hasAnimatedBalance ? 'animate-pulse' : ''}`}>
                    {hasAnimatedBalance 
                      ? `$${animatedBalances[walletId].toFixed(2)}`
                      : walletDetails 
                        ? `$${walletDetails.balance.toFixed(2)}` 
                        : `$${bot.income.toFixed(2)}`
                    }
                  </span>
                  
                  {isActive && isContractBot && (
                    <div className="flex items-center text-xs text-red-500 mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Wallet in use
                    </div>
                  )}
                  
                  <AlertDialog open={isDialogOpen && botToToggle === bot.id} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-xs h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBotToToggle(bot.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        {bot.is_active ? 'Disconnect' : 'Connect'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {bot.is_active ? 'Disconnect Bot' : 'Connect Bot'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {bot.is_active 
                            ? `Are you sure you want to disconnect ${bot.name}? This will stop all trading activities from this bot.`
                            : `Are you sure you want to connect ${bot.name}? This will allow this bot to perform trading activities.`
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBotToToggle(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleToggleBot} 
                          disabled={isConnecting}
                        >
                          {bot.is_active ? 'Disconnect' : 'Connect'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AddThirdPartyModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        wallets={wallets}
      />
    </div>
  );
};

export default Bots;
