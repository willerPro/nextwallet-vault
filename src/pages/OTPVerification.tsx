
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { 
  isValidOTPFormat, 
  getOTPVerificationState, 
  clearOTPVerificationState, 
  isOTPVerificationStateValid,
  sendOTPVerificationStatusToWebhook
} from "@/utils/otpUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { verifyOTP, user, session } = useAuth();
  const initializeRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializeRef.current) return;
    initializeRef.current = true;
    
    console.log("OTP verification page loaded with email:", email);
    
    // Check if there's a pending OTP verification
    const verificationState = getOTPVerificationState();
    
    if (!verificationState || !isOTPVerificationStateValid()) {
      console.log("No valid OTP verification state found. Redirecting to login.");
      toast.error("Session expired or invalid. Please log in again.");
      clearOTPVerificationState();
      navigate("/");
      return;
    }

    setEmail(verificationState.email);
    console.log("OTP verification page loaded with email:", verificationState.email);

    // Get session if it doesn't exist but we have a token
    const fetchUserSession = async () => {
      if (!user && !session && verificationState.sessionToken) {
        try {
          const { data, error } = await supabase.auth.getUser(verificationState.sessionToken);
          if (error || !data.user) {
            console.error("Error fetching user from token:", error);
            toast.error("Session expired. Please log in again.");
            clearOTPVerificationState();
            navigate("/");
            return;
          }
          console.log("Retrieved user from token:", data.user.email);
        } catch (error) {
          console.error("Exception fetching user:", error);
          clearOTPVerificationState();
          navigate("/");
        }
      }
    };
    
    fetchUserSession();

    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSessionExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, user, session]);

  const handleSessionExpired = () => {
    clearOTPVerificationState();
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
      // Get the verification state which contains the user ID
      const verificationState = getOTPVerificationState();
      if (!verificationState) {
        toast.error("Session expired. Please login again.");
        navigate('/');
        return;
      }
      
      // Verify OTP
      const { error, success } = await verifyOTP(otp);
      
      // Send verification status to webhook
      if (user) {
        await sendOTPVerificationStatusToWebhook(
          verificationState.email,
          user.id,
          success,
          otp
        );
      }
      
      if (!success) {
        toast.error(error || "Failed to verify OTP");
        setIsSubmitting(false);
        return;
      }

      // OTP verified successfully
      toast.success("OTP verification successful");
      
      // Clean up localStorage
      clearOTPVerificationState();
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If email is missing, render a minimal component before redirect happens
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Initializing verification page...</p>
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
                      clearOTPVerificationState();
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
