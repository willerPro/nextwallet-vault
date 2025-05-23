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
import Investors from "./pages/Investors";
import Challenges from "./pages/Challenges";
import Transactions from "./pages/Transactions";
import Receive from "./pages/Receive";
import Send from "./pages/Send";
import SendDetails from "./pages/SendDetails";
import Settings from "./pages/Settings";
import NodeSettings from "./pages/NodeSettings";
import CustomNetwork from "./pages/CustomNetwork";
import FiatCurrency from "./pages/FiatCurrency";
import ChangePinPage from "./pages/ChangePinPage";
import NotFound from "./pages/NotFound";
import OfflineFallback from "./pages/OfflineFallback";
import AddressBook from "./pages/AddressBook";
import Arbitrage from "./pages/Arbitrage";
import Bots from "./pages/Bots";
import BotDetails from "./pages/BotDetails";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BottomNavigation } from "./components/BottomNavigation";

function App() {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialRender, setIsInitialRender] = useState(true);
  const isOnline = useInternetConnection();

  useEffect(() => {
    // Prevent automatic redirection on initial render
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    // If user is authenticated and on index, go to dashboard
    if (isLoggedIn && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [isLoggedIn, user, location.pathname, navigate, isInitialRender]);

  // Check if the current route should display the bottom navigation
  const shouldShowBottomNav = () => {
    const publicRoutes = ["/", "/login", "/signup"];
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
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/wallet/:id" element={<WalletDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/challenges" element={<Challenges />} />
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
          <Route path="/arbitrage" element={<Arbitrage />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/bots/:botId" element={<BotDetails />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {shouldShowBottomNav() && <BottomNavigation />}
    </>
  );
}

export default App;
