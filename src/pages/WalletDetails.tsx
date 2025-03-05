
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Smartphone, 
  Clock, 
  Info, 
  Download, 
  Key, 
  Upload, 
  Plus, 
  Trash2, 
  Shield 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Pen } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Wallet = {
  id: string;
  name: string;
  created_at: string;
  balance: number;
};

const WalletDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch wallet data
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet-details', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching wallet:", error);
        toast({
          title: "Error",
          description: "Failed to load wallet details",
          variant: "destructive",
        });
        return null;
      }
      
      return data as Wallet;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (wallet) {
      setWalletName(wallet.name);
    }
  }, [wallet]);

  const handleUpdateName = async () => {
    if (!user || !id || !walletName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ name: walletName })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Wallet name updated",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating wallet name:", error);
      toast({
        title: "Error",
        description: "Failed to update wallet name",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWallet = async () => {
    if (!user || !id) return;
    
    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Wallet has been removed",
      });
      navigate('/wallet');
    } catch (error) {
      console.error("Error deleting wallet:", error);
      toast({
        title: "Error",
        description: "Failed to delete wallet",
        variant: "destructive",
      });
    }
  };

  // Generate a security suffix from the wallet id
  const securitySuffix = id ? id.substring(0, 3).toUpperCase() : "UTV";

  if (isLoadingWallet) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="animate-pulse">Loading wallet details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <motion.header 
        className="p-4 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/wallet')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Wallet Details</h1>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Wallet icon and name */}
        <motion.div
          className="flex flex-col items-center justify-center py-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-10 w-10 text-gray-600" />
          </div>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gold"
                autoFocus
              />
              <Button size="sm" onClick={handleUpdateName}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-2xl font-bold mr-2">{walletName || "My Wallet"}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsEditing(true)}
              >
                <Pen className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Wallet info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created By</span>
              <span>Mnemonic Phrase</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created Time</span>
              <span>{wallet?.created_at ? new Date(wallet.created_at).toLocaleString() : "N/A"}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Security Suffix</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground">
                  <Info className="h-3 w-3" />
                </Button>
              </div>
              <span>{securitySuffix}</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Backup</span>
              <div className="flex items-center">
                <span className="text-red-500 mr-2">No backup</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span>Export Public Key</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground ml-1">
                  <Info className="h-3 w-3" />
                </Button>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span>Export Private Key</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span>Clear Cache</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Coins */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <GlassCard variant="dark" className="flex justify-between items-center">
            <span>Coins</span>
            <span>${wallet?.balance?.toFixed(2) || "0.00"}</span>
          </GlassCard>
        </motion.div>

        {/* Remove wallet button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button 
            className="w-full bg-red-500 hover:bg-red-600 text-white" 
            onClick={() => setShowDeleteDialog(true)}
          >
            Remove Wallet
          </Button>
        </motion.div>
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this wallet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWallet}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WalletDetails;
