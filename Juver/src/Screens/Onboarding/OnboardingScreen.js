import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const slides = [
    {
        id: 1,
        icon: 'map',
        title: 'Viaja con Juver',
        description:
            'Solicita viajes de forma rápida, segura y sencilla desde tu ubicación actual.',
    },
    {
        id: 2,
        icon: 'car-sport',
        title: 'Elige tu vehículo',
        description: 'Selecciona entre Económico, XL o Premium según tus necesidades.',
    },
    {
        id: 3,
        icon: 'card',
        title: 'Paga fácilmente',
        description: 'Usa Stripe, Mercado Pago o efectivo mediante una pasarela simulada.',
    },
];

const OnboardingScreen = ({ onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentSlide = slides[currentIndex];

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return;
        }

        onFinish();
    };

    const handleSkip = () => {
        onFinish();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Saltar</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name={currentSlide.icon} size={70} color="#2196F3" />
                </View>

                <Text style={styles.title}>{currentSlide.title}</Text>
                <Text style={styles.description}>{currentSlide.description}</Text>

                <View style={styles.dotsContainer}>
                    {slides.map((slide, index) => (
                        <View
                            key={slide.id}
                            style={[styles.dot, currentIndex === index && styles.activeDot]}
                        />
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                    {currentIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    skipButton: {
        alignSelf: 'flex-end',
        marginTop: 40,
    },
    skipText: {
        color: '#2196F3',
        fontWeight: 'bold',
        fontSize: 15,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 35,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212121',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: 35,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DADCE0',
        marginHorizontal: 5,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#2196F3',
    },
    nextButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;
