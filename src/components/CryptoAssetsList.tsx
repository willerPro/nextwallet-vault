
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
  logo_url: string;
}

interface CryptoAssetsListProps {
  assets: CryptoAsset[];
}

export const CryptoAssetsList: React.FC<CryptoAssetsListProps> = ({ assets }) => {
  if (assets.length === 0) {
    return (
      <GlassCard variant="dark" className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50 rounded-full bg-muted/20" />
          <h3 className="text-lg font-medium">No assets yet</h3>
          <p className="text-sm text-muted-foreground">Your crypto assets will appear here</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {assets.map((asset, index) => (
        <motion.div
          key={asset.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
        >
          <GlassCard variant="dark" className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 overflow-hidden">
                {asset.logo_url ? (
                  <img src={asset.logo_url} alt={asset.symbol} className="h-6 w-6" />
                ) : (
                  <div className="h-6 w-6 bg-muted rounded-full" />
                )}
              </div>
              <div>
                <div className="font-medium">{asset.symbol}</div>
                <div className="text-sm text-muted-foreground">{asset.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{asset.balance.toFixed(6)} {asset.symbol}</div>
              <div className="flex items-center justify-end text-sm">
                <span className="text-muted-foreground mr-1">${asset.price.toLocaleString()}</span>
                <span className={cn(
                  "flex items-center", 
                  asset.priceChange >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {asset.priceChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(asset.priceChange).toFixed(2)}%
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};
