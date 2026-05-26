import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { processPayment } from '../../services/paymentService';
import {
    isValidCardHolderName,
    isValidCardNumber,
    isValidExpirationDate,
    isValidCvv,
} from '../../utils/validations';
import {
    setSelectedProvider,
    setSelectedPaymentType,
    setPaymentStatus,
    setPaymentError,
    setPaymentLoading,
    resetPayment,
} from '../../store/slices/paymentSlice';

import { resetTrip } from '../../store/slices/tripSlice';

const PaymentScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();

    const {
        selectedProvider,
        selectedPaymentType,
        loading,
    } = useSelector((state) => state.payment);

    const tripId = route?.params?.tripId;
    const amount = route?.params?.amount || 0;

    const [cardHolderName, setCardHolderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCvv] = useState('');

    const formatCardNumber = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(.{4})/g, '$1 ')
            .trim()
            .slice(0, 19);
    };

    const clearCardForm = () => {
        setCardHolderName('');
        setCardNumber('');
        setExpirationDate('');
        setCvv('');
    };
    useFocusEffect(
        useCallback(() => {
            clearCardForm();
            dispatch(resetPayment());
        }, [tripId, dispatch])
    );
    const formatExpirationDate = (value) => {
        const cleanValue = value.replace(/\D/g, '').slice(0, 4);

        if (cleanValue.length >= 3) {
            return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
        }

        return cleanValue;
    };

    const handleSelectProvider = (provider) => {
        clearCardForm();
        dispatch(setSelectedProvider(provider));
        dispatch(setPaymentError(null));

        if (provider === 'cash') {
            dispatch(setSelectedPaymentType('cash'));
        } else {
            dispatch(setSelectedPaymentType(null));
        }
    };

    const validateCardForm = () => {
        if (!isValidCardHolderName(cardHolderName)) {
            Alert.alert('Atención', 'Ingresa el nombre del titular.');
            return false;
        }

        if (!isValidCardNumber(cardNumber)) {
            Alert.alert('Atención', 'El número de tarjeta debe tener entre 13 y 16 dígitos.');
            return false;
        }

        if (!isValidExpirationDate(expirationDate)) {
            Alert.alert('Atención', 'La fecha de vencimiento no es válida o la tarjeta ya está vencida.');
            return false;
        }

        if (!isValidCvv(cvv)) {
            Alert.alert('Atención', 'El CVV debe tener entre 3 y 4 dígitos.');
            return false;
        }

        return true;
    };
    const handlePay = async () => {
        if (!tripId) {
            Alert.alert('Error', 'No se encontró el viaje para procesar el pago.');
            return;
        }

        if (!selectedProvider) {
            Alert.alert('Atención', 'Selecciona una pasarela de pago.');
            return;
        }

        if (!selectedPaymentType) {
            Alert.alert('Atención', 'Selecciona el tipo de pago.');
            return;
        }

        if (selectedPaymentType !== 'cash' && !validateCardForm()) {
            return;
        }

        try {
            dispatch(setPaymentLoading(true));
            dispatch(setPaymentStatus('processing'));
            dispatch(setPaymentError(null));

            const result = await processPayment({
                tripId,
                provider: selectedProvider,
                paymentType: selectedPaymentType,
                amount,
                cardData: selectedPaymentType === 'cash'
                    ? null
                    : {
                        cardHolderName,
                        cardNumber,
                        expirationDate,
                        cvv,
                    },
            });

            if (!result.success) {
                dispatch(setPaymentStatus('failed'));
                dispatch(setPaymentError(result.error));

                Alert.alert(
                    'Pago rechazado',
                    result.error || 'No se pudo procesar el pago.'
                );

                return;
            }

            dispatch(setPaymentStatus('paid'));
            dispatch(resetTrip());
            dispatch(resetPayment());
            clearCardForm();
            Alert.alert(
                'Pago exitoso',
                'Tu pago fue procesado correctamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('Inicio', {
                                clearTrip: Date.now(),
                            });
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Payment screen error:', error);

            dispatch(setPaymentStatus('failed'));
            dispatch(setPaymentError(error.message));

            Alert.alert('Error', 'Ocurrió un problema al procesar el pago.');
        } finally {
            dispatch(setPaymentLoading(false));
        }
    };

    const shouldShowCardForm =
        selectedProvider &&
        selectedProvider !== 'cash' &&
        selectedPaymentType &&
        selectedPaymentType !== 'cash';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Pasarela de Pagos</Text>

            <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Total a pagar</Text>
                <Text style={styles.amount}>
                    ${amount.toLocaleString('es-CO')}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Selecciona la pasarela</Text>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    selectedProvider === 'stripe' && styles.selectedOption,
                ]}
                onPress={() => handleSelectProvider('stripe')}
            >
                <Text style={styles.paymentTitle}>Stripe</Text>

            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    selectedProvider === 'mercado_pago' && styles.selectedOption,
                ]}
                onPress={() => handleSelectProvider('mercado_pago')}
            >
                <Text style={styles.paymentTitle}>Mercado Pago</Text>

            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    selectedProvider === 'cash' && styles.selectedOption,
                ]}
                onPress={() => handleSelectProvider('cash')}
            >
                <Text style={styles.paymentTitle}>Efectivo</Text>
                <Text style={styles.paymentDescription}>
                    Pago en efectivo al finalizar el viaje.
                </Text>
            </TouchableOpacity>

            {selectedProvider && selectedProvider !== 'cash' && (
                <>
                    <Text style={styles.sectionTitle}>Tipo de tarjeta</Text>

                    <View style={styles.cardTypeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.cardTypeButton,
                                selectedPaymentType === 'credit_card' && styles.selectedOption,
                            ]}
                            onPress={() => dispatch(setSelectedPaymentType('credit_card'))}
                        >
                            <Text style={styles.cardTypeText}>Crédito</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.cardTypeButton,
                                selectedPaymentType === 'debit_card' && styles.selectedOption,
                            ]}
                            onPress={() => dispatch(setSelectedPaymentType('debit_card'))}
                        >
                            <Text style={styles.cardTypeText}>Débito</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {shouldShowCardForm && (
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Datos de la tarjeta</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre del titular"
                        value={cardHolderName}
                        onChangeText={setCardHolderName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Número de tarjeta"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                        maxLength={19}
                    />

                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="MM/AA"
                            keyboardType="numeric"
                            value={expirationDate}
                            onChangeText={(value) => setExpirationDate(formatExpirationDate(value))}
                            maxLength={5}
                        />

                        <TextInput
                            style={[styles.input, styles.halfInput]}
                            placeholder="CVV"
                            keyboardType="numeric"
                            secureTextEntry
                            value={cvv}
                            onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                        />
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.payButton,
                    (!selectedProvider || !selectedPaymentType || loading) && styles.disabledButton,
                ]}
                onPress={handlePay}
                disabled={!selectedProvider || !selectedPaymentType || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.payButtonText}>
                        {selectedPaymentType === 'cash'
                            ? 'Confirmar pago en efectivo'
                            : 'Pagar ahora'}
                    </Text>
                )}
            </TouchableOpacity>


        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20,
        color: '#212121',
    },
    amountCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        elevation: 3,
    },
    amountLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        marginTop: 10,
    },
    paymentOption: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    selectedOption: {
        borderColor: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 5,
    },
    paymentDescription: {
        fontSize: 14,
        color: '#666',
    },
    cardTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    cardTypeButton: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    cardTypeText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
        elevation: 2,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#DADCE0',
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        fontSize: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    testNote: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    payButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 25,
    },
    disabledButton: {
        backgroundColor: '#B0BEC5',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    securityNote: {
        marginTop: 20,
        fontSize: 12,
        color: '#777',
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default PaymentScreen;