import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, EyeOff, Send, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";

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
  const { profile } = useProfile(user);
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
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id);

          if (walletError) {
            console.error("Error fetching wallet balance:", walletError);
          } else if (walletData && walletData.length > 0) {
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

  const formatBalance = (value: number) => {
    return hideBalance ? "••••••" : `$${value.toLocaleString()}`;
  };

  const getInitials = () => {
    if (!profile) return '?';
    const nameParts = profile.full_name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return profile.full_name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen w-full pb-20">
      <motion.div
        className="p-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border-2 border-gold">
            <AvatarFallback className="bg-black text-gold text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h2 className="text-sm font-bold">{profile?.full_name || 'User'}</h2>
            <p className="text-xs text-muted-foreground">{profile?.email || ''}</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 px-4 space-y-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard className="bg-black border border-gold/30 p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-gold">Total Balance</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleBalanceVisibility}
                className="h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 border border-gold/20"
              >
                {hideBalance ? <EyeOff className="h-3 w-3 text-gold" /> : <Eye className="h-3 w-3 text-gold" />}
              </Button>
            </div>
            {isLoadingBalance ? (
              <div className="text-2xl font-bold my-1 animate-pulse">Loading...</div>
            ) : (
              <div className="text-2xl font-bold my-1 text-white">{formatBalance(totalBalance)}</div>
            )}
            
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-transparent border border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => navigate('/send')}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-transparent border border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => navigate('/receive')}
              >
                <Upload className="h-4 w-4 mr-1" />
                Receive
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-4"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
            <Button variant="link" className="text-gold p-0 h-auto text-sm" onClick={() => navigate('/transactions')}>
              See All
            </Button>
          </div>

          {isLoadingTransactions ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <GlassCard 
                  key={index} 
                  variant="dark" 
                  className="p-3 flex justify-between items-center animate-pulse bg-black/40 border border-white/5"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-black/50 mr-3"></div>
                    <div>
                      <div className="h-3 w-16 bg-black/50 rounded"></div>
                      <div className="h-2 w-12 bg-black/40 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-3 w-12 bg-black/50 rounded"></div>
                </GlassCard>
              ))}
            </div>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.slice(0, 3).map((tx, index) => (
                <GlassCard 
                  key={index} 
                  className="p-3 flex justify-between items-center bg-black border border-gold/10"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${tx.type === 'send' ? 'bg-black border border-red-500/30' : 'bg-black border border-green-500/30'} flex items-center justify-center mr-3`}>
                      {tx.type === 'send' ? (
                        <ArrowUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.type === 'send' ? 'Sent' : 'Received'} {tx.coin_symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'send' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount?.toString()}
                  </p>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-5 text-center bg-black border border-gold/10">
              <p className="text-muted-foreground">No transactions yet</p>
              <Button 
                variant="outline" 
                className="mt-3 border-gold/20 text-gold hover:bg-gold/10"
                onClick={() => navigate('/send')}
              >
                Start Transaction
              </Button>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
