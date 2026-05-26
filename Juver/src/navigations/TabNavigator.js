import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../Screens/Home/HomeScreen';
import ActiveTripScreen from '../Screens/Trips/ActiveTripScreen';
import TripHistoryScreen from '../Screens/Trips/TripHistoryScreen';
import ProfileScreen from '../Screens/Auth/ProfileScreen';
import PaymentScreen from '../Screens/Payments/PaymentScreen';
import ReceiptScreen from '../Screens/Payments/ReceiptScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Inicio') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Viaje Activo') {
                        iconName = focused ? 'car-sport' : 'car-sport-outline';
                    } else if (route.name === 'Historial') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007BFF',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                    borderTopWidth: 1,
                    borderTopColor: '#E4E6E8',
                },
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} />
            <Tab.Screen name="Viaje Activo" component={ActiveTripScreen} />
            <Tab.Screen name="Historial" component={TripHistoryScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
            <Tab.Screen name="Pago" component={PaymentScreen} options={{ tabBarButton: () => null, tabBarItemStyle: {display: 'none', }, }} />
            <Tab.Screen name="Recibo" component={ReceiptScreen} options={{tabBarButton: () => null, tabBarItemStyle: {display: 'none', }, }}/>
        </Tab.Navigator>
    );

};

export default TabNavigator;

