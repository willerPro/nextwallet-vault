
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check, AlertTriangle, ArrowRight, RefreshCw, X } from "lucide-react";
import { generateSeedPhrase, shuffleArray } from "@/utils/seedPhraseUtils";
import { toast } from "sonner";

interface SeedPhraseBackupProps {
  onComplete: () => void;
  onCancel: () => void;
}

type BackupStep = 'display' | 'verify' | 'complete';

const SeedPhraseBackup: React.FC<SeedPhraseBackupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<BackupStep>('display');
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Generate seed phrase on component mount
  useEffect(() => {
    const phrase = generateSeedPhrase(12);
    setSeedPhrase(phrase);
    setShuffledWords(shuffleArray([...phrase]));
  }, []);

  const handleVerificationSubmit = () => {
    const isCorrect = seedPhrase.every((word, index) => word === selectedWords[index]);
    
    if (isCorrect) {
      setVerificationComplete(true);
      toast.success("Seed phrase verified successfully!");
    } else {
      toast.error("Seed phrase verification failed. Please try again.");
      setSelectedWords([]);
    }
  };

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) {
      // Remove word if already selected
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 12) {
      // Add word if not already selected and we haven't reached 12 words
      setSelectedWords([...selectedWords, word]);
    }
  };

  const resetVerification = () => {
    setSelectedWords([]);
    setShuffledWords(shuffleArray([...seedPhrase]));
  };

  return (
    <GlassCard variant="dark" className="p-6">
      {step === 'display' && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center">Your Seed Phrase</h2>
          
          <p className="text-sm text-muted-foreground text-center mb-2">
            Write down these 12 words in order. This is your wallet recovery phrase. Do not share it with anyone!
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {seedPhrase.map((word, index) => (
              <div 
                key={index} 
                className="flex items-center p-2 bg-secondary/10 rounded-md"
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold text-xs mr-2">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{word}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light"
              onClick={() => setStep('verify')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Verify
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-center">Verify Your Seed Phrase</h2>
          
          <p className="text-sm text-muted-foreground text-center">
            Click the words in the correct order to verify you've saved your seed phrase
          </p>
          
          {/* Selected words display */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <div 
                key={index}
                className="flex items-center p-2 bg-secondary/10 rounded-md min-h-10"
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold text-xs mr-2">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">
                  {selectedWords[index] || ""}
                </span>
              </div>
            ))}
          </div>

          {/* Word selection buttons */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {shuffledWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={`${
                  selectedWords.includes(word) 
                    ? "bg-gold/20 border-gold/30" 
                    : "bg-secondary/10 hover:bg-secondary/20"
                }`}
                onClick={() => handleWordClick(word)}
                disabled={selectedWords.includes(word)}
              >
                {word}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={resetVerification}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light"
              onClick={handleVerificationSubmit}
              disabled={selectedWords.length !== 12}
            >
              <Check className="w-4 h-4 mr-2" />
              Verify
            </Button>
          </div>

          {verificationComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button 
                className="w-full bg-green-500 text-white hover:bg-green-600"
                onClick={onComplete}
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Backup
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default SeedPhraseBackup;
