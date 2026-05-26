import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';

import { dbService as db } from '../../services/database';

const ReceiptScreen = ({ route, navigation }) => {
    const tripId = route?.params?.tripId;
    const receiptKey = route?.params?.receiptKey;

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setRating(5);
            setComment('');
            setSaving(false);
        }, [tripId, receiptKey])
    );

    useEffect(() => {
        if (!tripId) {
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
                    }

                    setLoading(false);
                },
                (error) => {
                    console.error('Error loading receipt:', error);
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, [tripId]);

    const formatPrice = (value) => {
        return `$${Number(value || 0).toLocaleString('es-CO')}`;
    };

    const getPaymentProviderLabel = (provider) => {
        if (provider === 'stripe') return 'Stripe';
        if (provider === 'mercado_pago') return 'Mercado Pago';
        if (provider === 'cash') return 'Efectivo';

        return 'No registrado';
    };

    const getPaymentTypeLabel = (type) => {
        if (type === 'credit_card') return 'Tarjeta de crédito';
        if (type === 'debit_card') return 'Tarjeta débito';
        if (type === 'cash') return 'Efectivo';

        return 'No registrado';
    };

    const handleFinish = async () => {
        if (!tripId) {
            navigation.navigate('Inicio', {
                clearTrip: Date.now(),
            });
            return;
        }

        try {
            setSaving(true);

            await db
                .collection('trips')
                .doc(tripId)
                .update({
                    rating: {
                        stars: rating,
                        comment: comment.trim(),
                        createdAt: new Date(),
                    },
                });

            Alert.alert(
                'Gracias',
                'Tu calificación fue guardada correctamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setRating(5);
                            setComment('');
                            navigation.navigate('Inicio', {
                                clearTrip: Date.now(),
                            });
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error saving rating:', error);
            Alert.alert('Error', 'No se pudo guardar la calificación.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Cargando recibo...</Text>
            </View>
        );
    }

    if (!trip) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No se encontró la información del viaje.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Recibo del Viaje</Text>

            <View style={styles.receiptCard}>
                <Text style={styles.sectionTitle}>Resumen del pago</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Total</Text>
                    <Text style={styles.total}>
                        {formatPrice(trip.payment?.amount || trip.vehicle?.price)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Pasarela</Text>
                    <Text style={styles.value}>
                        {getPaymentProviderLabel(trip.payment?.provider)}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Tipo de pago</Text>
                    <Text style={styles.value}>
                        {getPaymentTypeLabel(trip.payment?.paymentType)}
                    </Text>
                </View>

                {trip.payment?.card && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Tarjeta</Text>
                        <Text style={styles.value}>
                            {trip.payment.card.brand} **** {trip.payment.card.lastFourDigits}
                        </Text>
                    </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Información del viaje</Text>

                <Text style={styles.label}>Origen</Text>
                <Text style={styles.value}>{trip.origin?.address || 'Ubicación actual'}</Text>

                <Text style={styles.label}>Destino</Text>
                <Text style={styles.value}>{trip.destination?.address || 'Sin dirección'}</Text>

                <View style={styles.doubleRow}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Distancia</Text>
                        <Text style={styles.value}>{trip.distance || 'N/A'}</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.label}>Duración</Text>
                        <Text style={styles.value}>{trip.duration || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.doubleRow}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Vehículo</Text>
                        <Text style={styles.value}>{trip.vehicle?.type || 'No registrado'}</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.label}>Conductor</Text>
                        <Text style={styles.value}>{trip.driver?.name || 'No registrado'}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>Placa</Text>
                        <Text style={styles.value}>{trip.driver?.licensePlate || 'No registrada'}</Text>

                    </View>
                </View>
            </View>

            <View style={styles.ratingCard}>
                <Text style={styles.sectionTitle}>Califica tu viaje</Text>

                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.commentInput}
                    placeholder="Comentario opcional"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                />

                <TouchableOpacity
                    style={[styles.finishButton, saving && styles.disabledButton]}
                    onPress={handleFinish}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.finishButtonText}>Finalizar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 16,
        textAlign: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20,
        color: '#212121',
    },
    receiptCard: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 16,
        marginBottom: 18,
        elevation: 3,
    },
    ratingCard: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 16,
        marginBottom: 30,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    doubleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    column: {
        width: '48%',
    },
    label: {
        fontSize: 12,
        color: '#777',
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    total: {
        fontSize: 20,
        color: '#2196F3',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 15,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    star: {
        fontSize: 38,
        color: '#FFC107',
        marginHorizontal: 4,
    },
    commentInput: {
        minHeight: 90,
        borderWidth: 1,
        borderColor: '#DADCE0',
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
        fontSize: 15,
        marginBottom: 18,
        backgroundColor: '#FFFFFF',
    },
    finishButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#B0BEC5',
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ReceiptScreen;
