
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Check, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PinAuthenticationProps {
  mode: 'create' | 'verify';
  onSuccess: () => void;
  onCancel?: () => void;
}

const PinAuthentication: React.FC<PinAuthenticationProps> = ({ mode, onSuccess, onCancel }) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
      setError(null);
    }
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setConfirmPin(value);
      setError(null);
    }
  };

  const handleCreatePin = async () => {
    if (!user) return;
    
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('pin_auth' as any)
        .insert([{ user_id: user.id, pin }]);

      if (dbError) throw dbError;
      
      toast.success("PIN created successfully");
      onSuccess();
    } catch (err: any) {
      console.error("Error creating PIN:", err);
      setError(err.message || "Failed to create PIN");
      toast.error("Failed to create PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!user) return;
    
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('pin_auth' as any)
        .select('pin')
        .eq('user_id', user.id)
        .single();

      if (dbError) throw dbError;
      
      if (data.pin === pin) {
        toast.success("PIN verified successfully");
        onSuccess();
      } else {
        setError("Incorrect PIN");
        toast.error("Incorrect PIN");
      }
    } catch (err: any) {
      console.error("Error verifying PIN:", err);
      setError(err.message || "Failed to verify PIN");
      toast.error("Failed to verify PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard variant="dark" className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-gold">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Create Security PIN' : 'Enter Security PIN'}
          </h2>
          
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {mode === 'create' 
              ? 'Create a 4-6 digit PIN to secure your wallet operations'
              : 'Enter your security PIN to continue'}
          </p>

          <div className="w-full max-w-xs space-y-4 mt-2">
            <div>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter PIN"
                value={pin}
                onChange={handlePinChange}
                className="text-center text-lg bg-background/40"
              />
            </div>

            {mode === 'create' && (
              <div>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChange={handleConfirmPinChange}
                  className="text-center text-lg bg-background/40"
                />
              </div>
            )}

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              {onCancel && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              
              <Button
                className="flex-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:shadow-lg hover:shadow-gold/20"
                onClick={mode === 'create' ? handleCreatePin : handleVerifyPin}
                disabled={loading || (mode === 'create' ? !pin || !confirmPin : !pin)}
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create PIN' : 'Verify PIN'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default PinAuthentication;
