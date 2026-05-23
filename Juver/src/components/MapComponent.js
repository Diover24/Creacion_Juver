import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_API_KEY } from '../utils/constants';

const MapComponent = ({ origin, destination, onRouteCalculated }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (origin && mapRef.current) {
            mapRef.current.animateToRegion({
                ...origin,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            }, 1000);
        }
    }, [origin]);

    if (!origin) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Buscando tu ubicación...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    ...origin,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker
                    coordinate={origin}
                    title="Tu ubicación"
                    pinColor="green"
                />

                {destination && (
                    <>
                        <Marker
                            coordinate={destination}
                            title="Destino"
                            pinColor="red"
                        />
                        <MapViewDirections
                            origin={origin}
                            destination={destination}
                            apikey={GOOGLE_API_KEY}
                            strokeWidth={4}
                            strokeColor="#2196F3"
                            onReady={(result) => {
                                onRouteCalculated({
                                    distance: result.distance,
                                    duration: result.duration
                                });
                            }}
                            onError={(errorMessage) => {
                                console.log("DETALLE DEL ERROR DE GOOGLE:", errorMessage);
                            }}
                        />
                    </>
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 10,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    loadingText: {
        color: '#666',
        fontSize: 16,
    }
});

export default MapComponent;