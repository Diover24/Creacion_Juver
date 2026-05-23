import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { dbService as db } from '../../services/database';

const ActiveTripScreen = ({ route }) => {
    const tripId = route.params?.tripId;
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!tripId) {
            setErrorMessage("No tienes ningún viaje activo en este momento.");
            setLoading(false);
            return;
        }

        const unsubscribe = db
            .collection('trips')
            .doc(tripId)
            .onSnapshot(
                (documentSnapshot) => {
                    if (documentSnapshot.exists) {
                        setTrip(documentSnapshot.data());
                        setErrorMessage('');
                    } else {
                        setErrorMessage("El viaje que buscas ya no existe.");
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error("Error de conexión: ", error);
                    setErrorMessage("Hubo un error al conectar con el viaje.");
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, [tripId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />;
    }

    if (errorMessage) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.status}>Estado: {trip.status}</Text>
            {trip.driver ? (
                <View style={styles.card}>
                    <Text style={styles.title}>Conductor: {trip.driver.name}</Text>
                    <Text>Vehículo: {trip.driver.vehicleModel}</Text>
                </View>
            ) : (
                <Text style={styles.waitingText}>Buscando conductor...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    status: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    card: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, elevation: 2 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    errorText: { fontSize: 16, color: '#666', textAlign: 'center' },
    waitingText: { fontSize: 16, color: '#FF9800', fontStyle: 'italic' }
});

export default ActiveTripScreen;