/**
 * Email validation regex pattern
 * This pattern validates that:
 * - Email contains a local part and domain separated by @
 * - Domain contains at least one period
 * - No empty parts or whitespace
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Just trim whitespace and apply the simple regex pattern
  const trimmedEmail = email.trim();
  return EMAIL_REGEX.test(trimmedEmail);
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
