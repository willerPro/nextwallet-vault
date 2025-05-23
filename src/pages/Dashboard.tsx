
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, EyeOff, Send, Upload, TrendingUp, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { TransactionDetailsModal, TransactionDetailsProps } from "@/components/TransactionDetailsModal";

type Transaction = {
  id: string;
  type: 'send' | 'receive' | 'buy' | 'sell';
  amount: number;
  coin_symbol: string;
  created_at: string;
  value_usd?: number | string;
  from_address?: string;
  to_address?: string;
  status: "pending" | "completed" | "failed";
  tx_hash?: string;
};

type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  name: string;
  created_at: string;
  isInUse?: boolean;
  isContractBot?: boolean;
};

type ArbitrageOperation = {
  id: string;
  user_id: string;
  wallet_id: string;
  transactions_per_second: number;
  is_active: boolean;
  started_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[] | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [wallets, setWallets] = useState<Wallet[] | null>(null);
  const [activeArbitrage, setActiveArbitrage] = useState<ArbitrageOperation | null>(null);
  const [isLoadingArbitrage, setIsLoadingArbitrage] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailsProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalReceived, setTotalReceived] = useState(0);
  const [profit, setProfit] = useState(0);
  const [isLoadingProfit, setIsLoadingProfit] = useState(true);
  const [hasActiveContractBot, setHasActiveContractBot] = useState(false);

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

    const fetchWallets = async () => {
      if (!user) return;

      setIsLoadingBalance(true);
      try {
        // Get wallets
        const { data: walletsData, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id);

        if (walletsError) {
          console.error("Error fetching wallets:", walletsError);
          return;
        }
        
        if (!walletsData || walletsData.length === 0) {
          setWallets([]);
          setTotalBalance(0);
          return;
        }
        
        // Check for active contract bots
        const { data: contractData, error: contractError } = await supabase
          .from('contract_api_settings')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
          
        if (contractError) {
          console.error("Error fetching contract bot settings:", contractError);
        }
        
        // Check for active arbitrage operations
        const { data: arbitrageData, error: arbitrageError } = await supabase
          .from('arbitrage_operations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
          
        if (arbitrageError) {
          console.error("Error fetching arbitrage operations:", arbitrageError);
        }
        
        // Mark wallets that are in use
        const enhancedWallets = walletsData.map(wallet => {
          const isUsedByContract = contractData?.some(contract => contract.wallet_id === wallet.id) || false;
          const isUsedByArbitrage = arbitrageData?.some(arbitrage => arbitrage.wallet_id === wallet.id) || false;
          
          return {
            ...wallet,
            isInUse: isUsedByContract || isUsedByArbitrage,
            isContractBot: isUsedByContract
          };
        });
        
        setWallets(enhancedWallets as Wallet[]);
        
        const total = enhancedWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
        setTotalBalance(total);
        
        // Check if any contract bot is active
        setHasActiveContractBot(!!contractData && contractData.length > 0);
        
      } finally {
        setIsLoadingBalance(false);
      }
    };

    const fetchArbitrageStatus = async () => {
      if (!user) return;
      
      setIsLoadingArbitrage(true);
      try {
        const { data, error } = await supabase
          .from('arbitrage_operations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error("Error fetching arbitrage operations:", error);
        } else if (data) {
          setActiveArbitrage(data as ArbitrageOperation);
        }
      } finally {
        setIsLoadingArbitrage(false);
      }
    };

    const fetchProfitData = async () => {
      if (!user) return;
      
      setIsLoadingProfit(true);
      try {
        // Fetch all buy and receive transactions
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .in('type', ['buy', 'receive']);

        if (error) {
          console.error("Error fetching profit data:", error);
        } else if (data) {
          // Calculate total amount received/bought
          const totalAmount = data.reduce((sum, tx) => {
            if (tx.status === 'completed') {
              return sum + (typeof tx.value_usd === 'number' ? tx.value_usd : Number(tx.value_usd) || 0);
            }
            return sum;
          }, 0);
          
          setTotalReceived(totalAmount);
        }
      } finally {
        setIsLoadingProfit(false);
      }
    };

    fetchTransactions();
    fetchWallets();
    fetchArbitrageStatus();
    fetchProfitData();
  }, [user]);

  // Calculate profit whenever total balance or total received changes
  useEffect(() => {
    const calculatedProfit = totalBalance - totalReceived;
    setProfit(calculatedProfit);
  }, [totalBalance, totalReceived]);

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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction as TransactionDetailsProps);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
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
          <GlassCard className={`bg-black border border-gold/30 p-4`}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-gold">
                Total Balance {/* hasActiveContractBot && <span className="text-xs">(Bot Active)</span> */}
              </h2>
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
              <div className="text-2xl font-bold my-1 text-white">
                {formatBalance(totalBalance)}
              </div>
            )}
            
            {/* Profit/Loss Display */}
            {!isLoadingProfit && (
              <div className="flex items-center mb-2">
                <TrendingUp className={`h-4 w-4 mr-1 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs font-medium ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {hideBalance ? "••••••" : `${profit >= 0 ? '+' : ''}$${profit.toLocaleString()} profit`}
                </span>
              </div>
            )}
            
            {/* Temporarily commenting out the contract bot warning
            {hasActiveContractBot && (
              <div className="flex items-center mt-1 mb-2">
                <Bot className="h-4 w-4 mr-1 text-red-400" />
                <span className="text-xs text-red-400">
                  Contract Bot Active - Use caution with connected wallets
                </span>
              </div>
            )}
            */}
            
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

        {activeArbitrage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <GlassCard className="bg-black border border-primary/30 p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-primary">Active Arbitrage Bot</h2>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                Arbitrage bot running at {activeArbitrage.transactions_per_second} TPS
              </p>
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-full bg-transparent border border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => navigate('/arbitrage')}
              >
                Manage Bot
              </Button>
            </GlassCard>
          </motion.div>
        )}

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
                  className="p-3 flex justify-between items-center bg-black border border-gold/10 cursor-pointer hover:border-gold/30 transition-colors"
                  onClick={() => handleTransactionClick(tx)}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${tx.type === 'send' || tx.type === 'sell' ? 'bg-black border border-red-500/30' : 'bg-black border border-green-500/30'} flex items-center justify-center mr-3`}>
                      {tx.type === 'send' || tx.type === 'sell' ? (
                        <ArrowUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === 'send' ? 'Sent' : 
                         tx.type === 'receive' ? 'Received' :
                         tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.coin_symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'send' || tx.type === 'sell' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'send' || tx.type === 'sell' ? '-' : '+'}{tx.amount?.toString()}
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

      <TransactionDetailsModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Dashboard;
