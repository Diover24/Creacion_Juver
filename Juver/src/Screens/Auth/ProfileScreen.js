import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {authService} from '../../services/database'

const ProfileScreen = () => {

    const handleLogout = () => {
        authService.signOut().catch(error => {
            console.error("Error al cerrar sesión:", error);
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil de Usuario</Text>
            
            <Text style={styles.email}>
                {authService.currentUser?.email || 'Usuario'}
            </Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProfileScreen;