import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

const CustomInput = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    label
}) => {
    return (
        <View style={styles.container}>
            {/* Si le pasamos un label, lo muestra. Si no, lo ignora directamente */}
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                placeholderTextColor="#999"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E4E6E8',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
});

export default CustomInput;