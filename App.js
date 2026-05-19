import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DisponiveisScreen from './src/screens/DisponiveisScreen';
import MeusServicosScreen from './src/screens/MeusServicosScreen';
import EntreguesScreen from './src/screens/EntreguesScreen';
import SaldoScreen from './src/screens/SaldoScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('motoboy_user').then(val => {
      if (val) setUser(JSON.parse(val));
      setLoading(false);
    });
  }, []);

  const handleLogin = async (userData) => {
    await AsyncStorage.setItem('motoboy_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('motoboy_user');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#ff8c00" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#ff8c00',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee' },
          headerStyle: { backgroundColor: '#ff8c00' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="Disponíveis" options={{ tabBarLabel: 'Disponíveis' }}>
          {() => <DisponiveisScreen user={user} onLogout={handleLogout} />}
        </Tab.Screen>
        <Tab.Screen name="Meus Serviços" options={{ tabBarLabel: 'Meus Serviços' }}>
          {() => <MeusServicosScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen name="Entregues" options={{ tabBarLabel: 'Entregues' }}>
          {() => <EntreguesScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen name="Saldo" options={{ tabBarLabel: 'Saldo' }}>
          {() => <SaldoScreen user={user} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
