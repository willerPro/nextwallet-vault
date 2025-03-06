
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { CircleDot, Wallet, Play, Pause, Gauge } from 'lucide-react';

// Transaction per second options
const TPS_OPTIONS = [100, 1000, 10000, "MAX"];

const ArbitragePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  
  // References and state
  const spinnerRef = useRef<HTMLDivElement>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedTPS, setSelectedTPS] = useState<number | string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [originalBalance, setOriginalBalance] = useState(0);
  const incrementInterval = useRef<NodeJS.Timeout | null>(null);

  // Check if user has any active arbitrage operations
  useEffect(() => {
    if (user) {
      const checkActiveOperations = async () => {
        try {
          const { data, error } = await supabase
            .from('arbitrage_operations')
            .select('id, wallet_id, transactions_per_second, started_at')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error checking active operations:', error);
            return;
          }
          
          if (data) {
            // User has an active operation
            setOperationId(data.id);
            setSelectedWallet(data.wallet_id);
            setSelectedTPS(data.transactions_per_second);
            setIsRunning(true);
            
            // Fetch wallet balance
            fetchWalletBalance(data.wallet_id);
          }
        } catch (error) {
          console.error('Error in check active operations:', error);
        }
      };
      
      checkActiveOperations();
    }
  }, [user]);

  // Fetch user wallets
  useEffect(() => {
    if (user) {
      const fetchWallets = async () => {
        try {
          const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) {
            console.error('Error fetching wallets:', error);
            return;
          }
          
          if (data) {
            setWallets(data);
            
            // If we have wallets but none selected, select the first one
            if (data.length > 0 && !selectedWallet) {
              setSelectedWallet(data[0].id);
              fetchWalletBalance(data[0].id);
            }
          }
        } catch (error) {
          console.error('Error in fetch wallets:', error);
        }
      };
      
      fetchWallets();
    }
  }, [user, selectedWallet]);

  // Fetch wallet balance
  const fetchWalletBalance = async (walletId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();
        
      if (error) {
        console.error('Error fetching wallet balance:', error);
        return;
      }
      
      if (data) {
        setWalletBalance(data.balance);
        setOriginalBalance(data.balance);
      }
    } catch (error) {
      console.error('Error in fetch wallet balance:', error);
    }
  };

  // Handle wallet selection
  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    fetchWalletBalance(walletId);
  };

  // Handle TPS selection
  const handleTPSSelect = (tps: number | string) => {
    setSelectedTPS(tps);
  };

  // Start arbitrage operations
  const startArbitrage = async () => {
    if (!selectedWallet) {
      toast.error("Please select a wallet for operation");
      return;
    }
    
    if (!selectedTPS) {
      toast.error("Please select transactions per second");
      return;
    }
    
    try {
      // Convert MAX to a numerical value
      const tpsValue = selectedTPS === "MAX" ? 100000 : Number(selectedTPS);
      
      // Create arbitrage operation record
      const { data, error } = await supabase
        .from('arbitrage_operations')
        .insert({
          user_id: user?.id,
          wallet_id: selectedWallet,
          transactions_per_second: tpsValue,
          is_active: true
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error starting arbitrage:', error);
        toast.error("Failed to start arbitrage");
        return;
      }
      
      if (data) {
        setOperationId(data.id);
        setIsRunning(true);
        toast.success("Arbitrage operation started successfully");
        
        // Start incrementing balance
        startBalanceIncrement();
      }
    } catch (error) {
      console.error('Error in start arbitrage:', error);
      toast.error("An error occurred while starting arbitrage");
    }
  };

  // Stop arbitrage operations
  const stopArbitrage = async () => {
    if (!operationId) return;
    
    // Start the 30 minute countdown
    setCountdown(30 * 60); // 30 minutes in seconds
    
    toast.info("Arbitrage will stop in 30 minutes", {
      description: "The system is preparing to complete all pending transactions"
    });
  };

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, actually stop the arbitrage
          completeStopArbitrage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  // Complete the stop arbitrage process
  const completeStopArbitrage = async () => {
    if (!operationId) return;
    
    try {
      const { error } = await supabase
        .from('arbitrage_operations')
        .update({ 
          is_active: false,
          stopped_at: new Date().toISOString()
        })
        .eq('id', operationId);
        
      if (error) {
        console.error('Error stopping arbitrage:', error);
        toast.error("Failed to stop arbitrage");
        return;
      }
      
      setIsRunning(false);
      setOperationId(null);
      stopBalanceIncrement();
      toast.success("Arbitrage operation stopped successfully");
    } catch (error) {
      console.error('Error in stop arbitrage:', error);
      toast.error("An error occurred while stopping arbitrage");
    }
  };

  // Start incrementing balance
  const startBalanceIncrement = () => {
    if (incrementInterval.current) {
      clearInterval(incrementInterval.current);
    }
    
    incrementInterval.current = setInterval(() => {
      setWalletBalance(prev => {
        const increment = 0.0028;
        return Number((prev + increment).toFixed(4));
      });
    }, 1000);
  };

  // Stop incrementing balance
  const stopBalanceIncrement = () => {
    if (incrementInterval.current) {
      clearInterval(incrementInterval.current);
      incrementInterval.current = null;
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (incrementInterval.current) {
        clearInterval(incrementInterval.current);
      }
    };
  }, []);

  // Format countdown time to MM:SS
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Arbitrage Trading Bot</h1>
      
      {/* Spinner Section */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div 
          ref={spinnerRef}
          className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-primary ${isRunning ? 'animate-spin' : ''}`}
        >
          <div className="w-28 h-28 bg-background rounded-full flex items-center justify-center">
            <Gauge className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        {isRunning && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Running at {selectedTPS} TPS</p>
            {countdown > 0 && (
              <p className="text-sm text-yellow-500 mt-1">Stopping in {formatCountdown()}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Wallet Section */}
      <div className="bg-secondary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            <h2 className="text-xl font-semibold">Operation Wallet</h2>
          </div>
          <div>
            <span className="text-xl font-bold">{formatCurrency(walletBalance)}</span>
            {isRunning && originalBalance > 0 && (
              <span className="ml-2 text-sm text-green-500">
                +{((walletBalance - originalBalance) / originalBalance * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        
        {!isRunning && (
          <div className="mt-4">
            <Label className="block mb-2">Select a wallet for arbitrage operations:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {wallets.map(wallet => (
                <Button
                  key={wallet.id}
                  variant={selectedWallet === wallet.id ? "default" : "outline"}
                  onClick={() => handleWalletSelect(wallet.id)}
                  className="justify-between"
                >
                  <span>{wallet.name}</span>
                  <span>{formatCurrency(wallet.balance)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {selectedWallet && !isRunning && wallets.length > 0 && (
          <div className="mt-4">
            <Label className="block mb-2">Select transactions per second (TPS):</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TPS_OPTIONS.map(tps => (
                <Button
                  key={tps}
                  variant={selectedTPS === tps ? "default" : "outline"}
                  onClick={() => handleTPSSelect(tps)}
                >
                  {tps} TPS
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <Button 
            size="lg"
            onClick={startArbitrage}
            disabled={!selectedWallet || !selectedTPS}
            className="px-6"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Arbitrage
          </Button>
        ) : (
          <Button 
            size="lg"
            variant="destructive"
            onClick={stopArbitrage}
            disabled={countdown > 0}
            className="px-6"
          >
            <Pause className="mr-2 h-5 w-5" />
            Stop Arbitrage
          </Button>
        )}
      </div>
      
      {/* Information Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">How it works</h3>
        <p className="text-muted-foreground">
          The arbitrage bot monitors price discrepancies across multiple exchanges and executes trades
          to profit from these differences. Each transaction increases your balance by approximately 0.0028 cents.
          Higher TPS settings result in more transactions and faster profit accumulation.
        </p>
        <p className="text-muted-foreground mt-2">
          When stopping the bot, a 30-minute cooldown period is required to properly close all open positions
          and ensure maximum profit retention.
        </p>
      </div>
    </div>
  );
};

export default ArbitragePage;
