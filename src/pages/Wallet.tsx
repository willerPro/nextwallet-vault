
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { WalletIcon, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Wallet = {
  id: string;
  name: string;
  created_at: string;
};

const Wallet = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totalBalance, setTotalBalance] = useState(0);

  // Fetch user wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching wallets:", error);
        toast({
          title: "Error",
          description: "Failed to load wallets",
          variant: "destructive",
        });
        return [];
      }
      
      return data as Wallet[];
    },
    enabled: !!user && !loading,
  });

  // Create a new wallet
  const createWalletMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      // Get the next wallet number
      const walletNumber = wallets ? wallets.length + 1 : 1;
      const walletName = `Wallet-${walletNumber.toString().padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('wallets')
        .insert([
          { 
            user_id: user.id,
            name: walletName,
          }
        ])
        .select();
      
      if (error) {
        console.error("Error creating wallet:", error);
        throw new Error("Failed to create wallet");
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: "Success",
        description: "New wallet created successfully",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <WalletIcon className="h-5 w-5 mr-2 text-gold" />
          <h1 className="text-xl font-bold">My Wallet</h1>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Balance card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="text-center">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Total Balance</h2>
            <div className="text-3xl font-bold mb-1">$0.00</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center">
              <span>No recent activity</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Wallets */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Your Wallets</h2>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-gold/20 text-foreground hover:bg-gold/10"
              onClick={() => createWalletMutation.mutate()}
              disabled={createWalletMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Wallet
            </Button>
          </div>
          
          <div className="space-y-3">
            {isLoadingWallets ? (
              <div className="py-10 text-center">
                <div className="animate-pulse text-muted-foreground">Loading wallets...</div>
              </div>
            ) : wallets && wallets.length > 0 ? (
              wallets.map((wallet, index) => (
                <GlassCard 
                  key={wallet.id}
                  variant="dark"
                  className="flex justify-between items-center"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                      {wallet.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">Created: {new Date(wallet.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className="font-medium">$0.00</div>
                      <div className="text-sm text-muted-foreground">
                        Available
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard variant="dark" className="py-8 text-center">
                <p className="text-muted-foreground mb-4">You don't have any wallets yet</p>
                <Button 
                  variant="outline" 
                  className="border-gold/20 text-foreground hover:bg-gold/10"
                  onClick={() => createWalletMutation.mutate()}
                  disabled={createWalletMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Wallet
                </Button>
              </GlassCard>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Wallet;
