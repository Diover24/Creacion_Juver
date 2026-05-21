import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../../components/CustomButton';

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>¡Bienvenido a Juver!</Text>
                <Text style={styles.subtitle}>Estás en la pantalla de inicio.</Text>

                {/* Un botón de prueba para regresar o cerrar sesión luego */}
                <CustomButton
                    title="Explorar Viajes"
                    onPress={() => alert('Próximamente...')}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
});

export default HomeScreen;