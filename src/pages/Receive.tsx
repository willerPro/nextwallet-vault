
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, QrCode, Share2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  logo_url: string;
  price: number;
  priceChange: number;
  balance: number;
  walletAddress: string;
  network: string;
}

interface WalletAddress {
  id: string;
  user_id: string;
  asset_id: string;
  wallet_address: string | null;
  status: string;
}

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [showAssetSelect, setShowAssetSelect] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  // Get asset from location state if available
  useEffect(() => {
    if (location.state?.asset) {
      setSelectedAsset(location.state.asset);
      setShowAssetSelect(false);
    }
  }, [location.state]);

  // Fetch user wallet addresses
  const { data: userWalletAddresses = [], isLoading: isLoadingWalletAddresses } = useQuery({
    queryKey: ["user-wallet-addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error fetching wallet addresses:", error);
        throw error;
      }
      
      return data as WalletAddress[];
    },
    enabled: !!user,
  });

  // Function to ensure a wallet address exists for a given asset
  const ensureWalletAddressExists = async (assetId: string) => {
    if (!user) return null;
    
    // Check if wallet address already exists for this asset
    const existingAddress = userWalletAddresses.find(address => address.asset_id === assetId);
    if (existingAddress) return existingAddress;
    
    // Create a new pending wallet address entry
    try {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .insert([
          { user_id: user.id, asset_id: assetId, status: 'pending' }
        ])
        .select('*')
        .single();
      
      if (error) {
        console.error("Error creating wallet address:", error);
        throw error;
      }
      
      return data as WalletAddress;
    } catch (error) {
      console.error("Failed to create wallet address entry:", error);
      return null;
    }
  };

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["receive-crypto-assets"],
    queryFn: async () => {
      // Fetch default wallet addresses from the database
      const { data: walletData, error } = await supabase
        .from('asset_wallets')
        .select('*');
      
      if (error) {
        console.error("Error fetching wallet addresses:", error);
        throw error;
      }
      
      // Determine which wallet address to use based on availability in user's wallet_addresses
      const getWalletAddress = async (assetId: string) => {
        if (user) {
          // Check if user has a specific wallet address for this asset
          const existingAddress = userWalletAddresses.find(addr => addr.asset_id === assetId);
          
          if (existingAddress) {
            if (existingAddress.status === 'active' && existingAddress.wallet_address) {
              // Return active wallet address
              return existingAddress.wallet_address;
            } else {
              // Return pending status
              return "pending";
            }
          }
          
          // Ensure a wallet address entry exists for this asset
          await ensureWalletAddressExists(assetId);
          return "pending";
        } else {
          // For non-logged-in users, return the default wallet address
          return walletData?.find(w => w.asset_id === assetId)?.wallet_address || "TKea2mSmUjBPdWGpvs5cSzdQeytqc6Ztuf";
        }
      };
      
      // This would be replaced with actual API data in production
      // but for now we'll merge our wallet data with hardcoded asset data
      const assetsList = [
        {
          id: "bnb",
          symbol: "BNB",
          name: "BEP20",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 590.7,
          priceChange: 2.45,
          balance: 0,
          walletAddress: await getWalletAddress("bnb"),
          network: walletData?.find(w => w.asset_id === "bnb")?.network || "Binance Smart Chain"
        },
        {
          id: "btc",
          symbol: "BTC",
          name: "Bitcoin",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 88985.99,
          priceChange: 3.7,
          balance: 0,
          walletAddress: await getWalletAddress("btc"),
          network: walletData?.find(w => w.asset_id === "btc")?.network || "Bitcoin"
        },
        {
          id: "eth-erc20",
          symbol: "ETH",
          name: "ERC20",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 2180.39,
          priceChange: 2.29,
          balance: 0,
          walletAddress: await getWalletAddress("eth-erc20"),
          network: walletData?.find(w => w.asset_id === "eth-erc20")?.network || "Ethereum"
        },
        {
          id: "eth-arbitrum",
          symbol: "ETH",
          name: "Arbitrum",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 2180.39,
          priceChange: 2.29,
          balance: 0,
          walletAddress: await getWalletAddress("eth-arbitrum"),
          network: walletData?.find(w => w.asset_id === "eth-arbitrum")?.network || "Arbitrum"
        },
        {
          id: "pol",
          symbol: "POL",
          name: "Polygon",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 0.2524,
          priceChange: 2.38,
          balance: 0,
          walletAddress: await getWalletAddress("pol"),
          network: walletData?.find(w => w.asset_id === "pol")?.network || "Polygon"
        },
        {
          id: "sfp",
          symbol: "SFP",
          name: "BEP20",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 0.5991,
          priceChange: 1.76,
          balance: 0,
          walletAddress: await getWalletAddress("sfp"),
          network: walletData?.find(w => w.asset_id === "sfp")?.network || "Binance Smart Chain"
        },
        {
          id: "ton",
          symbol: "TON",
          name: "Toncoin",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 3.033,
          priceChange: -2.31,
          balance: 0,
          walletAddress: await getWalletAddress("ton"),
          network: walletData?.find(w => w.asset_id === "ton")?.network || "TON"
        },
        {
          id: "trx",
          symbol: "TRX",
          name: "TRON",
          logo_url: "/lovable-uploads/1d6cfac3-1b91-43f8-8d2d-ec1870d97843.png",
          price: 0.2436,
          priceChange: 1.96,
          balance: 0,
          walletAddress: await getWalletAddress("trx"),
          network: walletData?.find(w => w.asset_id === "trx")?.network || "TRON"
        }
      ] as CryptoAsset[];
      
      return assetsList;
    },
    enabled: !!userWalletAddresses,
  });

  // Filter assets based on search query
  const filteredAssets = assets.filter(
    asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoBack = () => {
    if (!showAssetSelect && selectedAsset) {
      setShowAssetSelect(true);
      setSelectedAsset(null);
    } else {
      navigate(-1);
    }
  };
  
  const handleSelectAsset = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    setShowAssetSelect(false);
  };
  
  const handleCopyAddress = () => {
    if (selectedAsset && selectedAsset.walletAddress && selectedAsset.walletAddress !== "pending") {
      navigator.clipboard.writeText(selectedAsset.walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    } else {
      toast({
        title: "Address not available",
        description: "Your wallet address is still being provisioned",
        variant: "destructive",
      });
    }
  };
  
  const handleShareAddress = async () => {
    if (selectedAsset && selectedAsset.walletAddress !== "pending" && navigator.share) {
      try {
        await navigator.share({
          title: `${selectedAsset.symbol} Wallet Address`,
          text: `My ${selectedAsset.symbol} wallet address: ${selectedAsset.walletAddress}`,
        });
        toast({
          title: "Address shared",
          description: "Wallet address shared successfully",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else if (selectedAsset?.walletAddress === "pending") {
      toast({
        title: "Address not available",
        description: "Your wallet address is still being provisioned",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Share not supported",
        description: "Sharing is not supported on this device",
        variant: "destructive",
      });
    }
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
        {showAssetSelect ? (
          <>
            {/* Asset selection section */}
            <div className="relative mb-4">
              <Input 
                className="pl-10 bg-muted/10 border-muted/20"
                placeholder="Search assets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
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
          </>
        ) : selectedAsset && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {selectedAsset.walletAddress === "pending" ? (
              <GlassCard variant="dark" className="items-center text-center py-6">
                <div className="mb-6 text-amber-400">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Wallet Being Provisioned</h3>
                  <p className="text-sm text-muted-foreground px-6">
                    Your {selectedAsset.symbol} wallet address is currently being provisioned by our team. 
                    This process may take up to 24 hours. You will be notified once your wallet is ready to use.
                  </p>
                </div>
                
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4 max-w-xs mx-auto mb-4">
                  <p className="text-xs text-amber-400">
                    For security purposes, all wallet addresses are manually provisioned by our team.
                  </p>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={handleGoBack}
                  className="mt-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </GlassCard>
            ) : (
              <GlassCard variant="dark" className="items-center text-center py-6">
                <div className="mb-4">
                  <div className="bg-white w-48 h-48 mx-auto rounded-lg flex items-center justify-center p-2">
                    <QRCode 
                      value={selectedAsset.walletAddress}
                      size={176}
                      level="H"
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">{selectedAsset.symbol} ({selectedAsset.name}) Address</h3>
                  <div className="flex items-center justify-center">
                    <p className="text-muted-foreground text-sm font-mono bg-muted/10 px-3 py-2 rounded truncate max-w-56">
                      {selectedAsset.walletAddress.length > 20 
                        ? `${selectedAsset.walletAddress.substring(0, 10)}...${selectedAsset.walletAddress.substring(selectedAsset.walletAddress.length - 10)}`
                        : selectedAsset.walletAddress}
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
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Only send {selectedAsset.symbol} ({selectedAsset.network}) to this address. Sending any other coins may result in permanent loss.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      className="bg-gold hover:bg-gold-dark text-primary-foreground"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleShareAddress}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Receive;
