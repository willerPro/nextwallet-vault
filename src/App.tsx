
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useInternetConnection } from "./hooks/useInternetConnection";
import { supabase } from "./integrations/supabase/client";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/Wallet";
import WalletDetails from "./pages/WalletDetails";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Receive from "./pages/Receive";
import Send from "./pages/Send";
import SendDetails from "./pages/SendDetails";
import Settings from "./pages/Settings";
import NodeSettings from "./pages/NodeSettings";
import CustomNetwork from "./pages/CustomNetwork";
import FiatCurrency from "./pages/FiatCurrency";
import ChangePinPage from "./pages/ChangePinPage";
import OTPVerification from "./pages/OTPVerification";
import NotFound from "./pages/NotFound";
import OfflineFallback from "./pages/OfflineFallback";
import AddressBook from "./pages/AddressBook";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BottomNavigation } from "./components/BottomNavigation";
import { getOTPVerificationState, isOTPVerificationStateValid } from "./utils/otpUtils";

function App() {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialRender, setIsInitialRender] = useState(true);
  const isOnline = useInternetConnection();
  const [hasCheckedOTPState, setHasCheckedOTPState] = useState(false);

  useEffect(() => {
    // Prevent automatic redirection on initial render
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    // Skip if already on OTP verification page to prevent redirection loop
    if (location.pathname === '/otp-verification') {
      setHasCheckedOTPState(true);
      return;
    }

    // If there's a valid OTP verification state, redirect to the OTP verification page
    const otpState = getOTPVerificationState();
    if (otpState && isOTPVerificationStateValid() && !hasCheckedOTPState) {
      setHasCheckedOTPState(true);
      navigate('/otp-verification');
      return;
    }

    // If user is authenticated and on index but has already verified, go to dashboard
    if (isLoggedIn && location.pathname === "/" && hasCheckedOTPState) {
      // Check if user already has a verified login, then redirect to dashboard
      const checkVerifiedLogin = async () => {
        try {
          const { data } = await supabase
            .from('logins')
            .select('verified')
            .eq('user_id', user?.id)
            .eq('verified', true)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (data && data.length > 0) {
            navigate("/dashboard");
          } else if (location.pathname !== "/otp-verification") {
            // If no verified login but user is logged in, go to OTP page
            navigate("/otp-verification");
          }
        } catch (error) {
          console.error("Error checking verified login:", error);
        }
      };
      
      if (user) {
        checkVerifiedLogin();
      }
    }
  }, [isLoggedIn, user, location.pathname, navigate, isInitialRender, hasCheckedOTPState]);

  // Check if the current route should display the bottom navigation
  const shouldShowBottomNav = () => {
    const publicRoutes = ["/", "/login", "/signup", "/otp-verification"];
    return !publicRoutes.includes(location.pathname);
  };

  // If we're offline and not on the home page, show the offline fallback
  // We still allow the home page to render even when offline
  if (!isOnline && location.pathname !== "/") {
    return <OfflineFallback />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/wallet/:id" element={<WalletDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-pin" element={<ChangePinPage />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/send" element={<Send />} />
          <Route path="/send/:id" element={<SendDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/node-settings" element={<NodeSettings />} />
          <Route path="/custom-network" element={<CustomNetwork />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/fiat-currency" element={<FiatCurrency />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {shouldShowBottomNav() && <BottomNavigation />}
    </>
  );
}

export default App;
