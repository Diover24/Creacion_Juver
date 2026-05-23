import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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
export const createTrip = async (tripData) => {
    try {
        return await dbService.collection('trips').add({
            ...tripData,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving trip to Firestore: ", error);
        throw error;
    }
};