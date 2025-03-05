
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Logo } from "@/components/Logo";
import { ArrowUpRight, Plus, Clock, Send, Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TransactionList, Transaction } from "@/components/TransactionList";
import { CryptoAssetsList, CryptoAsset } from "@/components/CryptoAssetsList";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [totalBalance, setTotalBalance] = useState(0);
  const [balanceChange, setBalanceChange] = useState(0);

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error fetching transactions",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Convert any numeric fields to string as required by the Transaction interface
      return data.map(tx => ({
        ...tx,
        amount: String(tx.amount),  // Convert number to string
        value_usd: String(tx.value_usd),  // Convert number to string
      })) as Transaction[];
    },
  });

  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ["crypto-assets"],
    queryFn: async () => {
      // First get all crypto assets
      const { data: cryptoAssets, error: assetsError } = await supabase
        .from("crypto_assets")
        .select("*");
      
      if (assetsError) {
        console.error("Error fetching crypto assets:", assetsError);
        return [];
      }

      // Then get user holdings
      const { data: holdings, error: holdingsError } = await supabase
        .from("user_crypto_holdings")
        .select(`
          *,
          crypto_assets(*)
        `);
      
      if (holdingsError) {
        console.error("Error fetching user holdings:", holdingsError);
        return [];
      }

      // If no holdings, return sample data for demonstration
      if (!holdings || holdings.length === 0) {
        // Return top assets with zero balance for demo
        return cryptoAssets.slice(0, 4).map(asset => ({
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          balance: Math.random() * 0.5, // Small random balance for demo
          price: parseFloat(asset.current_price),
          priceChange: parseFloat(asset.price_change_24h),
          logo_url: asset.logo_url
        }));
      }

      // Map holdings to the format we need
      return holdings.map(holding => {
        const asset = holding.crypto_assets;
        return {
          id: String(holding.id),  // Convert to string if needed
          symbol: asset.symbol,
          name: asset.name,
          balance: parseFloat(String(holding.balance)),
          price: parseFloat(String(asset.current_price)),
          priceChange: parseFloat(String(asset.price_change_24h)),
          logo_url: asset.logo_url
        };
      });
    },
  });

  useEffect(() => {
    // Calculate total balance from assets
    if (assets && assets.length > 0) {
      const total = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
      setTotalBalance(total);
      
      // Calculate weighted average change
      const totalValue = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
      const weightedChange = assets.reduce(
        (sum, asset) => sum + (asset.balance * asset.price * asset.priceChange) / totalValue, 
        0
      );
      setBalanceChange(weightedChange || 3.45); // Fallback to sample value if calculation is 0
    }
  }, [assets]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSendClick = () => {
    navigate('/send');
  };

  const handleReceiveClick = () => {
    navigate('/receive');
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Logo />
        <Button variant="outline" size="icon" className="border-gold/20 text-gold">
          <Plus className="h-5 w-5" />
        </Button>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Balance card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="text-center">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Balance</h2>
            <div className="text-3xl font-bold mb-1">${totalBalance.toLocaleString()}</div>
            <div className="text-sm text-green-400 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{balanceChange.toFixed(2)}% today</span>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              <Button 
                size="sm" 
                className="bg-gold hover:bg-gold-dark text-primary-foreground"
                onClick={handleSendClick}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-gold/20 text-foreground hover:bg-gold/10"
                onClick={handleReceiveClick}
              >
                <Download className="h-4 w-4 mr-2" />
                Receive
              </Button>
              <Button size="sm" variant="outline" className="border-gold/20 text-foreground hover:bg-gold/10">
                <CreditCard className="h-4 w-4 mr-2" />
                Buy
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Button 
              variant="link" 
              className="text-gold p-0 h-auto"
              onClick={() => navigate('/transactions')}
            >
              View all
            </Button>
          </div>
          
          {isLoadingTransactions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((_, index) => (
                <GlassCard key={index} variant="dark" className="h-16 animate-pulse">
                  <div></div> {/* Empty div as child */}
                </GlassCard>
              ))}
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
