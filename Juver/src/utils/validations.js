/**
 * Checks if a string value is empty, null, or only contains spaces
 * @param {string} value 
 * @returns {boolean} True if empty, false otherwise
 */
export const isEmpty = (value) => {
  return !value || value.trim().length === 0;
};

/**
 * Validates if an email has a correct format including '@' and a valid domain
 * @param {string} email 
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that the full name does not exceed the maximum allowed length
 * @param {string} name 
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidNameLength = (name) => {
  return name.length <= 50;
};

/**
 * Validates if the phone number contains exactly 10 numeric digits
 * @param {string} phone 
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates that the password has at least 6 characters (Firebase minimum requirement)
 * @param {string} password 
 * @returns {boolean} True if valid, false otherwise
 */
export const isStrongPassword = (password) => {
  return password.length >= 6;
};