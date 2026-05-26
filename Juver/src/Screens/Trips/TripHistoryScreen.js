import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

import { dbService as db, authService } from '../../services/database';

const TripHistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateValue) => {
        if (!dateValue) return 'Fecha no disponible';

        try {
            const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);

            return date.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    };

    const formatPrice = (price) => {
        return `$${Number(price || 0).toLocaleString('es-CO')}`;
    };

    const getStatusLabel = (status) => {
        if (status === 'completed') return 'COMPLETADO';
        if (status === 'cancelled') return 'CANCELADO';

        return status?.toUpperCase() || 'SIN ESTADO';
    };

    const getStatusStyle = (status) => {
        if (status === 'completed') {
            return {
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
            };
        }

        if (status === 'cancelled') {
            return {
                backgroundColor: '#FFEBEE',
                color: '#C62828',
            };
        }

        return {
            backgroundColor: '#EEEEEE',
            color: '#555555',
        };
    };

    useEffect(() => {
        const userId = authService.currentUser?.uid;

        if (!userId) {
            setLoading(false);
            return;
        }

        const unsubscribe = db
            .collection('trips')
            .where('userId', '==', userId)
            .onSnapshot(
                (querySnapshot) => {
                    const trips = querySnapshot.docs
                        .map((doc) => {
                            const data = doc.data();

                            return {
                                id: doc.id,
                                ...data,
                                createdAtFormatted: formatDate(data.createdAt),
                                cancelledAtFormatted: formatDate(data.cancelledAt),
                                finishedAtFormatted: formatDate(data.finishedAt),
                            };
                        })
                        .filter((trip) =>
                            ['completed', 'cancelled'].includes(trip.status)
                        )
                        .sort((a, b) => {
                            const dateA = a.createdAt?.toDate
                                ? a.createdAt.toDate()
                                : new Date(a.createdAt || 0);

                            const dateB = b.createdAt?.toDate
                                ? b.createdAt.toDate()
                                : new Date(b.createdAt || 0);

                            return dateB - dateA;
                        });

                    setHistory(trips);
                    setLoading(false);
                },
                (error) => {
                    console.error('Error al obtener el historial de viajes:', error);
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, []);

    const renderTripItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const isCancelled = item.status === 'cancelled';
        const isCompleted = item.status === 'completed';

        return (
            <View style={styles.tripCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.date}>{item.createdAtFormatted}</Text>

                    <Text
                        style={[
                            styles.status,
                            {
                                backgroundColor: statusStyle.backgroundColor,
                                color: statusStyle.color,
                            },
                        ]}
                    >
                        {getStatusLabel(item.status)}
                    </Text>
                </View>

                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Origen</Text>
                    <Text style={styles.value}>
                        {item.origin?.address || 'Ubicación actual'}
                    </Text>
                </View>

                <View style={styles.infoBlock}>
                    <Text style={styles.label}>Destino</Text>
                    <Text style={styles.value}>
                        {item.destination?.address || 'Sin dirección'}
                    </Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Distancia</Text>
                        <Text style={styles.value}>{item.distance || 'N/A'}</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.label}>Duración</Text>
                        <Text style={styles.value}>{item.duration || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Vehículo</Text>
                        <Text style={styles.value}>
                            {item.vehicle?.type || 'No registrado'}
                        </Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.label}>Placa</Text>
                        <Text style={styles.value}>
                            {item.driver?.licensePlate || 'No registrada'}
                        </Text>
                    </View>
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>Conductor</Text>
                    <Text style={styles.value}>
                        {item.driver?.name || 'No asignado'}
                    </Text>
                </View>

                {isCompleted && (
                    <>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Total pagado</Text>
                            <Text style={styles.price}>
                                {formatPrice(item.payment?.amount || item.vehicle?.price)}
                            </Text>
                        </View>

                        <View style={styles.paymentInfo}>
                            <Text style={styles.label}>Estado del pago</Text>
                            <Text style={styles.value}>
                                {item.paymentStatus === 'paid' ? 'Pagado' : 'No registrado'}
                            </Text>
                        </View>

                        {item.rating?.stars && (
                            <View style={styles.paymentInfo}>
                                <Text style={styles.label}>Calificación</Text>
                                <Text style={styles.rating}>
                                    {'★'.repeat(item.rating.stars)}
                                    {'☆'.repeat(5 - item.rating.stars)}
                                </Text>

                                {item.rating?.comment ? (
                                    <Text style={styles.comment}>
                                        {item.rating.comment}
                                    </Text>
                                ) : null}
                            </View>
                        )}
                    </>
                )}

                {isCancelled && (
                    <View style={styles.cancelledBox}>
                        <Text style={styles.cancelledTitle}>Viaje cancelado</Text>
                        <Text style={styles.cancelledText}>
                            Este viaje fue cancelado y no generó cobro.
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mis Viajes</Text>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={renderTripItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    history.length === 0
                        ? styles.emptyListContainer
                        : styles.listContainer
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No tienes viajes registrados</Text>
                        <Text style={styles.emptyText}>
                            Cuando completes o canceles un viaje, aparecerá aquí.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 40,
        color: '#212121',
    },
    listContainer: {
        paddingBottom: 30,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    tripCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    date: {
        color: '#666',
        fontSize: 13,
        fontWeight: '600',
    },
    status: {
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoBlock: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    column: {
        width: '48%',
    },
    label: {
        fontSize: 12,
        color: '#888',
        fontWeight: 'bold',
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    priceContainer: {
        marginTop: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 15,
        color: '#444',
        fontWeight: 'bold',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    paymentInfo: {
        marginTop: 10,
    },
    rating: {
        fontSize: 18,
        color: '#FFC107',
        fontWeight: 'bold',
    },
    comment: {
        marginTop: 4,
        color: '#555',
        fontSize: 13,
        fontStyle: 'italic',
    },
    cancelledBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
    },
    cancelledTitle: {
        color: '#C62828',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cancelledText: {
        color: '#8A1C1C',
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
    },
});

export default TripHistoryScreen;