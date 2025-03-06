
import { useEffect } from 'react';
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

  useEffect(() => {
    const checkAuthentication = async () => {
      // Skip if still loading
      if (loading) return;
      
      // If user is on OTP verification page and has valid verification state, allow them to stay
      if (location.pathname === '/otp-verification') {
        const hasValidOtpState = getOTPVerificationState() && isOTPVerificationStateValid();
        if (hasValidOtpState) {
          return; // Allow access to OTP verification page with valid state
        }
      }
      
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
            // If no verified login found, sign the user out
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error("Error checking login verification:", error);
        }
      } else {
        // Don't redirect if on OTP verification page
        if (location.pathname !== '/otp-verification') {
          console.log("User not authenticated, redirecting to home");
          navigate('/', { replace: true });
        }
      }
    };

    checkAuthentication();
  }, [user, loading, navigate, setUser, setSession, location.pathname]);

  if (!isOnline) {
    return <OfflineFallback />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gold">Loading...</div>
    </div>;
  }

  // Allow access to OTP verification page without requiring user
  if (location.pathname === '/otp-verification') {
    return <Outlet />;
  }

  // For all other protected routes, require user
  return user ? <Outlet /> : null;
};
