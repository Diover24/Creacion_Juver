import { GOOGLE_API_KEY } from '../utils/constants';

export const getDistanceMatrix = async (origin, destination) => {
    if (!origin?.latitude || !destination?.latitude) {
        console.warn('getDistanceMatrix: Coordenadas incompletas');
        return null;
    }
    try {
        const originCoords = `${origin.latitude},${origin.longitude}`;
        const destCoords = `${destination.latitude},${destination.longitude}`;

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originCoords}&destinations=${destCoords}&key=${GOOGLE_API_KEY}&language=es`;

        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            console.log('Error HTTP:', response.status, await response.text());
        }

        if (data.status === 'OK') {
            const element = data.rows[0].elements[0];
            if (element.status === 'OK') {
                return {
                    distance: element.distance.text,
                    duration: element.duration.text,
                    distanceValue: element.distance.value,
                    durationValue: element.duration.value,
                };
            } else {
                throw new Error('No se pudo calcular la ruta');
            }
        } else {
            throw new Error(data.error_message || 'Error en la API');
        }
    } catch (error) {
        console.error('Error en Distance Matrix:', error);
        return null;
    }
};
