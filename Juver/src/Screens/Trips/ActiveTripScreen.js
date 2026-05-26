import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';

import { dbService as db } from '../../services/database';
import MapComponent from '../../components/MapComponent';
import { resetTrip } from '../../store/slices/tripSlice';

const ActiveTripScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();

    const tripId = route?.params?.tripId;

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    const hasHandledTripFinished = useRef(false);
    const isCancellingTrip = useRef(false);

    const showSimulatedNotification = (message) => {
        setNotificationMessage(message);

        setTimeout(() => {
            setNotificationMessage('');
        }, 3500);
    };

    const cleanTripAndGoHome = () => {
        const total = trip?.vehicle?.price || 0;

        navigation.navigate('Pago', {
            tripId,
            amount: total,
        });
    };

    const showFinishedAlert = (tripData) => {
        const total = tripData?.vehicle?.price || 0;

        Alert.alert(
            '¡Has llegado a tu destino!',
            `El total a pagar es: $${total.toLocaleString()}`,
            [
                {
                    text: 'Ir a pagar',
                    onPress: cleanTripAndGoHome,
                },
            ],
            { cancelable: false }
        );
    };

    useEffect(() => {
        if (!tripId) {
            setTrip(null);
            setErrorMessage('No tienes ningún viaje activo en este momento.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMessage('');
        hasHandledTripFinished.current = false;
        isCancellingTrip.current = false;

        const unsubscribe = db
            .collection('trips')
            .doc(tripId)
            .onSnapshot(
                (documentSnapshot) => {
                    if (documentSnapshot && documentSnapshot.exists) {
                        const tripData = documentSnapshot.data();

                        if (tripData?.status === 'cancelled') {
                            setTrip(null);
                            setLoading(false);

                            if (!isCancellingTrip.current) {
                                setErrorMessage('Este viaje fue cancelado.');
                            }

                            return;
                        }

                        if (tripData?.status === 'payment_pending') {
                            setTrip(null);
                            setLoading(false);

                            if (!hasHandledTripFinished.current) {
                                hasHandledTripFinished.current = true;
                                showFinishedAlert(tripData);
                            }

                            return;
                        }

                        setTrip(tripData);
                        setErrorMessage('');
                        if (tripData?.status === 'accepted' && tripData?.driver) {
                            showSimulatedNotification('🚗 Tu conductor está en camino.');
                        }

                        if (tripData?.status === 'in_progress') {
                            showSimulatedNotification('✨ Tu viaje ha iniciado.');
                        }
                    } else {
                        setTrip(null);
                        setErrorMessage('El viaje que buscas ya no existe.');
                    }

                    setLoading(false);
                },
                (error) => {
                    console.error('Error de conexión:', error);
                    setTrip(null);
                    setErrorMessage('Hubo un error al conectar con el viaje.');
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, [tripId]);

    const handleTripFinished = async () => {
        if (!tripId || hasHandledTripFinished.current) return;

        try {
            hasHandledTripFinished.current = true;

            await db.collection('trips').doc(tripId).update({
                status: 'payment_pending',
                paymentStatus: 'pending',
                finishedAt: new Date(),
            });

            showFinishedAlert(trip);
        } catch (error) {
            console.error('Error al finalizar viaje:', error);
            hasHandledTripFinished.current = false;
            Alert.alert('Error', 'No se pudo finalizar el viaje.');
        }
    };

    const handleCancelTrip = () => {
        if (!tripId || !trip) return;

        Alert.alert(
            'Cancelar viaje',
            '¿Estás seguro de que deseas cancelar este viaje?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            isCancellingTrip.current = true;
                            hasHandledTripFinished.current = true;
                            setTrip(null);
                            setErrorMessage('');
                            setLoading(false);

                            await db.collection('trips').doc(tripId).update({
                                status: 'cancelled',
                                cancelledAt: new Date(),
                            });
                            dispatch(resetTrip());
                            navigation.setParams({
                                tripId: undefined,
                            });
                            navigation.navigate('Inicio', {
                                clearTrip: Date.now(),
                            });

                        } catch (error) {
                            console.error('Error cancelling trip:', error);
                            isCancellingTrip.current = false;
                            hasHandledTripFinished.current = false;
                            Alert.alert('Error', 'No se pudo cancelar el viaje.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Sincronizando viaje...</Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        );
    }

    const origin = trip?.origin;
    const destination = trip?.destination;
    const isTripConfirmed = !!trip?.driver;
    const canCancelTrip = ['pending', 'accepted'].includes(trip?.status);
    return (
        <View style={styles.container}>
            {notificationMessage ? (
                <View style={styles.notificationBanner}>
                    <Text style={styles.notificationText}>{notificationMessage}</Text>
                </View>
            ) : null}
            <View style={styles.mapWrapper}>
                {origin ? (
                    <MapComponent
                        key={tripId}
                        origin={origin}
                        destination={destination}
                        isTripConfirmed={isTripConfirmed}
                        driver={trip?.driver}
                        onRouteCalculated={(routeInfo) => {
                            console.log(
                                `Distancia estimada: ${routeInfo.distance} km, Duración: ${routeInfo.duration} min`
                            );
                        }}
                        onTripFinished={handleTripFinished}
                    />
                ) : (
                    <View style={styles.centered}>
                        <Text>Esperando coordenadas de origen...</Text>
                    </View>
                )}
            </View>

            <View style={styles.detailsWrapper}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Estado del servicio</Text>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: trip?.driver
                                    ? '#E3F2FD'
                                    : '#FFF3E0',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: trip?.driver
                                        ? '#1E88E5'
                                        : '#FB8C00',
                                },
                            ]}
                        >
                            {trip?.status ? trip.status.toUpperCase() : 'BUSCANDO'}
                        </Text>
                    </View>
                </View>

                {trip?.driver ? (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Tu Conductor Asignado</Text>

                        <View style={styles.driverInfoRow}>
                            <View style={styles.avatarMini}>
                                <Text style={styles.avatarMiniText}>
                                    {trip.driver.name
                                        ? trip.driver.name.charAt(0)
                                        : '🚗'}
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.driverName}>
                                    {trip.driver.name}
                                </Text>

                                <Text style={styles.vehicleModel}>
                                    🚗 {trip.driver.vehicleModel || 'Vehículo estándar'}
                                </Text>
                                <Text style={styles.licensePlate}>
                                    Placa: {trip.driver.licensePlate || 'No registrada'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.waitingCard}>
                        <ActivityIndicator size="small" color="#FF9800" />
                        <Text style={styles.waitingText}>
                            Asignando la unidad más cercana a tu ubicación...
                        </Text>
                    </View>
                )}
                {canCancelTrip && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelTrip}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar viaje</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    mapWrapper: {
        flex: 0.65,
    },
    detailsWrapper: {
        flex: 0.35,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusLabel: {
        fontSize: 14,
        color: '#777',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        padding: 15,
        backgroundColor: '#FAFAFA',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cardTitle: {
        fontSize: 12,
        color: '#9E9E9E',
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarMini: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarMiniText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    vehicleModel: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    errorText: {
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
        fontWeight: '500',
    },
    waitingCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    waitingText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    cancelButton: {
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#D32F2F',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 15,
    },
    notificationBanner: {
        position: 'absolute',
        top: 45,
        left: 20,
        right: 20,
        zIndex: 999,
        elevation: 10,
        backgroundColor: '#212121',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
    },
    notificationText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    licensePlate: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: 'bold',
        marginTop: 3,
    },
});

export default ActiveTripScreen;