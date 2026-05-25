import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { authService } from '../../services/database';
import { isEmpty, isValidEmail } from '../../utils/validations';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

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
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Alert.alert('Error de Acceso', 'El correo o la contraseña son incorrectos.');
            } else {
                Alert.alert('Error', 'Hubo un problema al iniciar sesión. Intenta más tarde.');
                console.log("Login error: ", error);
            }
        }
    };

    const handleForgotPassword = async () => {
        if (isEmpty(email)) {
            Alert.alert(
                'Recuperar contraseña',
                'Por favor, escribe tu correo electrónico en la casilla de arriba y vuelve a presionar este botón.'
            );
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'El formato del correo electrónico no es válido.');
            return;
        }

        try {
            await authService.sendPasswordResetEmail(email);
            Alert.alert(
                '¡Correo enviado!',
                'Revisa tu bandeja de entrada (o la carpeta de Spam) para restablecer tu contraseña.'
            );
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                Alert.alert('Error', 'No hay ninguna cuenta registrada con este correo.');
            } else {
                Alert.alert('Error', 'Hubo un problema al enviar el correo. Intenta de nuevo más tarde.');
                console.log("Reset password error: ", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>

            <CustomInput
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <CustomInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
            />

            <CustomButton title="Entrar" onPress={handleLogin} />

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerText}>Regístrate</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    forgotPasswordButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#007BFF',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30
    },
    registerText: {
        color: '#007BFF',
        fontWeight: 'bold',
    }
});

export default LoginScreen;