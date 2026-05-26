/**
 * Checks if a string value is empty, null, undefined, or only contains spaces.
 * @param {string} value
 * @returns {boolean}
 */
export const isEmpty = (value) => {
    return !value || String(value).trim().length === 0;
};

/**
 * Validates if an email has a correct format including '@' and a valid domain.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (isEmpty(email)) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).trim());
};

/**
 * Validates that the full name does not exceed the maximum allowed length.
 * @param {string} name
 * @returns {boolean}
 */
export const isValidNameLength = (name) => {
    if (isEmpty(name)) return false;

    return String(name).trim().length <= 50;
};

/**
 * Validates if the phone number contains exactly 10 numeric digits.
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    if (isEmpty(phone)) return false;

    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(String(phone).trim());
};

/**
 * Validates that the password has at least 6 characters.
 * Firebase requires a minimum of 6 characters.
 * @param {string} password
 * @returns {boolean}
 */
export const isStrongPassword = (password) => {
    if (isEmpty(password)) return false;

    return String(password).length >= 6;
};

/**
 * Validates if the selected gender is valid.
 * @param {string} gender
 * @returns {boolean}
 */
export const isValidGender = (gender) => {
    const validGenders = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'];
    return validGenders.includes(gender);
};

/**
 * Validates if the selected language is valid.
 * @param {string} language
 * @returns {boolean}
 */
export const isValidLanguage = (language) => {
    const validLanguages = ['Español', 'Inglés'];
    return validLanguages.includes(language);
};

/**
 * Validates if the card holder name is not empty.
 * @param {string} name
 * @returns {boolean}
 */
export const isValidCardHolderName = (name) => {
    return !isEmpty(name);
};

/**
 * Cleans card number by removing spaces.
 * @param {string} cardNumber
 * @returns {string}
 */
export const cleanCardNumber = (cardNumber) => {
    return String(cardNumber || '').replace(/\s/g, '');
};

/**
 * Validates if a card number has between 13 and 16 numeric digits.
 * @param {string} cardNumber
 * @returns {boolean}
 */
export const isValidCardNumber = (cardNumber) => {
    const cleanNumber = cleanCardNumber(cardNumber);
    const cardRegex = /^[0-9]{13,16}$/;

    return cardRegex.test(cleanNumber);
};

/**
 * Validates if expiration date has MM/YY format and is not expired.
 * @param {string} expirationDate
 * @returns {boolean}
 */
export const isValidExpirationDate = (expirationDate) => {
    if (isEmpty(expirationDate)) return false;

    const expirationRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (!expirationRegex.test(expirationDate)) {
        return false;
    }

    const [monthText, yearText] = expirationDate.split('/');

    const expirationMonth = parseInt(monthText, 10);
    const expirationYear = 2000 + parseInt(yearText, 10);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (expirationYear < currentYear) {
        return false;
    }

    if (expirationYear === currentYear && expirationMonth < currentMonth) {
        return false;
    }

    return true;
};

/**
 * Validates if CVV has 3 or 4 numeric digits.
 * @param {string} cvv
 * @returns {boolean}
 */
export const isValidCvv = (cvv) => {
    const cleanCvv = String(cvv || '').replace(/\D/g, '');
    const cvvRegex = /^[0-9]{3,4}$/;

    return cvvRegex.test(cleanCvv);
};
