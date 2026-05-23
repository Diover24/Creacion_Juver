import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';

import { useLocation } from '../../hooks/useLocation';
import MapComponent from '../../components/MapComponent';
import { createTrip, authService } from '../../services/database';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import VehicleSelector from '../../components/VehicleSelector';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';

const HomeScreen = ({ navigation }) => {
    console.log("HomeScreen renderizándose...");
    const { location: detectedLocation, errorMsg } = useLocation();

    const [manualOrigin, setManualOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [isTripRequested, setIsTripRequested] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [tripNotes, setTripNotes] = useState('');

    const finalOrigin = manualOrigin || detectedLocation;

    if (!detectedLocation && !errorMsg) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={{ marginTop: 10 }}>Calculando tu ubicación...</Text>
            </View>
        );
    }

    const handleRequestTrip = async () => {
        const user = authService.currentUser;

        if (!user) {
            Alert.alert("Error", "Debes iniciar sesión para solicitar un viaje.");
            return;
        }

        if (!selectedVehicle) {
            Alert.alert("Atención", "Por favor selecciona un vehículo.");
            return;
        }

        try {
            const tripData = {
                userId: user.uid,
                origin: finalOrigin,
                destination: destination,
                distance: routeInfo.distance,
                duration: routeInfo.duration,
                vehicle: {
                    type: selectedVehicle.name,
                    price: selectedVehicle.price,
                    multiplier: selectedVehicle.multiplier
                },
                notes: tripNotes,
                status: 'pending',
                createdAt: new Date(),
            };

            const newTripId = await createTrip(tripData);
            setIsTripRequested(true);
            Alert.alert("Éxito", "Viaje solicitado. Estamos buscando tu conductor.");

            if (navigation && newTripId) {
                navigation.navigate('Viaje Activo', { tripId: newTripId });
            }

        } catch (error) {
            console.error("Error al pedir viaje: ", error);
            Alert.alert("Error", "No pudimos completar tu solicitud.");
        }
    };

    return (
        <View style={styles.container}>
            <LocationAutocomplete
                placeholder="¿Dónde estás?"
                top={50}
                defaultValue={detectedLocation && !manualOrigin ? "Mi ubicación actual" : ""}
                onSelect={setManualOrigin}
            />

            <LocationAutocomplete
                placeholder="¿A dónde vamos?"
                top={110}
                onSelect={(loc) => {
                    setIsTripRequested(false);
                    setDestination(loc);
                }}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : (
                <MapComponent origin={finalOrigin} destination={destination} onRouteCalculated={setRouteInfo} />
            )}

            {routeInfo && !isTripRequested && (
                <ScrollView style={styles.routeInfoCard} showsVerticalScrollIndicator={false}>
                    <Text style={styles.infoText}>Distancia: {routeInfo.distance.toFixed(1)} km</Text>
                    <Text style={styles.infoText}>Tiempo: {Math.round(routeInfo.duration)} min</Text>

                    <VehicleSelector
                        distance={routeInfo.distance}
                        duration={routeInfo.duration}
                        onSelect={setSelectedVehicle}
                    />

                    <CustomInput
                        placeholder="Ej: Tocar timbre, estoy con maletas..."
                        value={tripNotes}
                        onChangeText={setTripNotes}
                        label="Instrucciones para el conductor (opcional)"
                    />

                    {selectedVehicle && (
                        <CustomButton
                            title={`Confirmar ${selectedVehicle.name} - $${selectedVehicle.price.toLocaleString()}`}
                            onPress={handleRequestTrip}
                        />
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    errorText: { marginTop: 100, textAlign: 'center', color: 'red' },
    routeInfoCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        elevation: 10,
        maxHeight: '45%',
    },
    infoText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
});

export default HomeScreen;