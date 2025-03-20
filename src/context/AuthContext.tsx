
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  generateTOTPSecret, 
  storeOTPVerificationState, 
  verifyTOTP 
} from '@/utils/otpUtils';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoggedIn: boolean;
  biometricEnabled: boolean;
  toggleBiometricEnabled: () => Promise<void>;
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  verifyGoogleAuth: (token: string, secret?: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const storedBiometricEnabled = localStorage.getItem('biometricEnabled');
    if (storedBiometricEnabled) {
      setBiometricEnabled(storedBiometricEnabled === 'true');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleBiometricEnabled = async () => {
    const newValue = !biometricEnabled;
    
    if (newValue) {
      if (!window.PublicKeyCredential) {
        toast.error("Your browser doesn't support biometric authentication");
        return;
      }
      
      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          toast.error("Your device doesn't have biometric capabilities");
          return;
        }
      } catch (error) {
        console.error("Error checking biometric support:", error);
        toast.error("Failed to check biometric capability");
        return;
      }
    }
    
    setBiometricEnabled(newValue);
    localStorage.setItem('biometricEnabled', newValue.toString());
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!biometricEnabled) {
      return false;
    }

    try {
      if (window.PublicKeyCredential) {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) {
          toast.error("Biometric authentication not available on this device");
          return false;
        }
        
        return true;
      } else {
        toast.error("Your browser doesn't support biometric authentication");
        return false;
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      toast.error("Biometric authentication failed");
      return false;
    }
  };

  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        return { error, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      return { error, success: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Sign in error:", error);
        return { error, success: false };
      }

      console.log("Sign in successful, initializing Google Authenticator");
      
      // Check if user has TOTP set up
      const { data: authSettings, error: settingsError } = await supabase
        .from('user_auth_settings')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
        
      let totpSecret: string;
        
      if (settingsError) {
        console.error("Error fetching auth settings:", settingsError);
        return { error: settingsError, success: false };
      }
      
      if (!authSettings || !authSettings.totp_secret) {
        // First login or TOTP not set up yet - generate new secret
        console.log("No TOTP secret found, generating new one");
        
        // Generate TOTP secret
        const { secret, uri } = generateTOTPSecret(email);
        totpSecret = secret;
        
        // Store TOTP data in user_auth_settings table
        const { error: insertError } = await supabase.from('user_auth_settings').upsert({
          user_id: data.user.id,
          user_email: email,
          totp_secret: secret,
          totp_enabled: false,
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error("Error saving TOTP settings:", insertError);
          return { error: insertError, success: false };
        }
        
        console.log("TOTP secret generated and stored, redirecting to verification page for setup");
        
        // Store verification state with the secret for QR code generation
        storeOTPVerificationState(email, data.session.access_token, secret);
        
      } else {
        // User already has TOTP set up
        console.log("TOTP secret found, redirecting to verification page");
        totpSecret = authSettings.totp_secret;
        
        // Store verification state without the secret (no setup needed)
        storeOTPVerificationState(email, data.session.access_token, totpSecret);
      }
      
      // Set session and user state
      setSession(data.session);
      setUser(data.user);
      
      // Navigate to OTP verification page
      navigate('/otp-verification');
      
      // Return success
      return { 
        error: null, 
        success: true
      };
    } catch (error) {
      console.error("Sign in exception:", error);
      return { error, success: false };
    }
  };

  const verifyGoogleAuth = async (token: string, secret?: string) => {
    try {
      // Check if we already have a user from the sign-in process
      const currentUser = user || (session ? session.user : null);
      
      if (!currentUser) {
        return { error: "No active session", success: false };
      }

      if (!secret) {
        // Try to get the secret from database
        const { data, error } = await supabase
          .from('user_auth_settings')
          .select('totp_secret')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error || !data || !data.totp_secret) {
          console.error("Error fetching TOTP secret:", error);
          return { error: "Unable to verify authentication", success: false };
        }
        
        secret = data.totp_secret;
      }
      
      // Verify the TOTP token
      const isValid = verifyTOTP(token, secret);
      
      if (!isValid) {
        return { error: "Invalid authentication code", success: false };
      }
      
      // Mark TOTP as enabled if not already
      await supabase
        .from('user_auth_settings')
        .update({ 
          totp_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);

      return { error: null, success: true };
    } catch (error) {
      console.error("TOTP verification error:", error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isLoggedIn: !!user,
        biometricEnabled,
        toggleBiometricEnabled,
        signUp,
        signIn,
        signOut,
        authenticateWithBiometric,
        setUser,
        setSession,
        verifyGoogleAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
