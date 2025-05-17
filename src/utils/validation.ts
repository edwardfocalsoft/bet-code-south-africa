
/**
 * Email validation regex pattern
 * This pattern validates that:
 * - Email contains a local part and domain separated by @
 * - Uses a more permissive approach to allow for wider range of valid emails
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  console.log("Validating email:", email);
  
  // Trim whitespace and check the email matches the regex pattern
  const trimmedEmail = email.trim();
  
  // Use more permissive regex test
  const isValidFormat = EMAIL_REGEX.test(trimmedEmail);
  console.log("Email format valid:", isValidFormat);
  
  if (!isValidFormat) return false;
  
  // Check for minimum structure requirements (has @ and domain)
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  
  const [localPart, domainPart] = parts;
  
  // Check domain has at least one dot
  if (!domainPart.includes('.')) return false;
  
  // Ensure valid domain structure
  const domains = domainPart.split('.');
  const tld = domains[domains.length - 1];
  
  // Ensure TLD exists
  if (!tld) return false;
  
  console.log("Email validation result: true");
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
