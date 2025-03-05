
import { useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const cryptoAssets = [
  { name: "Bitcoin", symbol: "BTC", balance: 0.0234, value: 1345.67, change: 2.34 },
  { name: "Ethereum", symbol: "ETH", balance: 0.456, value: 876.54, change: -1.23 },
  { name: "Solana", symbol: "SOL", balance: 12.345, value: 234.56, change: 5.67 },
  { name: "Cardano", symbol: "ADA", balance: 145.67, value: 123.45, change: -0.56 },
  { name: "Binance Coin", symbol: "BNB", balance: 1.23, value: 345.67, change: 3.45 },
];

const Wallet = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <WalletIcon className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">My Wallet</h1>
        </div>
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
            <Button size="sm" variant="outline" className="border-gold/20 text-foreground hover:bg-gold/10">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
          
          <div className="space-y-3">
            {cryptoAssets.map((coin, index) => (
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
                <div className="flex items-center">
                  <div className="text-right mr-3">
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
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Wallet;
