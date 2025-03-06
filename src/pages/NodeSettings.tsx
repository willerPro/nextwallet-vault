
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";

interface NetworkNode {
  name: string;
  url: string;
}

const NodeSettings = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNodes, setFilteredNodes] = useState<NetworkNode[]>([]);
  
  // Network nodes data
  const networkNodes: NetworkNode[] = [
    { name: "BNB Smart Chain", url: "https://bsc-dataseed1.binance.org" },
    { name: "Ethereum", url: "https://rpc.ankr.com/eth" },
    { name: "Polygon", url: "https://rpc.ankr.com/polygon" },
    { name: "Fantom", url: "https://rpc.ftm.tools/" },
    { name: "Heco", url: "https://http-mainnet.hecochain.com" },
    { name: "Optimism", url: "https://opt-mainnet.g.alchemy.com" },
    { name: "Arbitrum", url: "https://arb1.arbitrum.io/rpc" },
    { name: "AVAX C-Chain", url: "https://api.avax.network/ext/" },
    { name: "Songbird", url: "https://songbird-api.flare.network" },
    { name: "Boba", url: "https://mainnet.boba.network/" },
    { name: "Solana", url: "https://api.mainnet-beta.solana.com" },
    { name: "Godwoken", url: "https://mainnet.godwoken.io/rpc" },
    { name: "Terra Classic", url: "https://lcd.terra.dev/" },
    { name: "Injective", url: "https://lcd.injective.network/" }
  ];

  useEffect(() => {
    // Filter nodes based on search query
    if (searchQuery) {
      const filtered = networkNodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNodes(filtered);
    } else {
      setFilteredNodes(networkNodes);
    }
  }, [searchQuery]);

  // Handle network selection (in a real app, you would save this selection)
  const handleNetworkSelect = (network: NetworkNode) => {
    console.log(`Selected network: ${network.name}, URL: ${network.url}`);
    // Here you would implement logic to save the selected network
  };

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
          className="mr-4 rounded-full p-1 hover:bg-card/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">DApp Node Settings</h1>
      </motion.header>

      <div className="flex-1 px-4 space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search network"
              className="pl-9 bg-card/50 border-border/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-1"
        >
          {filteredNodes.map((node, index) => (
            <GlassCard
              key={node.name}
              variant="dark"
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => handleNetworkSelect(node)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className="font-medium">{node.name}</div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-xs md:text-sm mr-2 truncate max-w-[150px] md:max-w-[200px]">
                  {node.url}
                </span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NodeSettings;
