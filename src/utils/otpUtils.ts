
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
