import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { DRIVERS_POOL } from '../utils/driversPool';
/**
 * 
 * Used for user registration, login, and session management.
 */
export const authService = auth();

/**
 * 
 * Used as the primary non-relational database for storing user profiles and trips.
 */
export const dbService = firestore();

/**
 * Creates a new trip document in Firestore.
 * @param {Object} tripData - The data of the trip to be saved.
 */
export const createTrip = async (tripData, categoryId) => {
    try {
        const docRef = await dbService.collection('trips').add({
            ...tripData,
            status: 'pending',
            createdAt: firestore.FieldValue.serverTimestamp(),
        });

        setTimeout(async () => {
            const pool = DRIVERS_POOL[categoryId] || DRIVERS_POOL.economico;
            const randomDriver = pool[Math.floor(Math.random() * pool.length)];
            await docRef.update({
                driver: randomDriver,
                status: 'accepted'
            });
        }, 5000);

        return docRef.id;

    } catch (error) {
        console.error("Error saving trip to Firestore: ", error);
        throw error;
    }
};