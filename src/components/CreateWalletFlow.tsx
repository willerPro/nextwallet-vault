
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Check, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import PinAuthentication from "./PinAuthentication";
import WalletBackup from "./WalletBackup";

interface CreateWalletFlowProps {
  onComplete: () => void;
  onCancel?: () => void;
}

type FlowStep = 'pin-setup' | 'verifying' | 'creating' | 'backup-option' | 'complete';

// Define wallet interface based on our database structure
interface Wallet {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

const CreateWalletFlow: React.FC<CreateWalletFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<FlowStep>('pin-setup');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hasPinSetup, setHasPinSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user already has a PIN
    const checkPin = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('pin_auth')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (data) {
          setHasPinSetup(true);
        }
      } catch (err) {
        // If no pin is found, that's fine
        console.log("No PIN found for user");
      } finally {
        setLoading(false);
      }
    };
    
    checkPin();
  }, [user]);

  const createWallet = async () => {
    if (!user) return;
    
    setStep('creating');
    
    try {
      // Simulate a slight delay for the animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the next wallet number
      const { data: existingWallets, error: fetchError } = await supabase
        .from<Wallet>('wallets')
        .select('*')
        .eq('user_id', user.id);
        
      if (fetchError) throw fetchError;
        
      const walletNumber = existingWallets ? existingWallets.length + 1 : 1;
      const walletName = `Wallet-${walletNumber.toString().padStart(2, '0')}`;
      
      const { error } = await supabase
        .from<Wallet>('wallets')
        .insert([{ 
          user_id: user.id,
          name: walletName,
        }]);
      
      if (error) throw error;
      
      // Invalidate the wallets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      
      setStep('backup-option');
    } catch (err: any) {
      console.error("Error creating wallet:", err);
      toast.error("Failed to create wallet");
      onComplete(); // Exit the flow if there's an error
    }
  };

  const handlePinSetupComplete = () => {
    setStep('verifying');
    // Start wallet creation after pin setup
    createWallet();
  };

  const handlePinVerificationComplete = () => {
    setStep('verifying');
    // Start wallet creation after pin verification
    createWallet();
  };

  const handleBackupComplete = () => {
    setStep('complete');
    // Give some time to see the completion state before closing
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleSkipBackup = () => {
    setStep('complete');
    toast.info("Wallet created without backup");
    // Give some time to see the completion state before closing
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  if (loading) {
    return (
      <GlassCard variant="dark" className="p-6 flex justify-center items-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </GlassCard>
    );
  }

  return (
    <>
      {step === 'pin-setup' && (
        <PinAuthentication 
          mode={hasPinSetup ? 'verify' : 'create'} 
          onSuccess={hasPinSetup ? handlePinVerificationComplete : handlePinSetupComplete}
          onCancel={onCancel}
        />
      )}

      {step === 'verifying' && (
        <GlassCard variant="dark" className="p-6">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wallet className="w-8 h-8 text-gold" />
              </motion.div>
            </div>
            <h2 className="text-xl font-bold">Verifying PIN...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we verify your PIN</p>
          </div>
        </GlassCard>
      )}

      {step === 'creating' && (
        <GlassCard variant="dark" className="p-6">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wallet className="w-8 h-8 text-gold" />
              </motion.div>
            </div>
            <h2 className="text-xl font-bold">Creating Your Wallet</h2>
            <p className="text-sm text-muted-foreground">Please wait while we set up your wallet</p>
          </div>
        </GlassCard>
      )}

      {step === 'backup-option' && (
        <WalletBackup onComplete={handleBackupComplete} onSkip={handleSkipBackup} />
      )}

      {step === 'complete' && (
        <GlassCard variant="dark" className="p-6">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Wallet Created!</h2>
            <p className="text-sm text-muted-foreground">Your wallet has been created successfully</p>
          </div>
        </GlassCard>
      )}
    </>
  );
};

export default CreateWalletFlow;
