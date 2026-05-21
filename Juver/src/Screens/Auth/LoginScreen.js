import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { authService } from '../../services/database';
import { isEmpty, isValidEmail } from '../../utils/validations';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (isEmpty(email) || isEmpty(password)) {
            Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'El formato del correo electrónico no es válido.');
            return;
        }

        try {
            await authService.signInWithEmailAndPassword(email, password);
            setPassword('');
            navigation.navigate('Home');
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Alert.alert('Error de Acceso', 'El correo o la contraseña son incorrectos.');
            } else {
                Alert.alert('Error', 'Hubo un problema al iniciar sesión. Intenta más tarde.');
                console.log("Login error: ", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            <Button title="Entrar" onPress={handleLogin} />

            <View style={styles.footer}>
                <Text>¿No tienes cuenta? </Text>
                <Button
                    title="Regístrate"
                    color="#666"
                    onPress={() => navigation.navigate('Register')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }
});

export default LoginScreen;