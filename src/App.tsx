
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AuthProvider } from "@/context/AuthContext";

// Import pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Market from "./pages/Market";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import WalletSetup from "./pages/WalletSetup";
import Transactions from "./pages/Transactions";
import Send from "./pages/Send";
import SendDetails from "./pages/SendDetails";
import Receive from "./pages/Receive";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/wallet-setup" element={<WalletSetup />} />
                <Route path="/market" element={<Market />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/send" element={<Send />} />
                <Route path="/send/:id" element={<SendDetails />} />
                <Route path="/receive" element={<Receive />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
            <BottomNavigation />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
