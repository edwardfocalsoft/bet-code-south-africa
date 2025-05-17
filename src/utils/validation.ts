
/**
 * Email validation regex pattern
 * This pattern validates that:
 * - Email contains a local part and domain separated by @
 * - Local part can contain alphanumeric characters, periods, underscores, percent signs, plus signs, or hyphens
 * - Domain must contain at least one period and valid domain characters
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Trim whitespace and check the email matches the regex pattern
  const trimmedEmail = email.trim();
  
  // First check basic format
  if (!EMAIL_REGEX.test(trimmedEmail)) return false;
  
  // Additional validation: check for consecutive dots in local or domain parts
  const [localPart, domainPart] = trimmedEmail.split('@');
  
  if (localPart.includes('..') || domainPart.includes('..')) return false;
  
  // Check if domain has at least one dot and valid TLD
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) return false;
  
  // Ensure TLD is at least 2 characters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;
  
  return true;
};

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object containing validation result and message
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
  return { valid: true };
};
