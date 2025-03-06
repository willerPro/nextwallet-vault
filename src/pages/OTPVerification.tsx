
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { isValidOTPFormat } from "@/utils/otpUtils";
import { useAuth } from "@/context/AuthContext";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setSession } = useAuth();
  
  // Get email and session from location state
  const email = location.state?.email || "";
  const tempSession = location.state?.session || null;

  useEffect(() => {
    // Redirect if no email or session in state (user accessed page directly)
    if (!email || !tempSession) {
      console.log("Missing email or session. Redirecting to login.");
      toast.error("Invalid session. Please log in again.");
      navigate("/");
      return;
    }

    console.log("OTP verification page loaded with email:", email);

    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Sign out and redirect when timer expires
          handleSessionExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate, tempSession]);

  const handleSessionExpired = async () => {
    await supabase.auth.signOut();
    toast.error("OTP verification time expired. Please log in again.");
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidOTPFormat(otp)) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Verifying OTP for user:", tempSession.user.id);
      
      // Check if OTP is valid
      const { data, error } = await supabase
        .from("logins")
        .select("*")
        .eq("user_id", tempSession.user.id)
        .eq("user_email", email)
        .eq("otp", otp)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error("OTP verification error:", error);
        toast.error("Invalid or expired OTP code");
        setIsSubmitting(false);
        return;
      }

      console.log("Valid OTP found:", data.id);

      // Mark OTP as verified
      await supabase
        .from("logins")
        .update({ verified: true })
        .eq("id", data.id);

      // Complete the authentication
      toast.success("OTP verification successful");
      
      // Update auth context with the session
      setSession(tempSession);
      setUser(tempSession.user);
      
      console.log("Authentication complete, redirecting to dashboard");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If email or session is missing, render a minimal component before redirect happens
  if (!email || !tempSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10 px-6 py-10">
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="lg" />
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-center items-center pb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <GlassCard 
              variant="gold"
              className="shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gradient-gold mb-2">
                  Two-Factor Authentication
                </h2>
                <p className="text-muted-foreground text-sm">
                  An OTP code has been sent to your email. Enter it below to continue.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium">
                    Enter OTP Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>

                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Time remaining: <span className="font-medium">{formatTime(timeLeft)}</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary-foreground h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="text-gold hover:text-gold-light font-medium transition-colors"
                    onClick={() => {
                      toast.error("Please sign in again to request a new OTP");
                      navigate("/");
                    }}
                  >
                    Try again
                  </button>
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
