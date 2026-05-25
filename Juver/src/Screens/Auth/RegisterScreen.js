import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import { authService, dbService } from '../../services/database';
import { isEmpty, isValidEmail, isValidNameLength, isValidPhone, isStrongPassword } from '../../utils/validations';
import CustomInput from '../../components/CustomInput';

const RegisterScreen = ({ }) => {
    const [photoUrl, setPhotoUrl] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [language, setLanguage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
    const genderOptions = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'];

    const clearForm = () => {
        setPhotoUrl('');
        setFullName('');
        setPhoneNumber('');
        setGender('');
        setLanguage('');
        setEmail('');
        setPassword('');
    };

    const handleSelectPhoto = () => {
        const options = { mediaType: 'photo', quality: 0.7 };
        launchImageLibrary(options, (response) => {
            if (response.assets && response.assets.length > 0) {
                setPhotoUrl(response.assets[0].uri);
            }
        });
    };

    const handleRegister = async () => {
        if (isEmpty(photoUrl) || isEmpty(fullName) || isEmpty(phoneNumber) || isEmpty(email) || isEmpty(password) || isEmpty(gender) || isEmpty(language)) {
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

        if (!isValidPhone(phoneNumber)) {
            Alert.alert('Error', 'El número de teléfono debe tener exactamente 10 dígitos numéricos.');
            return;
        }

        if (!isStrongPassword(password)) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
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
                photoUrl: photoUrl,
                createdAt: new Date(),
            });

            clearForm();
            Alert.alert(
                '¡Éxito!',
                '¡Usuario creado con éxito!'
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
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.photoPicker} onPress={handleSelectPhoto}>
                {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>Añadir Foto</Text>
                    </View>
                )}
            </TouchableOpacity>
            <CustomInput
                placeholder="Nombre Completo"
                value={fullName}
                onChangeText={setFullName}
                maxLength={50}
            />
            <CustomInput
                placeholder="Número de Celular (10 dígitos)"
                value={phoneNumber}
                keyboardType="numeric"
                onChangeText={setPhoneNumber}
                maxLength={10}
            />
            <TouchableOpacity style={styles.dropdown} onPress={() => setIsGenderModalVisible(true)}>
                <Text style={gender ? styles.dropdownText : styles.placeholderText}>
                    {gender ? `Género: ${gender}` : 'Selecciona tu Género'}
                </Text>
            </TouchableOpacity>
            <CustomInput
                placeholder="Correo Electrónico"
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
            />
            <CustomInput
                placeholder="Contraseña"
                value={password}
                isPassword
                onChangeText={setPassword}
            />
            <Text style={styles.labelSection}>Idioma de preferencia:</Text>
            <View style={styles.languageContainer}>
                <TouchableOpacity
                    style={[styles.langButton, language === 'Español' && styles.langButtonActive]}
                    onPress={() => setLanguage('Español')}
                >
                    <Text style={[styles.langText, language === 'Español' && styles.langTextActive]}>Español</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langButton, language === 'Inglés' && styles.langButtonActive]}
                    onPress={() => setLanguage('Inglés')}
                >
                    <Text style={[styles.langText, language === 'Inglés' && styles.langTextActive]}>Inglés</Text>
                </TouchableOpacity>
            </View>

            <Button title="Register" onPress={handleRegister} />
            <Modal
                visible={isGenderModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsGenderModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecciona tu Género</Text>
                        <FlatList
                            data={genderOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setGender(item);
                                        setIsGenderModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button title="Cerrar" color="red" onPress={() => setIsGenderModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    photoPicker: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e1e4e8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc'
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarText: {
        color: '#586069',
        fontSize: 14,
    },
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    dropdownText: {
        fontSize: 16,
        color: '#000',
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
    labelSection: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    languageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    langButton: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: '#fafafa'
    },
    langButtonActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    langText: {
        fontSize: 16,
        color: '#333',
    },
    langTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalItemText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default RegisterScreen;