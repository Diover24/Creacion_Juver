import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GOOGLE_API_KEY } from '../utils/constants';

const MapComponent = ({
    origin,
    destination,
    isTripConfirmed,
    onRouteCalculated,
    driver,
    onTripFinished,
    onTripStarted,
}) => {
    const mapRef = useRef(null);
    const isPreviewMode = isTripConfirmed === undefined;

    const [driverLocation, setDriverLocation] = useState(null);
    const [initialDriverLocation, setInitialDriverLocation] = useState(null);
    const [tripStage, setTripStage] = useState(
        isPreviewMode ? 'preview' : 'waitingForConfirmation'
    );
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    useEffect(() => {
        if (origin && isTripConfirmed && !driverLocation && !isPreviewMode && driver) {
            const randomLatOffset = (Math.random() - 0.5) * 0.008;
            const randomLngOffset = (Math.random() - 0.5) * 0.008;

            const startPosition = {
                latitude: origin.latitude + randomLatOffset,
                longitude: origin.longitude + randomLngOffset,
            };

            setDriverLocation(startPosition);
            setInitialDriverLocation(startPosition);
            setTripStage('fetchingClient');
        }
    }, [origin, isTripConfirmed, isPreviewMode, driver]);

    useEffect(() => {
        if (routeCoordinates.length === 0 || isPreviewMode) return;

        let currentIndex = 0;
        const animationInterval = setInterval(() => {
            if (currentIndex < routeCoordinates.length) {
                setDriverLocation(routeCoordinates[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(animationInterval);
                setRouteCoordinates([]);

                if (tripStage === 'fetchingClient') {
                    setTimeout(() => {
                        setTripStage('toDestination');
                        if (onTripStarted) onTripStarted();
                    }, 2000);
                } else if (tripStage === 'toDestination') {
                    setTripStage('finished');
                    if (onTripFinished) onTripFinished();
                }
            }
        }, 600);

        return () => clearInterval(animationInterval);
    }, [routeCoordinates, tripStage, isPreviewMode]);

    useEffect(() => {
        if (mapRef.current && origin) {
            const coordinatesToFit = [origin];
            if (driverLocation) coordinatesToFit.push(driverLocation);
            if (destination) coordinatesToFit.push(destination);

            mapRef.current.fitToCoordinates(coordinatesToFit, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [driverLocation, destination, tripStage, origin]);

    if (!origin) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsUserLocation={false}
                initialRegion={{
                    ...origin,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
            >
                <Marker
                    coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
                    title="Tu ubicación"
                    pinColor="green"
                >
                    <View style={[styles.customMarker, { backgroundColor: '#4CAF50' }]}>
                        <Ionicons name="person" size={20} color="white" />
                    </View>
                </Marker>

                {destination && tripStage !== 'finished' && (
                    <Marker
                        coordinate={{
                            latitude: destination.latitude,
                            longitude: destination.longitude,
                        }}
                        title="Destino"
                        pinColor="red"
                    >
                        <View style={[styles.customMarker, { backgroundColor: '#F44336' }]}>
                            <Ionicons name="flag" size={20} color="white" />
                        </View>
                    </Marker>
                )}

                {driverLocation && (
                    <Marker
                        coordinate={driverLocation}
                        title={driver ? driver.name : 'Conductor'}
                        pinColor="blue"
                    >
                        <View style={[styles.customMarker, { backgroundColor: '#2196F3' }]}>
                            <Ionicons name="car" size={20} color="white" />
                        </View>
                    </Marker>
                )}

                {initialDriverLocation && tripStage === 'fetchingClient' && (
                    <MapViewDirections
                        key="route-to-origin"
                        origin={initialDriverLocation}
                        destination={origin}
                        apikey={GOOGLE_API_KEY}
                        strokeWidth={4}
                        strokeColor="#FF9800"
                        onReady={(result) => setRouteCoordinates(result.coordinates)}
                    />
                )}
                {destination && tripStage !== 'finished' && (
                    <MapViewDirections
                        key={`route-to-destination-${tripStage}`}
                        origin={origin}
                        destination={destination}
                        apikey={GOOGLE_API_KEY}
                        strokeWidth={4}
                        strokeColor="#2196F3"
                        onReady={(result) => {
                            if (onRouteCalculated) {
                                onRouteCalculated(result);
                            }
                            if (tripStage === 'toDestination') {
                                setRouteCoordinates(result.coordinates);
                            }
                        }}
                    />
                )}
            </MapView>
            {!isPreviewMode && (
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                        {tripStage === 'waitingForConfirmation' &&
                            '⏳ Buscando la unidad más cercana...'}
                        {tripStage === 'fetchingClient' && '🚗 Conductor en camino a recogerte...'}
                        {tripStage === 'toDestination' && '✨ ¡Hacia tu destino!'}
                        {tripStage === 'finished' && '🏁 Has llegado a tu destino.'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', overflow: 'hidden', borderRadius: 10 },
    map: { width: '100%', height: '100%' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    loadingText: { color: '#666', fontSize: 16 },
    statusBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    statusText: { fontWeight: 'bold', color: '#333', fontSize: 14 },
    customMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default MapComponent;
