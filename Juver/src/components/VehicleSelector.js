import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { calculateTripFare } from '../utils/pricingHelper';

const VEHICLES = [
    { id: 'economico', name: 'Económico', multiplier: 1.0, icon: 'car-sport' },
    { id: 'xl', name: 'XL', multiplier: 1.5, icon: 'bus' },
    { id: 'premium', name: 'Premium', multiplier: 2.0, icon: 'star' },
];

const VehicleSelector = ({ distance, duration, onSelect }) => {
    const [selectedId, setSelectedId] = useState(null);

    const handleSelect = (vehicle) => {
        setSelectedId(vehicle.id);
        const basePrice = calculateTripFare(distance, duration);
        const finalPrice = Math.round(basePrice * vehicle.multiplier);

        onSelect({
            id: vehicle.id,
            name: vehicle.name,
            price: finalPrice,
            multiplier: vehicle.multiplier,
        });
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedId === item.id;
        const basePrice = calculateTripFare(distance, duration);
        const price = Math.round(basePrice * item.multiplier);
        const iconColor = isSelected ? '#2196F3' : '#666';

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.selectedCard]}
                onPress={() => handleSelect(item)}
            >
                <Ionicons name={item.icon} size={32} color={iconColor} style={styles.icon} />
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.price}>${price.toLocaleString()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={VEHICLES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 10 },
    list: { paddingHorizontal: 10 },
    card: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 15,
        marginHorizontal: 5,
        alignItems: 'center',
        width: 100,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    icon: { marginBottom: 5 },
    title: { fontWeight: 'bold', color: '#333' },
    price: { color: '#666', fontSize: 12, marginTop: 4 },
});

export default VehicleSelector;
