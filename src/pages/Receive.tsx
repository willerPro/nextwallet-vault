
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  
  // Mock wallet address
  const walletAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };

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
        <h1 className="text-xl font-bold">Receive</h1>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="items-center text-center py-6">
            <div className="mb-4">
              <div className="bg-muted/20 w-48 h-48 mx-auto rounded flex items-center justify-center">
                <div className="text-sm text-muted-foreground">QR Code Placeholder</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{selectedAsset} Address</h3>
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground text-sm font-mono bg-muted/10 px-3 py-2 rounded">
                  {walletAddress.substring(0, 12)}...{walletAddress.substring(walletAddress.length - 8)}
                </p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 text-gold"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Only send {selectedAsset} to this address. Sending any other coins may result in permanent loss.
              </p>
              <Button 
                className="bg-gold hover:bg-gold-dark text-primary-foreground"
                onClick={handleCopyAddress}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Receive;
