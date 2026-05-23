import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';

const CustomInput = ({
    placeholder,
    value,
    onChangeText,
    isPassword,
    keyboardType,
    autoCapitalize,
    label
}) => {
    const [isSecure, setIsSecure] = useState(isPassword);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    placeholderTextColor="#999"
                />

                {isPassword && (
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setIsSecure(!isSecure)}
                    >
                        <Text style={styles.toggleText}>
                            {isSecure ? 'Mostrar' : 'Ocultar'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E4E6E8',
        borderRadius: 8,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    toggleButton: {
        paddingLeft: 10,
    },
    toggleText: {
        color: '#007BFF',
        fontWeight: '600',
        fontSize: 14,
    }
});

export default CustomInput;