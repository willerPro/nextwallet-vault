
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Check, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const ChangePinPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePinChange = (setState: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setState(value);
      setError(null);
    }
  };

  const handleChangePin = async () => {
    if (!user) {
      toast.error("You must be logged in to change your PIN");
      navigate("/");
      return;
    }
    
    if (currentPin.length < 4) {
      setError("Current PIN must be at least 4 digits");
      return;
    }

    if (newPin.length < 4) {
      setError("New PIN must be at least 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PINs do not match");
      return;
    }

    setLoading(true);
    try {
      // Verify current PIN first
      const { data: existingPin, error: fetchError } = await supabase
        .from('pin_auth')
        .select('pin')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }
      
      if (!existingPin || existingPin.pin !== currentPin) {
        setError("Current PIN is incorrect");
        setLoading(false);
        return;
      }

      // Update PIN
      const { error: updateError } = await supabase
        .from('pin_auth')
        .update({ pin: newPin })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }
      
      toast.success("PIN changed successfully");
      navigate("/profile");
    } catch (err: any) {
      console.error("Error changing PIN:", err);
      setError(err.message || "Failed to change PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col pb-24">
      {/* Header */}
      <div className="p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/profile")}
          className="mr-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Change Security PIN</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="dark" className="p-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-gold">
                <Lock className="w-8 h-8" />
              </div>
              
              <h2 className="text-xl font-bold">Change Security PIN</h2>
              
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Enter your current PIN and create a new 4-6 digit PIN to secure your wallet operations
              </p>

              <div className="w-full space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Current PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter current PIN"
                    value={currentPin}
                    onChange={handlePinChange(setCurrentPin)}
                    className="text-center text-lg bg-background/40"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">New PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter new PIN"
                    value={newPin}
                    onChange={handlePinChange(setNewPin)}
                    className="text-center text-lg bg-background/40"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Confirm New PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Confirm new PIN"
                    value={confirmPin}
                    onChange={handlePinChange(setConfirmPin)}
                    className="text-center text-lg bg-background/40"
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:shadow-lg hover:shadow-gold/20"
                  onClick={handleChangePin}
                  disabled={loading || !currentPin || !newPin || !confirmPin}
                >
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Change PIN
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePinPage;
