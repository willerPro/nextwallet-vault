
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Download, Shield, Check, ArrowRight, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import SeedPhraseBackup from "./SeedPhraseBackup";

interface WalletBackupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const WalletBackup: React.FC<WalletBackupProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<'intro' | 'warnings' | 'seed-phrase' | 'complete'>('intro');
  const [warningChecks, setWarningChecks] = useState({
    lossOfFunds: false,
    userResponsibility: false,
    noRecovery: false,
    confirmation: false,
  });

  const allWarningsChecked = Object.values(warningChecks).every(Boolean);

  const handleBackupComplete = () => {
    toast.success("Wallet backup complete!");
    onComplete();
  };

  const handleCheck = (key: keyof typeof warningChecks) => {
    setWarningChecks({
      ...warningChecks,
      [key]: !warningChecks[key],
    });
  };

  const proceedToSeedPhrase = () => {
    setStep('seed-phrase');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {step === 'intro' && (
        <GlassCard variant="dark" className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-gold">
              <Download className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold">Backup Your Wallet</h2>
            
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              It's recommended to backup your wallet to ensure you never lose access to your funds
            </p>

            <div className="flex flex-col w-full gap-3 pt-4">
              <Button
                className="bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:shadow-lg hover:shadow-gold/20"
                onClick={() => setStep('warnings')}
              >
                <Download className="w-4 h-4 mr-2" />
                Backup to Device
              </Button>
              
              <Button
                variant="outline"
                className="border-gold/20 text-foreground hover:bg-gold/10"
                onClick={onSkip}
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {step === 'warnings' && (
        <GlassCard variant="dark" className="p-6">
          <div className="flex flex-col space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center">Important Warnings</h2>
            
            <p className="text-sm text-muted-foreground text-center">
              Please read and acknowledge the following warnings before proceeding with the backup
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3 items-start">
                <Checkbox 
                  id="loss-of-funds" 
                  checked={warningChecks.lossOfFunds}
                  onCheckedChange={() => handleCheck('lossOfFunds')}
                />
                <label htmlFor="loss-of-funds" className="text-sm cursor-pointer">
                  I understand that if I lose my backup, I may lose access to my funds
                </label>
              </div>
              
              <div className="flex gap-3 items-start">
                <Checkbox 
                  id="user-responsibility" 
                  checked={warningChecks.userResponsibility}
                  onCheckedChange={() => handleCheck('userResponsibility')}
                />
                <label htmlFor="user-responsibility" className="text-sm cursor-pointer">
                  I understand that I am responsible for keeping my backup secure and private
                </label>
              </div>
              
              <div className="flex gap-3 items-start">
                <Checkbox 
                  id="no-recovery" 
                  checked={warningChecks.noRecovery}
                  onCheckedChange={() => handleCheck('noRecovery')}
                />
                <label htmlFor="no-recovery" className="text-sm cursor-pointer">
                  I understand that the app developers cannot recover my wallet if I lose my backup
                </label>
              </div>
              
              <div className="flex gap-3 items-start">
                <Checkbox 
                  id="confirmation" 
                  checked={warningChecks.confirmation}
                  onCheckedChange={() => handleCheck('confirmation')}
                />
                <label htmlFor="confirmation" className="text-sm cursor-pointer">
                  I confirm that I have read and understood all of the above warnings
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('intro')}
              >
                <X className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                className="flex-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:shadow-lg hover:shadow-gold/20"
                onClick={proceedToSeedPhrase}
                disabled={!allWarningsChecked}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {step === 'seed-phrase' && (
        <SeedPhraseBackup
          onComplete={handleBackupComplete}
          onCancel={onSkip}
        />
      )}
    </motion.div>
  );
};

export default WalletBackup;
