
import { ReactNode, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useInternetConnection } from '@/hooks/useInternetConnection';
import OfflineFallback from '@/pages/OfflineFallback';
import { supabase } from '@/integrations/supabase/client';

export const ProtectedRoute = () => {
  const { user, loading, setUser, setSession } = useAuth();
  const navigate = useNavigate();
  const isOnline = useInternetConnection();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!loading && user) {
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
            // If no verified login found, sign the user out
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            navigate('/');
          }
        } catch (error) {
          console.error("Error checking login verification:", error);
        }
      } else if (!loading && !user) {
        navigate('/');
      }
    };

    checkAuthentication();
  }, [user, loading, navigate, setUser, setSession]);

  if (!isOnline) {
    return <OfflineFallback />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gold">Loading...</div>
    </div>;
  }

  return user ? <Outlet /> : null;
};
