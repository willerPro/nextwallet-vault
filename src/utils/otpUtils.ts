
/**
 * Utility functions for OTP generation and verification
 */

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
export const storeOTPVerificationState = (email: string, sessionToken: string): void => {
  localStorage.setItem('otpVerificationState', JSON.stringify({
    email,
    sessionToken,
    timestamp: Date.now()
  }));
};

/**
 * Get OTP verification data from localStorage
 */
export const getOTPVerificationState = (): { email: string; sessionToken: string; timestamp: number } | null => {
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
