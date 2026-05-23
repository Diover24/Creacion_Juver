import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';

// Importa tu servicio de autenticación (Asegúrate de que la ruta sea correcta)
import { authService } from '../services/database';

// Importa los dos flujos principales
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Escucha los cambios de sesión en Firebase
    const subscriber = authService.onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; // Limpia la suscripción
  }, []);

  // Mientras Firebase verifica la sesión, mostramos una pantalla de carga
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Aquí está la magia: 
         Si 'user' existe (está logueado), cargamos el TabNavigator (La app).
         Si 'user' es null, cargamos el AuthStack (Login/Registro).
      */}
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;