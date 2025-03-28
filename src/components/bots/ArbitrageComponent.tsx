
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Power, AlertTriangle } from 'lucide-react';

interface ArbitrageComponentProps {
  wallets: any[];
}

const ArbitrageComponent = ({ wallets }: ArbitrageComponentProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOperationActive, setIsOperationActive] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [transactionsPerSecond, setTransactionsPerSecond] = useState(1);
  const [operationData, setOperationData] = useState<any>(null);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // Fetch existing arbitrage operation if available
  useEffect(() => {
    if (user) {
      const fetchArbitrageOperation = async () => {
        try {
          const { data, error } = await supabase
            .from('arbitrage_operations')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();
            
          if (error) {
            console.error('Error fetching arbitrage operation:', error);
            return;
          }
          
          if (data) {
            setOperationData(data);
            setSelectedWallet(data.wallet_id);
            setTransactionsPerSecond(data.transactions_per_second);
            setIsOperationActive(data.is_active);
          }
        } catch (error) {
          console.error('Error in fetch arbitrage operation:', error);
        }
      };
      
      fetchArbitrageOperation();
    }
  }, [user]);

  // Handle animation effect for active arbitrage operation
  useEffect(() => {
    if (isOperationActive && selectedWallet) {
      // Find selected wallet's balance
      const selectedWalletData = wallets.find(w => w.id === selectedWallet);
      const startingBalance = selectedWalletData?.balance || 100;
      
      let lastTimestamp = 0;
      let currentAmount = startingBalance;
      let direction = -1; // Start by decreasing
      let phaseTime = 0; // Track time in current phase

      // Animation function
      const animate = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        phaseTime += delta;
        
        // Change direction occasionally
        if (phaseTime > 2000) { // Change direction every ~2 seconds
          direction = Math.random() > 0.5 ? 1 : -1;
          phaseTime = 0;
        }
        
        // Calculate new amount with fluctuation (less volatile than contract bot)
        const change = Math.random() * 0.1 * direction;
        currentAmount = Math.max(0, currentAmount + change);
        
        setAnimatedBalance(currentAmount);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      // Start animation
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Cleanup animation on unmount or when inactive
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      // If not active, just show static amounts
      const selectedWalletData = wallets.find(w => w.id === selectedWallet);
      setAnimatedBalance(selectedWalletData?.balance || 0);
    }
  }, [isOperationActive, selectedWallet, wallets]);

  // Toggle arbitrage operation
  const toggleArbitrageOperation = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    if (!selectedWallet && !isOperationActive) {
      toast.error("Please select a wallet");
      return;
    }
    
    try {
      if (isOperationActive) {
        // Stop operation
        const { error } = await supabase
          .from('arbitrage_operations')
          .update({
            is_active: false,
            stopped_at: new Date().toISOString()
          })
          .eq('id', operationData.id);
          
        if (error) {
          console.error('Error stopping arbitrage operation:', error);
          toast.error("Failed to stop arbitrage operation");
          return;
        }
        
        toast.success("Arbitrage operation stopped");
        setIsOperationActive(false);
      } else {
        // Start operation
        const operationPayload = {
          user_id: user.id,
          wallet_id: selectedWallet,
          transactions_per_second: transactionsPerSecond,
          is_active: true,
          started_at: new Date().toISOString()
        };
        
        // Check if we're updating or creating
        if (operationData) {
          const { error } = await supabase
            .from('arbitrage_operations')
            .update(operationPayload)
            .eq('id', operationData.id);
            
          if (error) {
            console.error('Error updating arbitrage operation:', error);
            toast.error("Failed to update arbitrage operation");
            return;
          }
        } else {
          const { error } = await supabase
            .from('arbitrage_operations')
            .insert(operationPayload);
            
          if (error) {
            console.error('Error creating arbitrage operation:', error);
            toast.error("Failed to create arbitrage operation");
            return;
          }
        }
        
        toast.success("Arbitrage operation started");
        setIsOperationActive(true);
      }
    } catch (error) {
      console.error('Error toggling arbitrage operation:', error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wallet-selection">Select Wallet</Label>
        <Select 
          value={selectedWallet || ""} 
          onValueChange={setSelectedWallet}
          disabled={isOperationActive}
        >
          <SelectTrigger id="wallet-selection">
            <SelectValue placeholder="Select a wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map(wallet => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name} (${wallet.balance})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="transactions-per-second">Transactions Per Second</Label>
        <Input 
          id="transactions-per-second"
          type="number" 
          min={1}
          max={10}
          value={transactionsPerSecond}
          onChange={(e) => setTransactionsPerSecond(Number(e.target.value))}
          disabled={isOperationActive}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Higher values may increase profits but also increase risks
        </p>
      </div>
      
      <Button 
        className="w-full" 
        onClick={toggleArbitrageOperation}
        variant={isOperationActive ? "destructive" : "default"}
      >
        <Power className="mr-2 h-5 w-5" />
        {isOperationActive ? 'Stop Arbitrage' : 'Start Arbitrage'}
      </Button>
      
      {isOperationActive && (
        <div className="mt-4 p-3 bg-secondary/20 rounded-md border border-red-500">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                Arbitrage is active. The system is performing {transactionsPerSecond} transactions per second.
              </p>
              <div className="mt-2">
                <Label className="text-xs">Current Balance</Label>
                <div className="text-sm font-medium animate-pulse">
                  ${animatedBalance.toFixed(2)}
                </div>
                <p className="text-xs text-red-500 mt-1">
                  Wallet in use - Do not perform any other actions on this wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArbitrageComponent;
