
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send as SendIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Interface for asset data with optional fields to prevent TypeScript errors
interface Asset {
  id: string;
  asset_name: string;
  asset_symbol: string;
  balance: number;
  fiat_value: number;
  wallet_address?: string;
  network?: string;
}

const SendDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  // Fetch asset data
  const { data: asset, isLoading } = useQuery<Asset | null>({
    queryKey: ["asset", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("asset_wallets")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching asset:", error);
        return null;
      }
      
      // Add balance and fiat_value for assets that don't have these fields
      return {
        id: data.id,
        asset_name: data.asset_name,
        asset_symbol: data.asset_symbol,
        balance: parseFloat(data.balance || "0"),
        fiat_value: parseFloat(data.fiat_value || "0"),
        wallet_address: data.wallet_address,
        network: data.network,
      };
    },
    enabled: !!id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset || !recipientAddress || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in all fields with valid values");
      return;
    }
    
    try {
      // Create transaction record
      const { error } = await supabase.from("transactions").insert({
        user_id: user?.id,
        amount: parseFloat(amount),
        type: "send",
        status: "completed",
        coin_symbol: asset.asset_symbol,
        value_usd: parseFloat(amount) * (asset.fiat_value / asset.balance),
        from_address: user?.id,
        to_address: recipientAddress,
        wallet_id: asset.id,
      });
      
      if (error) throw error;
      
      toast.success(`Successfully sent ${amount} ${asset.asset_symbol}`);
      navigate("/transactions");
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error("Failed to process transaction");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!asset) {
    return <div className="p-4">Asset not found</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 rounded-full p-2 hover:bg-card/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Send {asset.asset_symbol}</h1>
      </motion.header>

      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="p-5 mb-4">
            <div className="text-center">
              <h2 className="text-lg font-medium text-foreground mb-1">{asset.asset_name}</h2>
              <p className="text-3xl font-bold text-gold mb-1">{asset.balance} {asset.asset_symbol}</p>
              <p className="text-sm text-muted-foreground">${asset.fiat_value?.toFixed(2) || "0.00"} USD</p>
            </div>
          </GlassCard>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <GlassCard variant="dark" className="p-5">
                <label htmlFor="recipient" className="block text-sm font-medium mb-2 text-gold">
                  Recipient Address
                </label>
                <Input
                  id="recipient"
                  placeholder="Enter wallet address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-muted/10 border-gold/30 text-foreground placeholder:text-muted-foreground/70"
                />
              </GlassCard>
              
              <GlassCard variant="dark" className="p-5">
                <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gold">
                  Amount to Send
                </label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-16 bg-muted/10 border-gold/30 text-foreground placeholder:text-muted-foreground/70"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {asset.asset_symbol}
                  </div>
                </div>
                {amount && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ≈ ${(parseFloat(amount || "0") * (asset.fiat_value / asset.balance)).toFixed(2)} USD
                  </p>
                )}
              </GlassCard>
              
              <GlassCard variant="dark" className="p-5">
                <label htmlFor="note" className="block text-sm font-medium mb-2 text-gold">
                  Note (Optional)
                </label>
                <Input
                  id="note"
                  placeholder="Add a memo or reference"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-muted/10 border-gold/30 text-foreground placeholder:text-muted-foreground/70"
                />
              </GlassCard>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-gold hover:bg-gold/90 text-black font-bold text-lg"
              disabled={!recipientAddress || !amount || parseFloat(amount) <= 0}
            >
              <SendIcon className="mr-2 h-5 w-5" />
              Send {amount && parseFloat(amount) > 0 ? `${amount} ${asset.asset_symbol}` : ""}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SendDetails;
