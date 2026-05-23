import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { dbService as db, authService } from '../../services/database';

const TripHistoryScreen = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const userId = authService.currentUser?.uid;
                if (!userId) return;

                const querySnapshot = await db
                    .collection('trips')
                    .where('userId', '==', userId)
                    .get();

                const trips = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAtFormated: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A'
                    };
                });

                setHistory(trips);
            } catch (error) {
                console.error("Error al obtener el historial de viajes: ", error);
            }
        };
        fetchHistory();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mis Viajes</Text>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.tripCard}>
                        <Text style={styles.date}>{item.createdAtFormated}</Text>
                        <Text>Destino: {item.destination?.address || 'Sin dirección'}</Text>
                        <Text style={styles.price}>${item.vehicle?.price || 0}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
    tripCard: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    price: { fontWeight: 'bold', color: '#2196F3', marginTop: 5 },
    date: { color: '#666', marginBottom: 5 }
});

export default TripHistoryScreen;