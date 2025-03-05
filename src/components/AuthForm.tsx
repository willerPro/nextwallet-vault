
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight, Mail, LockKeyhole, UserPlus, Coins } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isLogin ? "Successfully logged in!" : "Account created!");
      navigate("/wallet-setup"); // Redirect to the new wallet setup page
    }, 1500);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

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
          </div>

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
                    required
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
