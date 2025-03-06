
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInternetConnection } from '@/hooks/useInternetConnection';
import OfflineFallback from '@/pages/OfflineFallback';
import { supabase } from '@/integrations/supabase/client';
import { getOTPVerificationState, isOTPVerificationStateValid } from '@/utils/otpUtils';

export const ProtectedRoute = () => {
  const { user, loading, setUser, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useInternetConnection();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Skip if still loading
      if (loading) return;
      
      setIsCheckingAuth(true);
      
      // Special case for OTP verification page - don't redirect if already there
      if (location.pathname === '/otp-verification') {
        setIsCheckingAuth(false);
        return;
      }
      
      // For all other protected routes
      if (user) {
        try {
          // Check if the user has a verified login
          const { data, error } = await supabase
            .from('logins')
            .select('*')
            .eq('user_id', user.id)
            .eq('verified', true)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (error || !data || data.length === 0) {
            console.log("No verified login found for user:", user.id);
            
            // If not on OTP page already, redirect there
            if (location.pathname !== '/otp-verification') {
              navigate('/otp-verification', { replace: true });
            }
          }
          setIsCheckingAuth(false);
        } catch (error) {
          console.error("Error checking login verification:", error);
          setIsCheckingAuth(false);
        }
      } else {
        // If not authenticated and not on OTP page with valid state, redirect to home
        const hasValidOtpState = getOTPVerificationState() && isOTPVerificationStateValid();
        
        if (location.pathname !== '/otp-verification' || !hasValidOtpState) {
          console.log("User not authenticated, redirecting to home");
          navigate('/', { replace: true });
        }
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [user, loading, navigate, setUser, setSession, location.pathname]);

  if (!isOnline) {
    return <OfflineFallback />;
  }

  if (loading || isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gold">Loading...</div>
    </div>;
  }

  // For OTP verification page, we don't need to check further
  if (location.pathname === '/otp-verification') {
    return <Outlet />;
  }

  // For all other protected routes, require user with verified login
  return user ? <Outlet /> : null;
};
