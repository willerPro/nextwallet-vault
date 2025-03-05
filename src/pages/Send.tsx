
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  logo_url: string;
  price: number;
  priceChange: number;
  balance: number;
}

const Send = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["send-crypto-assets"],
    queryFn: async () => {
      // This would be replaced with actual API data
      // For now, let's create mock data based on the image
      return [
        {
          id: "bnb",
          symbol: "BNB",
          name: "BEP20",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png", // We'll use CSS to show only part of the image
          price: 590.7,
          priceChange: 2.45,
          balance: 0
        },
        {
          id: "btc",
          symbol: "BTC",
          name: "Bitcoin",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 88985.99,
          priceChange: 3.7,
          balance: 0
        },
        {
          id: "eth-erc20",
          symbol: "ETH",
          name: "ERC20",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 2180.39,
          priceChange: 2.29,
          balance: 0
        },
        {
          id: "eth-arbitrum",
          symbol: "ETH",
          name: "Arbitrum",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 2180.39,
          priceChange: 2.29,
          balance: 0
        },
        {
          id: "pol",
          symbol: "POL",
          name: "Polygon",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 0.2524,
          priceChange: 2.38,
          balance: 0
        },
        {
          id: "sfp",
          symbol: "SFP",
          name: "BEP20",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 0.5991,
          priceChange: 1.76,
          balance: 0
        },
        {
          id: "ton",
          symbol: "TON",
          name: "Toncoin",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 3.033,
          priceChange: -2.31,
          balance: 0
        },
        {
          id: "trx",
          symbol: "TRX",
          name: "TRON",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 0.2436,
          priceChange: 1.96,
          balance: 0
        }
      ] as CryptoAsset[];
    }
  });

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSelectAsset = (asset: CryptoAsset) => {
    // Navigate to send details page
    navigate(`/send/${asset.id}`, { state: { asset } });
  };

  // Filter assets based on search query
  const filteredAssets = assets.filter(
    asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Send</h1>
      </motion.header>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-muted/10 border-muted/20"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Assets list */}
      <div className="flex-1 px-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((_, index) => (
              <GlassCard key={index} variant="dark" className="h-16 animate-pulse">
                <div></div>
              </GlassCard>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <GlassCard variant="dark" className="py-8 text-center">
            <p className="text-muted-foreground">No assets found</p>
          </GlassCard>
        ) : (
          filteredAssets.map((asset) => (
            <GlassCard
              key={asset.id}
              variant="dark"
              className="flex justify-between items-center cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => handleSelectAsset(asset)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center mr-3">
                  {asset.id === "bnb" && <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="BNB" className="h-6 w-6" />}
                  {asset.id === "btc" && <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="BTC" className="h-6 w-6" />}
                  {asset.id === "eth-erc20" && <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="ETH" className="h-6 w-6" />}
                  {asset.id === "eth-arbitrum" && <img src="https://cryptologos.cc/logos/arbitrum-arb-logo.png" alt="ARB" className="h-6 w-6" />}
                  {asset.id === "pol" && <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" alt="POL" className="h-6 w-6" />}
                  {asset.id === "sfp" && <img src="https://cryptologos.cc/logos/safemoon-safemoon-logo.png" alt="SFP" className="h-6 w-6" />}
                  {asset.id === "ton" && <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" className="h-6 w-6" />}
                  {asset.id === "trx" && <img src="https://cryptologos.cc/logos/tron-trx-logo.png" alt="TRX" className="h-6 w-6" />}
                </div>
                <div>
                  <div className="font-medium">{asset.symbol} ({asset.name})</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    ${asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.price < 1 ? 4 : 2 })}
                    <span className={asset.priceChange >= 0 ? "text-green-400 ml-1" : "text-red-400 ml-1"}>
                      {asset.priceChange >= 0 ? "+" : ""}{asset.priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{asset.balance.toFixed(asset.balance < 1 ? 6 : 2)}</div>
                <div className="text-sm text-muted-foreground">
                  ${(asset.balance * asset.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Send;
