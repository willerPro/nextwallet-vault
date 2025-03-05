
import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  priceChange: number;
  logo_url?: string;
}

interface CryptoAssetsListProps {
  assets: CryptoAsset[];
}

export const CryptoAssetsList: React.FC<CryptoAssetsListProps> = ({ assets }) => {
  return (
    <div className="space-y-3">
      {assets.map((asset, index) => (
        <GlassCard 
          key={asset.id}
          variant="dark"
          className="flex justify-between items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
              {asset.logo_url ? (
                <img src={asset.logo_url} alt={asset.symbol} className="w-6 h-6" />
              ) : (
                asset.symbol.charAt(0)
              )}
            </div>
            <div>
              <div className="font-medium">{asset.name}</div>
              <div className="text-sm text-muted-foreground">{asset.balance} {asset.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">${(asset.balance * asset.price).toLocaleString()}</div>
            <div className={cn(
              "text-sm flex items-center justify-end",
              asset.priceChange > 0 ? "text-green-400" : "text-red-400"
            )}>
              {asset.priceChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(asset.priceChange)}%
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
