/**
 * Utility functions for OTP generation and verification
 */
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

/**
 * Generates a random numeric OTP code of the specified length
 */
export const generateOTP = (length: number = 6): string => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};

/**
 * Validate OTP format (all digits, correct length)
 */
export const isValidOTPFormat = (otp: string, length: number = 6): boolean => {
  return new RegExp(`^\\d{${length}}$`).test(otp);
};

/**
 * Store OTP verification data in localStorage
 */
export const storeOTPVerificationState = (email: string, sessionToken: string, secret?: string): void => {
  console.log("Storing OTP verification state for email:", email);
  localStorage.setItem('otpVerificationState', JSON.stringify({
    email,
    sessionToken,
    secret,
    timestamp: Date.now()
  }));
};

/**
 * Get OTP verification data from localStorage
 */
export const getOTPVerificationState = (): { 
  email: string; 
  sessionToken: string; 
  timestamp: number;
  secret?: string;
} | null => {
  const state = localStorage.getItem('otpVerificationState');
  if (!state) return null;
  
  try {
    return JSON.parse(state);
  } catch (error) {
    console.error('Error parsing OTP verification state:', error);
    return null;
  }
};

/**
 * Clear OTP verification data from localStorage
 */
export const clearOTPVerificationState = (): void => {
  localStorage.removeItem('otpVerificationState');
};

/**
 * Check if OTP verification state is valid (not expired)
 */
export const isOTPVerificationStateValid = (): boolean => {
  const state = getOTPVerificationState();
  if (!state) return false;
  
  // Check if the state is not older than 10 minutes
  const tenMinutesInMs = 10 * 60 * 1000;
  return Date.now() - state.timestamp < tenMinutesInMs;
};

/**
 * Send OTP verification result to webhook
 */
export const sendOTPVerificationStatusToWebhook = async (
  email: string,
  userId: string,
  success: boolean,
  otpEntered?: string
): Promise<void> => {
  try {
    const webhookUrl = "https://signal7888.app.n8n.cloud/webhook-test/";
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        userId,
        success,
        otpEntered,
        authMethod: 'google-authenticator',
        action: 'verification',
        timestamp: new Date().toISOString()
      })
    });
    console.log("OTP verification status sent to webhook successfully");
  } catch (error) {
    console.error("Error sending OTP verification status to webhook:", error);
  }
};

// Google Authenticator (TOTP) functions

/**
 * Generate a new TOTP secret for a user
 */
export const generateTOTPSecret = (email: string, issuer: string = 'CryptoWallet'): {
  secret: string;
  uri: string;
} => {
  // Create a new TOTP object.
  const totp = new OTPAuth.TOTP({
    issuer,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.random(20) // Fix: use random() instead of generate()
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString()
  };
};

/**
 * Generate a QR code from a TOTP URI
 */
export const generateQRCode = async (uri: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(uri);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Verify a TOTP token
 */
export const verifyTOTP = (token: string, secret: string): boolean => {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: 'CryptoWallet',
      label: 'user',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });

    // Verify the token
    const delta = totp.validate({ token });
    
    // delta is null if the token is invalid
    // Otherwise, it's the time step difference between the client and server
    return delta !== null;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
};
