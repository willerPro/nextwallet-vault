
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInternetConnection } from '@/hooks/useInternetConnection';
import OfflineFallback from '@/pages/OfflineFallback';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isOnline = useInternetConnection();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Skip if still loading
      if (loading) return;
      
      setIsCheckingAuth(true);
      
      // If not authenticated, redirect to home
      if (!user) {
        console.log("User not authenticated, redirecting to home");
        navigate('/', { replace: true });
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [user, loading, navigate]);

  if (!isOnline) {
    return <OfflineFallback />;
  }

  if (loading || isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gold">Loading...</div>
    </div>;
  }

  // Render protected routes if user is authenticated
  return user ? <Outlet /> : null;
};
