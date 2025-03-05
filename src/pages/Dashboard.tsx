
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Transaction = {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  coin_symbol: string;
  created_at: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[] | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setIsLoadingTransactions(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setRecentTransactions(data as Transaction[]);
        }
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    const fetchBalance = async () => {
      if (!user) return;

      setIsLoadingBalance(true);
      try {
        // Fetch user balance from the wallet table
        const { data, error } = await supabase
          .from('user_balances')
          .select('total_balance')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching balance:", error);
        } else if (data) {
          setTotalBalance(data.total_balance || 0);
        } else {
          // Fallback to wallets table if user_balances doesn't exist or has no data
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id);

          if (walletError) {
            console.error("Error fetching wallet balance:", walletError);
          } else if (walletData && walletData.length > 0) {
            // Sum up all wallet balances
            const total = walletData.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
            setTotalBalance(total);
          }
        }
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchTransactions();
    fetchBalance();
  }, [user]);

  const toggleBalanceVisibility = () => {
    setHideBalance(!hideBalance);
  };

  // Function to format balance display
  const formatBalance = (value: number) => {
    return hideBalance ? "••••••" : `$${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold">Dashboard</h1>
        {/* Add any user-specific info or actions here */}
      </motion.header>

      <div className="flex-1 px-4 space-y-6">
        {/* Total Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="relative">
            <div className="absolute right-4 top-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleBalanceVisibility}
                className="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20"
              >
                {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-center py-2">
              <h2 className="text-sm font-medium text-muted-foreground">Total Balance</h2>
              {isLoadingBalance ? (
                <div className="text-3xl font-bold my-3 animate-pulse">Loading...</div>
              ) : (
                <div className="text-3xl font-bold my-3">{formatBalance(totalBalance)}</div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <GlassCard 
              variant="dark" 
              className="p-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/send')}
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <ArrowUp className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium">Send</p>
            </GlassCard>
            
            <GlassCard 
              variant="dark" 
              className="p-4 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/receive')}
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <ArrowDown className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium">Receive</p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Button variant="link" className="text-gold" onClick={() => navigate('/transactions')}>
              See All
            </Button>
          </div>

          {isLoadingTransactions ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <GlassCard 
                  key={index} 
                  variant="dark" 
                  className="p-4 flex justify-between items-center animate-pulse"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700/50 mr-3"></div>
                    <div>
                      <div className="h-4 w-20 bg-gray-700/50 rounded"></div>
                      <div className="h-3 w-16 bg-gray-700/30 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-700/50 rounded"></div>
                </GlassCard>
              ))}
            </div>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.slice(0, 3).map((tx, index) => (
                <GlassCard 
                  key={index} 
                  variant="dark" 
                  className="p-4 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full ${tx.type === 'send' ? 'bg-red-500/20' : 'bg-green-500/20'} flex items-center justify-center mr-3`}>
                      {tx.type === 'send' ? (
                        <ArrowUp className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type === 'send' ? 'Sent' : 'Received'} {tx.coin_symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${tx.type === 'send' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount?.toString()}
                  </p>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard variant="dark" className="p-6 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <Button 
                variant="outline" 
                className="mt-3 border-gold/20 text-foreground hover:bg-gold/10"
                onClick={() => navigate('/send')}
              >
                Send Crypto
              </Button>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
