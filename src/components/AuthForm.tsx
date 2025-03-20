
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight, Mail, LockKeyhole, UserPlus, Coins, Fingerprint, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import PinAuthentication from "@/components/PinAuthentication";
import { useNavigate } from "react-router-dom";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const { signIn, signUp, biometricEnabled, authenticateWithBiometric } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        localStorage.setItem('lastLoginEmail', email);
        
        const { error, success } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Failed to sign in");
        } else if (success) {
          toast.info("Please verify using Google Authenticator");
          // Explicitly navigate to OTP verification page
          navigate('/otp-verification');
        }
      } else {
        const userData = fullName ? { full_name: fullName } : undefined;
        const { error, success } = await signUp(email, password, userData);
        if (error) {
          toast.error(error.message || "Failed to create account");
        } else if (success) {
          toast.success("Account created! Please check your email for verification.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleBiometricLogin = async () => {
    const canProceed = await authenticateWithBiometric();
    
    if (canProceed) {
      setShowBiometricAuth(true);
    }
  };

  const handlePinSuccess = async () => {
    setShowBiometricAuth(false);
    setIsLoading(true);
    try {
      const storedEmail = localStorage.getItem('lastLoginEmail');
      if (!storedEmail) {
        toast.error("No stored login credentials found");
        return;
      }

      const { error, success } = await signIn(storedEmail, "biometric-auth-placeholder");
      if (error) {
        toast.error("Biometric verification failed");
      } else if (success) {
        toast.info("Please verify the OTP code sent to your email");
      }
    } catch (error: any) {
      toast.error(error.message || "Biometric login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinCancel = () => {
    setShowBiometricAuth(false);
  };

  if (showBiometricAuth) {
    return (
      <PinAuthentication
        mode="verify"
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
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
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-2xl font-bold text-gradient-gold mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
            </motion.div>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Fill in the form to create your wallet"}
            </p>
            {isLogin && (
              <div className="mt-2 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-xs text-muted-foreground">Protected with Google Authenticator</span>
              </div>
            )}
          </div>

          {isLogin && biometricEnabled && (
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-11 border-gold/30 hover:border-gold/60"
                onClick={handleBiometricLogin}
              >
                <Fingerprint className="h-5 w-5 text-gold" />
                <span>Sign In with Biometrics</span>
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground/90"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10 bg-background/40 border-muted focus:border-gold/50 h-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground/90"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-background/40 border-muted focus:border-gold/50 h-10"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isLogin) {
                      localStorage.setItem('lastLoginEmail', e.target.value);
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground/90"
              >
                Password
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-background/40 border-muted focus:border-gold/50 h-10"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-primary-foreground hover:shadow-lg hover:shadow-gold/20 transition-all h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Coins className="mr-2 h-4 w-4 animate-pulse" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                <div className="flex items-center">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleForm}
                className="ml-1 text-gold hover:text-gold-light font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
