
import { useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Logo } from "@/components/Logo";
import { ArrowUpRight, ArrowDownRight, Plus, Clock, Send, Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const coins = [
  { name: "Bitcoin", symbol: "BTC", balance: 0.0234, value: 1345.67, change: 2.34 },
  { name: "Ethereum", symbol: "ETH", balance: 0.456, value: 876.54, change: -1.23 },
  { name: "Solana", symbol: "SOL", balance: 12.345, value: 234.56, change: 5.67 },
];

const recentTransactions = [
  { 
    id: 1, 
    type: "received", 
    amount: "0.0234 BTC", 
    value: "$1,345.67", 
    from: "0x1a2b...3c4d", 
    date: "2h ago" 
  },
  { 
    id: 2, 
    type: "sent", 
    amount: "0.456 ETH", 
    value: "$876.54", 
    to: "0x5e6f...7g8h", 
    date: "Yesterday" 
  },
  { 
    id: 3, 
    type: "received", 
    amount: "12.345 SOL", 
    value: "$234.56", 
    from: "0x9i0j...1k2l", 
    date: "3d ago" 
  },
];

const Dashboard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <div className="text-3xl font-bold mb-1">$2,456.77</div>
            <div className="text-sm text-green-400 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+5.23% today</span>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary-foreground">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button size="sm" variant="outline" className="border-gold/20 text-foreground hover:bg-gold/10">
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

        {/* Assets */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Your Assets</h2>
            <Button variant="link" className="text-gold p-0 h-auto">
              View all
            </Button>
          </div>
          
          <div className="space-y-3">
            {coins.map((coin, index) => (
              <GlassCard 
                key={coin.symbol}
                variant="dark"
                className="flex justify-between items-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                    {coin.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-sm text-muted-foreground">{coin.balance} {coin.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${coin.value.toLocaleString()}</div>
                  <div className={cn(
                    "text-sm flex items-center justify-end",
                    coin.change > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {coin.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(coin.change)}%
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Recent transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Button variant="link" className="text-gold p-0 h-auto">
              View all
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.map((tx, index) => (
              <GlassCard 
                key={tx.id}
                variant="dark"
                className="flex justify-between items-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                    tx.type === "received" ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"
                  )}>
                    {tx.type === "received" ? (
                      <Download className="h-5 w-5" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {tx.type === "received" ? "Received" : "Sent"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {tx.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tx.amount}</div>
                  <div className="text-sm text-muted-foreground">{tx.value}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
