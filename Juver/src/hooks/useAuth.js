import { useState } from 'react';
import { authService, dbService } from '../services/database';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        try {
            setLoading(true);

            const userCredential = await authService.signInWithEmailAndPassword(
                email,
                password
            );

            return {
                success: true,
                user: userCredential.user,
            };
        } catch (error) {
            console.error('Login error:', error);

            return {
                success: false,
                error,
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async ({
        email,
        password,
        fullName,
        phoneNumber,
        gender,
        language,
        photoUrl,
    }) => {
        try {
            setLoading(true);

            const userCredential = await authService.createUserWithEmailAndPassword(
                email,
                password
            );

            const uid = userCredential.user.uid;

            await dbService.collection('Users').doc(uid).set({
                fullName,
                phoneNumber,
                gender,
                language,
                email,
                photoUrl,
                createdAt: new Date(),
            });

            return {
                success: true,
                user: userCredential.user,
            };
        } catch (error) {
            console.error('Register error:', error);

            return {
                success: false,
                error,
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);

            await authService.signOut();

            return {
                success: true,
            };
        } catch (error) {
            console.error('Logout error:', error);

            return {
                success: false,
                error,
            };
        } finally {
            setLoading(false);
        }
    };

    const sendPasswordReset = async (email) => {
        try {
            setLoading(true);

            await authService.sendPasswordResetEmail(email);

            return {
                success: true,
            };
        } catch (error) {
            console.error('Reset password error:', error);

            return {
                success: false,
                error,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        login,
        register,
        logout,
        sendPasswordReset,
    };
};