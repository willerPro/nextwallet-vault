
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { transferBetweenWallets } from "@/utils/transactionUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useQueryClient } from "@tanstack/react-query";

interface Wallet {
  id: string;
  name: string;
  balance: number;
}

interface TransferWalletProps {
  currentWalletId: string;
  onClose: () => void;
}

const TransferWallet = ({ currentWalletId, onClose }: TransferWalletProps) => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .neq('id', currentWalletId);
        
        if (error) {
          console.error("Error fetching wallets:", error);
          return;
        }
        
        setWallets(data);
        if (data.length > 0) {
          setSelectedWallet(data[0].id);
        }
      } catch (err) {
        console.error("Error in fetch wallets:", err);
      }
    };
    
    const fetchCurrentWallet = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('id', currentWalletId)
          .single();
        
        if (error) {
          console.error("Error fetching current wallet:", error);
          return;
        }
        
        setCurrentWallet(data);
      } catch (err) {
        console.error("Error in fetch current wallet:", err);
      }
    };
    
    fetchWallets();
    fetchCurrentWallet();
  }, [user, currentWalletId]);

  const handleTransfer = async () => {
    if (!user || !currentWallet || !selectedWallet || !amount) {
      toast.error("Missing required information for transfer");
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    
    if (amountNum > currentWallet.balance) {
      toast.error("Insufficient balance for transfer");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await transferBetweenWallets({
        fromWalletId: currentWalletId,
        toWalletId: selectedWallet,
        amount: amountNum,
        userId: user.id
      });
      
      if (result) {
        // Invalidate and refetch wallets data
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['wallet-details', currentWalletId] });
        
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWallet) {
    return (
      <GlassCard variant="dark" className="p-4">
        <div className="animate-pulse text-center">Loading wallet details...</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="dark" className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold mb-2">
        <ArrowRightLeft className="h-5 w-5 text-gold" />
        <span>Transfer Funds</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            From Wallet
          </label>
          <div className="p-2 border border-border rounded bg-background/30">
            <div className="font-medium">{currentWallet.name}</div>
            <div className="text-sm text-muted-foreground">
              Balance: {formatCurrency(currentWallet.balance)}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Amount to Transfer
          </label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/30"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Available: {formatCurrency(currentWallet.balance)}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            To Wallet
          </label>
          {wallets.length === 0 ? (
            <div className="p-2 border border-border rounded bg-background/30 text-center text-muted-foreground">
              No other wallets available
            </div>
          ) : (
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full p-2 rounded border border-border bg-background/30"
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({formatCurrency(wallet.balance)})
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isLoading || wallets.length === 0 || !amount || parseFloat(amount) <= 0}
            className="bg-gold hover:bg-gold/90 text-black"
          >
            {isLoading ? "Processing..." : "Transfer"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default TransferWallet;
