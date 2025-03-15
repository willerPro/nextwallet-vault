import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { CircleDot, Wallet, Play, Pause, Gauge, Info } from 'lucide-react';
import ContractApiSettings from '@/components/arbitrage/ContractApiSettings';

// Transaction per second options
const TPS_OPTIONS = [100, 1000, 10000, "MAX"];

// Minimum balance required to operate the arbitrage bot
const MINIMUM_BALANCE = 2500;

// Local storage key for countdown
const COUNTDOWN_STORAGE_KEY = 'arbitrage_countdown';
const OPERATION_ID_STORAGE_KEY = 'arbitrage_operation_id';

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
  const [activeOperations, setActiveOperations] = useState<any[]>([]);

  // Load countdown from localStorage on component mount
  useEffect(() => {
    const savedCountdown = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    const savedOperationId = localStorage.getItem(OPERATION_ID_STORAGE_KEY);
    
    if (savedCountdown) {
      const countdownValue = parseInt(savedCountdown, 10);
      const expireTime = parseInt(localStorage.getItem('countdown_expire_time') || '0', 10);
      
      // Calculate remaining time
      if (expireTime > Date.now()) {
        const remainingTime = Math.floor((expireTime - Date.now()) / 1000);
        setCountdown(remainingTime > 0 ? remainingTime : 0);
      } else {
        // Countdown has expired, clear it
        localStorage.removeItem(COUNTDOWN_STORAGE_KEY);
        localStorage.removeItem('countdown_expire_time');
        setCountdown(0);
      }
    }
    
    if (savedOperationId) {
      setOperationId(savedOperationId);
    }
  }, []);

  // Check if user has any active arbitrage operations
  useEffect(() => {
    if (user) {
      const checkActiveOperations = async () => {
        try {
          // First, check for the user's own active operation
          const { data: userOperation, error: userOpError } = await supabase
            .from('arbitrage_operations')
            .select('id, wallet_id, transactions_per_second, started_at')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();
          
          if (userOpError && userOpError.code !== 'PGRST116') {
            console.error('Error checking active operations:', userOpError);
          }
          
          if (userOperation) {
            // User has an active operation
            setOperationId(userOperation.id);
            localStorage.setItem(OPERATION_ID_STORAGE_KEY, userOperation.id);
            setSelectedWallet(userOperation.wallet_id);
            setSelectedTPS(userOperation.transactions_per_second);
            setIsRunning(true);
            
            // Fetch wallet balance
            fetchWalletBalance(userOperation.wallet_id);
          }
          
          // Get all active operations for display
          const { data: allOperations, error: allOpError } = await supabase
            .from('arbitrage_operations')
            .select(`
              id, 
              started_at, 
              transactions_per_second,
              wallets (name, balance)
            `)
            .eq('is_active', true)
            .order('started_at', { ascending: false });
          
          if (allOpError) {
            console.error('Error fetching all operations:', allOpError);
            return;
          }
          
          if (allOperations) {
            setActiveOperations(allOperations);
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

  // Check if the wallet has sufficient balance
  const hasSufficientBalance = () => {
    return walletBalance >= MINIMUM_BALANCE;
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
    
    // Check for minimum balance requirement
    if (!hasSufficientBalance()) {
      toast.error(`Insufficient funds. Minimum balance of ${formatCurrency(MINIMUM_BALANCE)} is required to operate the bot.`);
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
          is_active: true,
          started_at: new Date().toISOString()
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
        localStorage.setItem(OPERATION_ID_STORAGE_KEY, data.id);
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
    const thirtyMinutesInSeconds = 30 * 60;
    setCountdown(thirtyMinutesInSeconds); // 30 minutes in seconds
    
    // Save countdown value to localStorage with expiration time
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, thirtyMinutesInSeconds.toString());
    
    // Set expiration time (30 minutes from now)
    const expireTime = Date.now() + (thirtyMinutesInSeconds * 1000);
    localStorage.setItem('countdown_expire_time', expireTime.toString());
    
    toast.info("Arbitrage will stop in 30 minutes", {
      description: "The system is preparing to complete all pending transactions"
    });
  };

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          // Countdown finished, actually stop the arbitrage
          completeStopArbitrage();
          // Clear localStorage values
          localStorage.removeItem(COUNTDOWN_STORAGE_KEY);
          localStorage.removeItem('countdown_expire_time');
          localStorage.removeItem(OPERATION_ID_STORAGE_KEY);
          return 0;
        }
        
        // Save updated countdown to localStorage
        localStorage.setItem(COUNTDOWN_STORAGE_KEY, newValue.toString());
        return newValue;
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
      // Clear localStorage values
      localStorage.removeItem(OPERATION_ID_STORAGE_KEY);
      localStorage.removeItem(COUNTDOWN_STORAGE_KEY);
      localStorage.removeItem('countdown_expire_time');
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

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Arbitrage Trading Bot</h1>
      
      {/* Active Operations Section */}
      {activeOperations.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-4 mb-6 border border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Active Arbitrage Operations</h2>
          </div>
          
          <div className="space-y-3">
            {activeOperations.map((operation) => (
              <div key={operation.id} className="bg-background rounded p-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      Wallet: {operation.wallets?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started: {formatDate(operation.started_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full w-2 h-2 bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-medium">
                      Running at {operation.transactions_per_second} TPS
                    </span>
                    {operation.wallets?.balance && (
                      <span className="text-sm font-medium">
                        {formatCurrency(operation.wallets.balance)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Animated Dot Section */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div 
            className={`absolute w-4 h-4 rounded-full bg-primary ${
              isRunning 
                ? 'animate-[pulse_1.5s_ease-in-out_infinite] scale-[3]' 
                : ''
            } transition-all duration-700`}
          />
          {isRunning && (
            <CircleDot className="absolute h-32 w-32 text-primary/20 animate-pulse" />
          )}
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
            
            {selectedWallet && !hasSufficientBalance() && (
              <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
                <p className="text-sm font-medium">
                  Insufficient funds! The selected wallet needs at least {formatCurrency(MINIMUM_BALANCE)} to operate even with 100 TPS.
                </p>
              </div>
            )}
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
                  disabled={!hasSufficientBalance()}
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
            disabled={!selectedWallet || !selectedTPS || !hasSufficientBalance()}
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
      
      {/* Contract API Settings Section */}
      {wallets.length > 0 && <ContractApiSettings wallets={wallets} />}
      
      {/* Information Section - Made Smaller */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-1">How it works</h3>
        <p className="text-xs text-muted-foreground">
          The arbitrage bot monitors price discrepancies across exchanges and executes trades
          to profit from these differences. Each transaction increases your balance by approximately 0.0028 cents.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          When stopping the bot, a 30-minute cooldown period is required to properly close all positions.
          A minimum balance of {formatCurrency(MINIMUM_BALANCE)} is needed to operate the bot.
        </p>
      </div>
    </div>
  );
};

export default ArbitragePage;
