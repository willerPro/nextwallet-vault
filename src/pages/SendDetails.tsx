import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const sendFormSchema = z.object({
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  address: z.string().min(1, "Recipient address is required"),
});

type SendFormValues = z.infer<typeof sendFormSchema>;

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  logo_url: string;
  price: number;
  priceChange: number;
  balance: number;
}

const SendDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [asset, setAsset] = useState<CryptoAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const form = useForm<SendFormValues>({
    resolver: zodResolver(sendFormSchema),
    defaultValues: {
      amount: "",
      address: "",
    },
  });

  useEffect(() => {
    setLoading(true);
    if (location.state?.asset) {
      setAsset(location.state.asset);
      setLoading(false);
      return;
    }
    
    navigate("/send");
  }, [id, location.state, navigate]);
  
  const handleGoBack = () => {
    navigate(-1);
  };

  const onSubmit = async (values: SendFormValues) => {
    if (!user || !asset) return;
    
    setSending(true);
    try {
      const amount = parseFloat(values.amount);
      const toAddress = values.address;
      
      const { data: wallets, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      
      if (walletError) {
        throw walletError;
      }
      
      let walletId: string;
      if (wallets && wallets.length > 0) {
        walletId = wallets[0].id;
      } else {
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            name: "My Wallet",
            balance: 0
          })
          .select()
          .single();
        
        if (createError || !newWallet) {
          throw createError || new Error("Failed to create wallet");
        }
        
        walletId = newWallet.id;
      }
      
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          wallet_id: walletId,
          type: "received",
          amount: amount,
          value_usd: amount * (asset.price || 0),
          coin_symbol: asset.symbol,
          to_address: toAddress,
          from_address: "Your Wallet",
          status: "completed",
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully received ${amount} ${asset.symbol}`);
      navigate("/wallet");
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to process. Please try again: " + (error.message || "Unknown error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Send {asset?.symbol}</h1>
      </motion.header>

      <div className="flex-1 px-4 space-y-6">
        {loading ? (
          <GlassCard variant="dark" className="h-32 animate-pulse">
            <div></div>
          </GlassCard>
        ) : asset ? (
          <>
            <GlassCard variant="dark" className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center mr-4">
                {asset.id === "bnb" && <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="BNB" className="h-8 w-8" />}
                {asset.id === "btc" && <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="BTC" className="h-8 w-8" />}
                {asset.id === "eth-erc20" && <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="ETH" className="h-8 w-8" />}
                {asset.id === "eth-arbitrum" && <img src="https://cryptologos.cc/logos/arbitrum-arb-logo.png" alt="ARB" className="h-8 w-8" />}
                {asset.id === "pol" && <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" alt="POL" className="h-8 w-8" />}
                {asset.id === "sfp" && <img src="https://cryptologos.cc/logos/safemoon-safemoon-logo.png" alt="SFP" className="h-8 w-8" />}
                {asset.id === "ton" && <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" className="h-8 w-8" />}
                {asset.id === "trx" && <img src="https://cryptologos.cc/logos/tron-trx-logo.png" alt="TRX" className="h-8 w-8" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{asset.symbol} ({asset.name})</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  ${asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.price < 1 ? 4 : 2 })}
                  <span className={asset.priceChange >= 0 ? "text-green-400 ml-1" : "text-red-400 ml-1"}>
                    {asset.priceChange >= 0 ? "+" : ""}{asset.priceChange.toFixed(2)}%
                  </span>
                </p>
              </div>
            </GlassCard>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Send</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="0.00" 
                            {...field} 
                            className="pr-20" 
                            type="number"
                            step="any"
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                            {asset.symbol}
                          </div>
                        </div>
                      </FormControl>
                      <div className="flex justify-between text-sm mt-1">
                        <p className="text-muted-foreground">
                          ≈ ${field.value ? (parseFloat(field.value) * asset.price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0.00"}
                        </p>
                        <p className="text-muted-foreground">
                          Available: {asset.balance.toFixed(asset.balance < 1 ? 6 : 2)} {asset.symbol}
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Address</FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter ${asset.symbol} address`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <GlassCard variant="dark" className="p-4">
                  <h3 className="text-sm font-medium mb-2">Transaction Details</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Network</span>
                    <span>{asset.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Fee</span>
                    <span>0.0001 {asset.symbol}</span>
                  </div>
                </GlassCard>

                <Button 
                  type="submit" 
                  className="w-full py-6 bg-gold hover:bg-gold-dark text-black" 
                  disabled={sending || loading}
                >
                  {sending ? "Sending..." : "Send Now"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <GlassCard variant="dark" className="py-8 text-center">
            <p className="text-muted-foreground">Asset not found.</p>
            <Button variant="outline" className="mt-4" onClick={handleGoBack}>
              Go Back
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default SendDetails;
