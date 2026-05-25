import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { authService, dbService } from '../../services/database';

const ProfileScreen = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.currentUser;

        if (!currentUser) {
            setLoading(false);
            return;
        }
        const unsubscribe = dbService
            .collection('Users')
            .doc(currentUser.uid)
            .onSnapshot(
                (documentSnapshot) => {
                    if (documentSnapshot.exists) {
                        setUserData(documentSnapshot.data());
                    } else {
                        console.log("El documento del usuario no existe en Firestore.");
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error("Error al obtener el perfil:", error);
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        authService.signOut().catch(error => {
            console.error("Error al cerrar sesión:", error);
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={{ marginTop: 10 }}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Perfil de Usuario</Text>
            <View style={styles.imageContainer}>
                {userData?.photoUrl ? (
                    <Image source={{ uri: userData.photoUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>Sin Foto</Text>
                    </View>
                )}
            </View>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Nombre Completo:</Text>
                    <Text style={styles.value}>{userData?.fullName || 'No registrado'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Número de Celular:</Text>
                    <Text style={styles.value}>{userData?.phoneNumber || 'No registrado'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Género:</Text>
                    <Text style={styles.value}>{userData?.gender || 'No registrado'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Correo Electrónico:</Text>
                    <Text style={styles.value}>{userData?.email || authService.currentUser?.email}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Idioma de Preferencia:</Text>
                    <Text style={styles.value}>{userData?.language || 'No registrado'}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        marginTop: 10,
    },
    imageContainer: {
        marginBottom: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderRadius: 60,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e1e4e8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    avatarText: {
        color: '#586069',
        fontSize: 14,
        fontWeight: '500',
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    infoRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        paddingVertical: 12,
    },
    label: {
        fontSize: 13,
        color: '#7d7d7d',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProfileScreen;