
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateOTP, storeOTPVerificationState } from '@/utils/otpUtils';

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
  verifyOTP: (otp: string) => Promise<{
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

      console.log("Sign in successful, generating OTP");
      
      // Generate OTP and save it to the logins table
      const otp = generateOTP(6);
      
      // Calculate expiry time - 10 minutes from now
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);
      
      // Store OTP and session info in logins table with explicit expires_at
      const { error: otpError } = await supabase.from('logins').insert({
        user_id: data.user.id,
        user_email: email,
        otp,
        expires_at: expiryTime.toISOString(),
        verified: false
      });

      if (otpError) {
        console.error("Error saving OTP:", otpError);
        return { error: otpError, success: false };
      }
      
      console.log("OTP generated and stored, redirecting to verification page");

      // Store verification state in localStorage
      storeOTPVerificationState(email, data.session.access_token);
      
      // Navigate to OTP verification page
      navigate('/otp-verification');

      // Return success but don't set the session yet (will be set after OTP verification)
      return { 
        error: null, 
        success: true
      };
    } catch (error) {
      console.error("Sign in exception:", error);
      return { error, success: false };
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      if (!user) {
        // Get the current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          return { error: "No active session", success: false };
        }
        
        // Check if OTP is valid
        const { data, error } = await supabase
          .from("logins")
          .select("*")
          .eq("user_id", sessionData.session.user.id)
          .eq("otp", otp)
          .eq("verified", false)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          console.error("OTP verification error:", error);
          return { error: "Invalid or expired OTP code", success: false };
        }

        // Mark OTP as verified
        await supabase
          .from("logins")
          .update({ verified: true })
          .eq("id", data.id);

        // Set session and user
        setSession(sessionData.session);
        setUser(sessionData.session.user);

        return { error: null, success: true };
      } else {
        // User is already logged in
        return { error: null, success: true };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
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
        verifyOTP
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
