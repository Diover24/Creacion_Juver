import React, { useEffect, useCallback, useState } from 'react';
import {View,StyleSheet,Text,ScrollView,Alert,ActivityIndicator,TouchableOpacity} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { useLocation } from '../../hooks/useLocation';
import MapComponent from '../../components/MapComponent';
import { createTrip, authService, dbService } from '../../services/database';
import { getDistanceMatrix } from '../../services/googleApiService';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import VehicleSelector from '../../components/VehicleSelector';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';

import {
    setOrigin,
    setDestination,
    setTripInfo,
    setSelectedVehicle,
    setIsTripRequested,
    setTripNotes,
    setTripLoading,
    setTripError,
    resetTrip,
} from '../../store/slices/tripSlice';

const HomeScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();

    const { location: detectedLocation, errorMsg } = useLocation();

    const [mapResetKey, setMapResetKey] = useState(0);

    const { origin, destination, tripInfo, selectedVehicle, isTripRequested, tripNotes, loading } =
        useSelector((state) => state.trip);

    const finalOrigin = origin || detectedLocation;

    useFocusEffect(
        useCallback(() => {
            if (route?.params?.clearTrip) {
                dispatch(resetTrip());
                setMapResetKey((prevKey) => prevKey + 1);

                navigation.setParams({
                    clearTrip: undefined,
                });
            }
        }, [route?.params?.clearTrip, dispatch, navigation])
    );

    useEffect(() => {
        const fetchDistance = async () => {
            if (finalOrigin?.latitude && destination?.latitude) {
                try {
                    const data = await getDistanceMatrix(finalOrigin, destination);

                    if (data) {
                        dispatch(setTripInfo(data));
                    }
                } catch (err) {
                    console.error('Error al calcular distancia:', err);
                    dispatch(setTripError('Error al calcular distancia'));
                }
            } else {
                dispatch(setTripInfo(null));
            }
        };

        fetchDistance();
    }, [finalOrigin, destination, dispatch]);

    if (!detectedLocation && !errorMsg) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={{ marginTop: 10 }}>Calculando tu ubicación...</Text>
            </View>
        );
    }

    const handleRequestTrip = async () => {
        const user = authService.currentUser;

        if (!user) {
            Alert.alert('Error', 'Debes iniciar sesión para solicitar un viaje.');
            return;
        }

        if (!destination) {
            Alert.alert('Atención', 'Por favor selecciona un destino.');
            return;
        }

        if (!tripInfo) {
            Alert.alert('Atención', 'No se ha podido calcular la distancia del viaje.');
            return;
        }

        if (!selectedVehicle) {
            Alert.alert('Atención', 'Por favor selecciona un vehículo.');
            return;
        }

        try {
            dispatch(setTripLoading(true));
            dispatch(setTripError(null));

            const activeTripsSnapshot = await dbService
                .collection('trips')
                .where('userId', '==', user.uid)
                .where('status', 'in', ['pending', 'accepted', 'in_progress'])
                .get();

            if (!activeTripsSnapshot.empty) {
                const activeTripId = activeTripsSnapshot.docs[0].id;

                Alert.alert('Viaje en curso', 'Ya tienes un viaje activo.', [
                    {
                        text: 'OK',
                        onPress: () =>
                            navigation.navigate('Viaje Activo', { tripId: activeTripId }),
                    },
                ]);

                return;
            }

            const tripData = {
                userId: user.uid,
                origin: finalOrigin,
                destination: destination,
                distance: tripInfo.distance,
                duration: tripInfo.duration,
                vehicle: {
                    type: selectedVehicle.name,
                    price: selectedVehicle.price,
                    multiplier: selectedVehicle.multiplier,
                },
                notes: tripNotes,
                status: 'pending',
                createdAt: new Date(),
            };

            const newTripId = await createTrip(tripData, selectedVehicle.id);

            dispatch(setIsTripRequested(true));

            Alert.alert('Éxito', 'Viaje solicitado. Estamos buscando tu conductor.');

            if (navigation && newTripId) {
                navigation.navigate('Viaje Activo', { tripId: newTripId });
            }
        } catch (error) {
            console.error('Error al pedir viaje:', error);
            dispatch(setTripError('No pudimos completar tu solicitud.'));
            Alert.alert('Error', 'No pudimos completar tu solicitud.');
        } finally {
            dispatch(setTripLoading(false));
        }
    };
    const handleClearSearch = () => {
        dispatch(setDestination(null));
        dispatch(setTripInfo(null));
        dispatch(setSelectedVehicle(null));
        dispatch(setIsTripRequested(false));
        dispatch(setTripNotes(''));
        setMapResetKey((prevKey) => prevKey + 1);
    };
    return (
        <View style={styles.container}>
            <LocationAutocomplete
                placeholder="¿Dónde estás?"
                top={50}
                defaultValue={detectedLocation && !origin ? 'Mi ubicación actual' : ''}
                selectedLocation={origin}
                onSelect={(loc) => dispatch(setOrigin(loc))}
            />

            <LocationAutocomplete
                placeholder="¿A dónde vamos?"
                top={110}
                selectedLocation={destination}
                onSelect={(loc) => {
                    dispatch(setIsTripRequested(false));
                    dispatch(setDestination(loc));
                    dispatch(setTripInfo(null));
                    dispatch(setSelectedVehicle(null));
                }}
            />

            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : (
                <MapComponent
                    key={`home-map-${mapResetKey}-${destination?.address || 'empty'}`}
                    origin={finalOrigin}
                    destination={destination}
                />
            )}

            {tripInfo && !isTripRequested && (
                <ScrollView style={styles.routeInfoCard} showsVerticalScrollIndicator={false}>
                    <Text style={styles.infoText}>Distancia: {tripInfo.distance}</Text>
                    <Text style={styles.infoText}>Tiempo: {tripInfo.duration}</Text>

                    <VehicleSelector
                        distance={tripInfo.distanceValue / 1000}
                        duration={tripInfo.durationValue / 60}
                        onSelect={(vehicle) => dispatch(setSelectedVehicle(vehicle))}
                    />

                    <CustomInput
                        placeholder="Ej: Tocar timbre, estoy con maletas..."
                        value={tripNotes}
                        onChangeText={(text) => dispatch(setTripNotes(text))}
                        label="Instrucciones para el conductor (opcional)"
                    />

                    {selectedVehicle && (
                        <CustomButton
                            title={
                                loading
                                    ? 'Solicitando viaje...'
                                    : `Confirmar ${
                                          selectedVehicle.name
                                      } - $${selectedVehicle.price.toLocaleString()}`
                            }
                            onPress={handleRequestTrip}
                            disabled={loading}
                        />
                    )}
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                        <Text style={styles.clearButtonText}>Cancelar búsqueda</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 100,
        textAlign: 'center',
        color: 'red',
    },
    routeInfoCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        maxHeight: '45%',
    },
    infoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    clearButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D32F2F',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default HomeScreen;
