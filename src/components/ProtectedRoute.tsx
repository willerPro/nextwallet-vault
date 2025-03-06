
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
      
      // Special case for OTP verification page
      if (location.pathname === '/otp-verification') {
        const otpState = getOTPVerificationState();
        const hasValidOtpState = otpState && isOTPVerificationStateValid();
        
        // If OTP verification state is valid, allow access
        if (hasValidOtpState) {
          console.log("Valid OTP verification state found, allowing access to OTP page");
          return;
        }
        
        // If on OTP page but no valid state and no user, redirect to login
        if (!user) {
          console.log("No valid OTP state or user, redirecting to login");
          navigate('/', { replace: true });
          return;
        }
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
            
            // If on OTP page, don't sign out, just let them verify
            if (location.pathname !== '/otp-verification') {
              // Redirect to OTP verification if not there already
              navigate('/otp-verification', { replace: true });
            }
          }
        } catch (error) {
          console.error("Error checking login verification:", error);
        }
      } else {
        // If not authenticated and not on OTP page with valid state, redirect to home
        if (location.pathname !== '/otp-verification' || 
            !getOTPVerificationState() || 
            !isOTPVerificationStateValid()) {
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

  // For OTP verification page, require either user or valid OTP state
  if (location.pathname === '/otp-verification') {
    const hasValidState = getOTPVerificationState() && isOTPVerificationStateValid();
    return (user || hasValidState) ? <Outlet /> : null;
  }

  // For all other protected routes, require user with verified login
  return user ? <Outlet /> : null;
};
