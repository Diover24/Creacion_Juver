import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Initialize Firebase authentication service.
 * Used for user registration, login, and session management.
 */
export const authService = auth();

/**
 * Initialize Cloud Firestore service.
 * Used as the primary non-relational database for storing user profiles and trips.
 */
export const dbService = firestore();