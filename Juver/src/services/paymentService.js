import firestore from '@react-native-firebase/firestore';
import { dbService } from './database';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanCardNumber = (cardNumber) => {
    return String(cardNumber || '').replace(/\s/g, '');
};

const getCardBrand = (cardNumber) => {
    const cleanNumber = cleanCardNumber(cardNumber);

    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';

    return 'Unknown';
};

const getLastFourDigits = (cardNumber) => {
    const cleanNumber = cleanCardNumber(cardNumber);
    return cleanNumber.slice(-4);
};

/**
 * Simulates a payment process using Stripe, Mercado Pago, or Cash.
 * This function does not store sensitive card information.
 *
 * @param {Object} paymentData
 * @param {string} paymentData.tripId
 * @param {string} paymentData.provider
 * @param {string} paymentData.paymentType
 * @param {number} paymentData.amount
 * @param {Object} paymentData.cardData
 * @returns {Promise<Object>}
 */
export const processPayment = async ({
    tripId,
    provider,
    paymentType,
    amount,
    cardData = null,
}) => {
    try {
        if (!tripId || !provider || !paymentType || !amount) {
            throw new Error('Missing payment information.');
        }

        await delay(2000);

        if (paymentType !== 'cash') {
            const cleanNumber = cleanCardNumber(cardData?.cardNumber);

            if (
                !cardData?.cardHolderName ||
                !cleanNumber ||
                !cardData?.expirationDate ||
                !cardData?.cvv
            ) {
                throw new Error('Missing card information.');
            }

            if (cleanNumber.endsWith('0000')) {
                throw new Error('Payment declined by simulated gateway.');
            }
        }

        const paymentInfo = {
            provider,
            paymentType,
            amount,
            status: 'paid',
            paidAt: firestore.FieldValue.serverTimestamp(),
        };

        if (paymentType !== 'cash') {
            paymentInfo.card = {
                holderName: cardData.cardHolderName,
                brand: getCardBrand(cardData.cardNumber),
                lastFourDigits: getLastFourDigits(cardData.cardNumber),
            };
        }

        await dbService.collection('trips').doc(tripId).update({
            payment: paymentInfo,
            paymentStatus: 'paid',
            status: 'completed',
        });

        return {
            success: true,
            payment: paymentInfo,
        };
    } catch (error) {
        console.error('Payment error:', error);

        return {
            success: false,
            error: error.message,
        };
    }
};
