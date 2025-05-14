
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks an email address by showing only the first 4 characters 
 * followed by asterisks, and then the domain extension
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  
  const parts = email.split('@');
  if (parts.length !== 2) return email; // Return original if not a valid email
  
  const [username, domain] = parts;
  const domainParts = domain.split('.');
  const extension = domainParts.pop(); // Get the extension (.com, .org, etc.)
  
  // Show first 4 chars of username, then asterisks
  const maskedUsername = username.length <= 4 
    ? username 
    : `${username.substring(0, 4)}${'*'.repeat(username.length - 4)}`;
  
  return `${maskedUsername}@${extension ? `${domainParts.join('.')}.${extension}` : domain}`;
}
