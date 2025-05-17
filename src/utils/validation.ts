
/**
 * Email validation regex pattern
 * This pattern validates that:
 * - Email contains a local part and domain separated by @
 * - Local part can contain alphanumeric characters, periods, underscores, percent signs, plus signs, or hyphens
 * - Domain must contain at least one period and valid domain characters
 */
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
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
