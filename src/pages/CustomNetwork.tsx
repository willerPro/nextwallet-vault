
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Plus, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AddNetworkSheet } from "@/components/network/AddNetworkSheet";
import { toast } from "sonner";

interface CustomNetwork {
  id: string;
  network_name: string;
  default_token: string;
  chain_id: string;
  rpc_url: string;
}

const CustomNetwork = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [networks, setNetworks] = useState<CustomNetwork[]>([]);
  const [filteredNetworks, setFilteredNetworks] = useState<CustomNetwork[]>([]);
  const [isAddNetworkOpen, setIsAddNetworkOpen] = useState(false);
  
  useEffect(() => {
    fetchNetworks();
  }, [user]);

  useEffect(() => {
    // Filter networks based on search query
    if (searchQuery) {
      const filtered = networks.filter(network => 
        network.network_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        network.default_token.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNetworks(filtered);
    } else {
      setFilteredNetworks(networks);
    }
  }, [searchQuery, networks]);

  const fetchNetworks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("custom_networks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching networks:", error);
        toast.error("Failed to load networks");
        return;
      }

      setNetworks(data || []);
    } catch (error) {
      console.error("Error in fetch networks:", error);
      toast.error("An error occurred while loading networks");
    }
  };

  const handleNetworkSelect = (network: CustomNetwork) => {
    console.log("Selected network:", network);
    // Here you would implement logic to use the selected network
    toast.success(`${network.network_name} selected`);
  };

  const handleNetworkAdded = () => {
    fetchNetworks();
    setIsAddNetworkOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      <motion.header 
        className="p-4 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 rounded-full p-1 hover:bg-card/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Custom Networks</h1>
        </div>
        <button 
          onClick={() => setIsAddNetworkOpen(true)}
          className="rounded-full p-2 bg-card/50 hover:bg-card/70"
        >
          <Plus className="h-5 w-5" />
        </button>
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
          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network, index) => (
              <GlassCard
                key={network.id}
                variant="dark"
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleNetworkSelect(network)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div>
                  <div className="font-medium">{network.network_name}</div>
                  <div className="text-xs text-muted-foreground">{network.default_token}</div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="text-xs md:text-sm mr-2 truncate max-w-[150px] md:max-w-[200px]">
                    Chain ID: {network.chain_id}
                  </span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? "No networks found matching your search" 
                : "No custom networks added yet. Click the + button to add one."}
            </div>
          )}
        </motion.div>
      </div>

      <AddNetworkSheet 
        open={isAddNetworkOpen} 
        onOpenChange={setIsAddNetworkOpen}
        onNetworkAdded={handleNetworkAdded}
      />
    </div>
  );
};

export default CustomNetwork;
