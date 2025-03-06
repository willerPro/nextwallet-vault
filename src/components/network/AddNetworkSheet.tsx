
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Network, networks } from "./networksList";

interface AddNetworkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNetworkAdded: () => void;
}

export function AddNetworkSheet({ open, onOpenChange, onNetworkAdded }: AddNetworkSheetProps) {
  const { user } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
  };
  
  const handleAddNetwork = async () => {
    if (!selectedNetwork || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("custom_networks").insert({
        user_id: user.id,
        network_name: selectedNetwork.name,
        default_token: selectedNetwork.token,
        chain_id: selectedNetwork.chainId,
        rpc_url: selectedNetwork.rpcUrl
      });
      
      if (error) {
        console.error("Error adding network:", error);
        toast.error("Failed to add network");
        return;
      }
      
      toast.success(`${selectedNetwork.name} added successfully`);
      onNetworkAdded();
      setSelectedNetwork(null);
    } catch (error) {
      console.error("Error in add network:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-border/30">
          <SheetTitle>Add Custom Network</SheetTitle>
        </SheetHeader>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {selectedNetwork ? (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">Selected Network</h3>
                <GlassCard variant="dark" className="p-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Network Name:</span>
                      <p className="font-medium">{selectedNetwork.name}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-muted-foreground">Default Token:</span>
                      <p className="font-medium">{selectedNetwork.token}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-muted-foreground">Chain ID:</span>
                      <p className="font-medium">{selectedNetwork.chainId}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-muted-foreground">RPC URL:</span>
                      <p className="font-medium break-all">{selectedNetwork.rpcUrl}</p>
                    </div>
                  </div>
                </GlassCard>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedNetwork(null)}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    className="flex-1"
                    onClick={handleAddNetwork}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Network"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Select a network from the list below to add to your custom networks
              </p>
              
              <div className="space-y-2">
                {networks.map((network) => (
                  <GlassCard 
                    key={network.chainId}
                    variant="dark"
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => handleNetworkSelect(network)}
                  >
                    <div>
                      <div className="font-medium">{network.name}</div>
                      <div className="text-xs text-muted-foreground">{network.token}</div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
