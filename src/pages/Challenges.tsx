
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Info, Calendar, User, Wallet, Bell, Clock, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertWarning } from "@/components/ui/alert-warning";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { challengesTable } from "@/utils/supabaseHelpers";
import { Input } from "@/components/ui/input";
import { maskEmail } from "@/lib/utils";
import { generateOTP, isValidOTPFormat } from "@/utils/otpUtils";

interface Challenge {
  id: string;
  name: string;
  api_key: string;
  secret_key: string;
  balance: string;
  status: string;
  created_at: string;
  user_id: string;
}

const MOCK_CHALLENGE = {
  balance: "$ 97,860",
  planType: "Express |50k",
  accountType: "Swap",
  tradingCycle: {
    startDate: "May 4, 2025",
    endDate: "May 31, 2025"
  }
};

const Challenges = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile(user);
  
  // Get the user's first name
  const firstName = profile?.full_name?.split(" ")[0] || "Tim";
  
  // Mock email for demo purposes
  const userEmail = "tim.brookietech@gmail.com";
  const maskedEmail = maskEmail(userEmail);
  
  // Load challenge from database
  const loadChallenge = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await challengesTable.select(user.id);
        
      if (error) throw error;
      
      // If user has a challenge, use it; otherwise use mock data
      if (data && data.length > 0) {
        setChallenge(data[0] as Challenge);
      } else {
        // Just mock for display
        console.log("No challenge data found, using mock data");
        // We'll still use the MOCK_CHALLENGE for display purposes
      }
    } catch (error: any) {
      console.error("Error loading challenge:", error);
      
      if (error.code === "42P01") {
        console.log("Challenges table doesn't exist yet");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sending verification code
  const handleSendCode = async () => {
    setIsSendingCode(true);
    
    try {
      // In a real application, this would send an actual email
      // For now we'll just simulate it
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate network delay
      
      toast.success(`Verification code sent to ${maskedEmail}`);
      
      // Close the withdraw dialog and open the confirmation dialog
      setIsWithdrawDialogOpen(false);
      setIsConfirmationDialogOpen(true);
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code. Please try again later.");
    } finally {
      setIsSendingCode(false);
    }
  };
  
  // Handle verification code submission
  const handleVerifyCode = async () => {
    if (!isValidOTPFormat(verificationCode)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // In a real application, this would verify the code with the backend
      // For now we'll just simulate it
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate network delay
      
      // For demo purposes, let's consider any 6-digit code as valid
      toast.success("Withdrawal request submitted successfully");
      setIsConfirmationDialogOpen(false);
      setVerificationCode("");
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Load challenge when component mounts
  useEffect(() => {
    loadChallenge();
  }, [user]);

  return (
    <div className="min-h-screen w-full flex flex-col pb-24 p-4">
      {/* Header */}
      <motion.header 
        className="flex items-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Award className="h-7 w-7 mr-3 text-amber-500" />
        <h1 className="text-2xl font-bold">Trading Challenge</h1>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 space-y-6">
        {/* User Welcome Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <GlassCard variant="gold" className="mb-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 mr-2 text-amber-500" />
              <h2 className="text-lg font-semibold">Hello {firstName}</h2>
            </div>
            <p className="text-gray-200">Currently, you have an Express account</p>
          </GlassCard>
        </motion.div>

        {/* Account Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-amber-500" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{MOCK_CHALLENGE.balance}</div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => setIsWithdrawDialogOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Send className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Plan Type</span>
                <span className="font-medium">{MOCK_CHALLENGE.planType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium">{MOCK_CHALLENGE.accountType}</span>
              </div>
            </CardContent>
          </Card>

          {/* Trading Cycle Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Trading Cycle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{MOCK_CHALLENGE.tradingCycle.startDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">{MOCK_CHALLENGE.tradingCycle.endDate}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information and Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2 text-primary" />
                Notifications & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-amber-500" />
                  <p className="text-sm">Your challenge is active and running</p>
                </div>
                
                <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-amber-500/30 hover:bg-amber-500/10 w-full mt-2">
                      <Info className="h-4 w-4 mr-2" />
                      View Important Notice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Important Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <p>
                        Our server checks for accounts that have reached the profit target every day at 11:45 PM GMT+3 and GMT+2 during daylight saving period. So, once you hit the profit target, please wait until that time to see the KYC and agreement appear in your dashboard.
                      </p>
                      <p>
                        After you complete the KYC and sign the agreement, you should receive your FundedNext account or an email from our team within 24 hours of reaching your profit target. If you don't get either after that time, feel free to reach out to our live support for help!
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/30 pt-4">
              <Button className="w-full" variant="default">
                <Award className="h-4 w-4 mr-2" />
                View Trading Performance
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              To withdraw funds, we need to verify your identity. A verification code will be sent to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{maskedEmail}</span>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsWithdrawDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSendCode} disabled={isSendingCode}>
              {isSendingCode ? "Sending..." : "Send Verification Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Code Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              Please enter the 6-digit verification code sent to {maskedEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <Input
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsConfirmationDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleVerifyCode} disabled={isVerifying || verificationCode.length !== 6}>
              {isVerifying ? "Verifying..." : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Challenges;
