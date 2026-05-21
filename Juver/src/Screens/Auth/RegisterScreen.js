import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { authService, dbService } from '../../services/database';
import { isEmpty, isValidEmail, isValidNameLength } from '../../utils/validations';

const RegisterScreen = ({navigation}) => {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [language, setLanguage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const clearForm = () => {
        setFullName('');
        setEmail('');
        setGender('');
        setLanguage('');
        setPassword('');
        setPhoneNumber('');
    };
    const handleRegister = async () => {
        if (isEmpty(fullName) || isEmpty(phoneNumber) || isEmpty(email) || isEmpty(password)) {
            Alert.alert('Error', 'Todos los campos son obligatorios. No pueden estar vacíos.');
            return;
        }

        if (!isValidNameLength(fullName)) {
            Alert.alert('Error', 'El nombre completo no puede exceder los 50 caracteres.');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Por favor, ingresa un correo electrónico válido.');
            return;
        }

        try {
            const userCredential = await authService.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            await dbService.collection('Users').doc(uid).set({
                fullName: fullName,
                phoneNumber: phoneNumber,
                gender: gender,
                language: language,
                email: email,
                photoUrl: '',
                createdAt: new Date(),
            });
            clearForm();
            Alert.alert(
                '¡Éxito!',
                '¡Usuario creado con éxito!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('home')
                    }
                ]
            );
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error de Registro', 'Este correo electrónico ya está registrado. Intenta iniciar sesión.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error de Registro', 'Tu contraseña es muy débil. Debe tener al menos 6 caracteres.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error de Registro', 'El formato del correo electrónico no es válido.');
            } else {
                Alert.alert('Error', 'Hubo un problema al crear la cuenta. Intenta de nuevo más tarde.');
                console.log("Registration error: ", error);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput placeholder="Full Name" onChangeText={setFullName} style={styles.input} />
            <TextInput placeholder="Phone Number" keyboardType="numeric" onChangeText={setPhoneNumber} style={styles.input} />
            <TextInput placeholder="Gender (e.g., Male/Female/Other)" onChangeText={setGender} style={styles.input} />
            <TextInput placeholder="Language (English/Spanish)" onChangeText={setLanguage} style={styles.input} />
            <TextInput placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={styles.input} />

            <Button title="Register" onPress={handleRegister} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 }
});

export default RegisterScreen;