
import { useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const marketData = [
  { name: "Bitcoin", symbol: "BTC", price: 54345.67, change: 2.34, volume: "32.5B" },
  { name: "Ethereum", symbol: "ETH", price: 2876.54, change: -1.23, volume: "18.7B" },
  { name: "Solana", symbol: "SOL", price: 234.56, change: 5.67, volume: "8.3B" },
  { name: "Cardano", symbol: "ADA", price: 1.45, change: -0.56, volume: "3.2B" },
  { name: "Binance Coin", symbol: "BNB", price: 345.67, change: 3.45, volume: "4.8B" },
  { name: "XRP", symbol: "XRP", price: 0.78, change: 1.25, volume: "2.9B" },
  { name: "Polkadot", symbol: "DOT", price: 16.89, change: -2.12, volume: "1.5B" },
  { name: "Dogecoin", symbol: "DOGE", price: 0.12, change: 8.76, volume: "1.8B" },
];

const Market = () => {
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
          <BarChart3 className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">Market</h1>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative"
        >
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            className="pl-10 bg-card/50 border-muted focus:border-gold/50"
            placeholder="Search cryptocurrencies..." 
          />
        </motion.div>

        {/* Market tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-4 bg-card/50 p-1">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="gainers">Gainers</TabsTrigger>
              <TabsTrigger value="losers">Losers</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4 space-y-3">
              {marketData.map((coin, index) => (
                <GlassCard 
                  key={coin.symbol}
                  variant="dark"
                  className="flex justify-between items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                      {coin.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${coin.price.toLocaleString()}</div>
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
            </TabsContent>
            <TabsContent value="gainers" className="mt-4">
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Gainers content coming soon
              </div>
            </TabsContent>
            <TabsContent value="losers" className="mt-4">
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Losers content coming soon
              </div>
            </TabsContent>
            <TabsContent value="watchlist" className="mt-4">
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Watchlist content coming soon
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Market;
