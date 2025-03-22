
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Power } from 'lucide-react';

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
        <div className="mt-4 p-3 bg-secondary/20 rounded-md">
          <p className="text-sm">
            Arbitrage is active. The system is performing {transactionsPerSecond} transactions per second.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArbitrageComponent;
