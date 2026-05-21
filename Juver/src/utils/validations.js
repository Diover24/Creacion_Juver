

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