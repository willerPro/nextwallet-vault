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
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalBalance, setTotalBalance] = useState("0");
  const [balanceChange, setBalanceChange] = useState(0);

  const { data: userBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_balances")
        .select("total_balance")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user balance:", error);
        return null;
      }
      
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("user_balances")
          .insert({ user_id: user.id, total_balance: 0 })
          .select()
          .single();
        
        if (insertError) {
          console.error("Error creating user balance:", insertError);
          return null;
        }
        
        return newData.total_balance.toString();
      }
      
      return data.total_balance.toString();
    },
    enabled: !!user,
  });

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
      
      return data.map(tx => ({
        ...tx,
        amount: tx.amount.toString(),  // Convert number to string
        value_usd: tx.value_usd.toString(),  // Convert number to string
      })) as Transaction[];
    },
  });

  const { data: assets = [], isLoading: isLoadingAssets } = useQuery({
    queryKey: ["crypto-assets"],
    queryFn: async () => {
      const { data: cryptoAssets, error: assetsError } = await supabase
        .from("crypto_assets")
        .select("*");
      
      if (assetsError) {
        console.error("Error fetching crypto assets:", assetsError);
        return [];
      }

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

      if (!holdings || holdings.length === 0) {
        return cryptoAssets.slice(0, 4).map(asset => ({
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          balance: Math.random() * 0.5,
          price: parseFloat(asset.current_price),
          priceChange: parseFloat(asset.price_change_24h),
          logo_url: asset.logo_url
        }));
      }

      return holdings.map(holding => {
        const asset = holding.crypto_assets;
        return {
          id: String(holding.id),
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
    if (userBalance !== undefined && userBalance !== null) {
      setTotalBalance(userBalance);
    }
  }, [userBalance]);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const totalValue = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
      const weightedChange = assets.reduce(
        (sum, asset) => sum + (asset.balance * asset.price * asset.priceChange) / totalValue, 
        0
      );
      setBalanceChange(weightedChange || 3.45);
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

      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="text-center">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Balance</h2>
            <div className="text-3xl font-bold mb-1">
              ${isLoadingBalance ? "..." : Number(totalBalance).toLocaleString()}
            </div>
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
                  <div></div>
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
