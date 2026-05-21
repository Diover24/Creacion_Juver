import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const requestPermissionAndGetLocation = async () => {
        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
            fetchCurrentPosition();
            return;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Permiso de Ubicación',
                    message: 'Juver necesita acceso a tu ubicación para mostrarte en el mapa.',
                    buttonNeutral: 'Preguntar luego',
                    buttonNegative: 'Cancelar',
                    buttonPositive: 'OK',
                }
            );
            const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
            isGranted ? fetchCurrentPosition() : setErrorMsg('Permiso de ubicación denegado');

        } catch (err) {
            setErrorMsg(err.message);
        }
    };

    const fetchCurrentPosition = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
            },
            (error) => setErrorMsg(error.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        requestPermissionAndGetLocation();
    }, []);

    return { location, errorMsg };
};