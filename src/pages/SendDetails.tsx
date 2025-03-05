
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const asset = location.state?.asset as CryptoAsset;
  
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!asset) {
    navigate("/send");
    return null;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = value.split(".");
    if (parts.length > 2) {
      return;
    }
    
    setAmount(value);
  };

  const handleMaxAmount = () => {
    setAmount(asset.balance.toString());
  };

  const handleSend = () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Wallet address required",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough balance
    if (Number(amount) > asset.balance) {
      toast({
        title: "Insufficient balance",
        description: `You do not have enough ${asset.symbol} to send`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Transaction initiated",
        description: `${amount} ${asset.symbol} sent to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      navigate("/dashboard");
    }, 1500);
  };

  const hasZeroBalance = asset.balance <= 0;

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
        <h1 className="text-xl font-bold">Send {asset.symbol}</h1>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {hasZeroBalance ? (
          <GlassCard variant="dark" className="py-8 text-center">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                  {asset.id === "bnb" && <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="BNB" className="h-8 w-8" />}
                  {asset.id === "btc" && <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="BTC" className="h-8 w-8" />}
                  {asset.id === "eth-erc20" && <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="ETH" className="h-8 w-8" />}
                  {asset.id === "eth-arbitrum" && <img src="https://cryptologos.cc/logos/arbitrum-arb-logo.png" alt="ARB" className="h-8 w-8" />}
                  {asset.id === "pol" && <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" alt="POL" className="h-8 w-8" />}
                  {asset.id === "sfp" && <img src="https://cryptologos.cc/logos/safemoon-safemoon-logo.png" alt="SFP" className="h-8 w-8" />}
                  {asset.id === "ton" && <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" className="h-8 w-8" />}
                  {asset.id === "trx" && <img src="https://cryptologos.cc/logos/tron-trx-logo.png" alt="TRX" className="h-8 w-8" />}
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">No {asset.symbol} to send</h3>
              <p className="text-muted-foreground mb-6">You have 0 {asset.symbol} in your wallet.</p>
              <Button 
                variant="outline" 
                className="border-gold/20 text-gold hover:bg-gold/10"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </GlassCard>
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <GlassCard variant="dark" className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center mr-3">
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
                    <div className="text-sm text-muted-foreground">
                      Balance: {asset.balance.toFixed(6)} {asset.symbol}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <GlassCard variant="dark" className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="text-sm text-muted-foreground mb-2 block">Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.0"
                      className="pr-20 bg-muted/10 border-muted/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gold h-6 px-2"
                      onClick={handleMaxAmount}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    ≈ ${amount ? (Number(amount) * asset.price).toFixed(2) : '0.00'}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm text-muted-foreground mb-2 block">Wallet Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    className="bg-muted/10 border-muted/20"
                  />
                </div>

                <Button 
                  className="w-full bg-gold hover:bg-gold-dark text-primary-foreground"
                  onClick={handleSend}
                  disabled={isSubmitting || !amount || !address}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Send"}
                </Button>
              </GlassCard>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default SendDetails;
