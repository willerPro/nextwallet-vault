import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import WalletSetup from "./pages/WalletSetup";
import WalletDetails from "./pages/WalletDetails";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Receive from "./pages/Receive";
import Send from "./pages/Send";
import SendDetails from "./pages/SendDetails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AddressBook from "./pages/AddressBook";

function App() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Prevent automatic redirection on initial render
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    if (isLoggedIn && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [isLoggedIn, location, navigate, isInitialRender]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet/setup" element={<WalletSetup />} />
        <Route path="/wallet/:id" element={<WalletDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/send" element={<Send />} />
        <Route path="/send/:id" element={<SendDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/address-book" element={<AddressBook />} /> {/* New route */}
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
