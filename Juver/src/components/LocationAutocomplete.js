import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY } from '../utils/constants';

const LocationAutocomplete = ({
    onSelect,
    placeholder,
    top = 40,
    defaultValue = '',
    selectedLocation = null,
}) => {
    const googlePlacesRef = useRef(null);

    useEffect(() => {
        if (!googlePlacesRef.current) return;

        if (!selectedLocation) {
            googlePlacesRef.current.setAddressText(defaultValue || '');
        }
    }, [selectedLocation, defaultValue]);

    return (
        <View style={[styles.container, { top }]}>
            <GooglePlacesAutocomplete
                key={placeholder}
                ref={googlePlacesRef}
                placeholder={placeholder}
                minLength={2}
                autoFocus={false}
                returnKeyType="search"
                fetchDetails={true}
                enablePoweredByContainer={false}
                enableClearButton={true}
                debounce={300}
                onPress={(data, details = null) => {
                    if (details) {
                        const selectedPlace = {
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng,
                            address: data.description,
                        };

                        googlePlacesRef.current?.setAddressText(data.description);
                        onSelect(selectedPlace);
                    }
                }}
                query={{
                    key: GOOGLE_API_KEY,
                    language: 'es',
                    components: 'country:co',
                }}
                styles={{
                    textInput: styles.textInput,
                    container: { flex: 0 },
                    listView: styles.listView,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '90%',
        alignSelf: 'center',
        zIndex: 999,
        elevation: 10,
    },
    textInput: {
        height: 50,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        fontSize: 16,
    },
    listView: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginTop: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});

export default LocationAutocomplete;