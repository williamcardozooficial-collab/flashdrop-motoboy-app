
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import LoginScreen from './src/screens/LoginScreen';
import DisponiveisScreen from './src/screens/DisponiveisScreen';
import MeusServicosScreen from './src/screens/MeusServicosScreen';
import EntreguesScreen from './src/screens/EntreguesScreen';
import SaldoScreen from './src/screens/SaldoScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Tab = createBottomTabNavigator();

export default function App() {
  const [motoboy, setMotoboy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarSessao();
    configurarNotificacoes();
  }, []);

  async function carregarSessao() {
    try {
      const dados = await AsyncStorage.getItem('@flashdrop_motoboy');
      if (dados) setMotoboy(JSON.parse(dados));
    } catch (e) {}
    setLoading(false);
  }

  async function configurarNotificacoes() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
  }

  function handleLogin(dados) {
    setMotoboy(dados);
  }

  function handleLogout() {
    AsyncStorage.removeItem('@flashdrop_motoboy');
    setMotoboy(null);
  }

  if (loading) return null;
  if (!motoboy) return <LoginScreen onLogin={handleLogin} />;

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333', height: 60 },
          tabBarActiveTintColor: '#ff6b00',
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
        }}
      >
        <Tab.Screen
          name="Disponíveis"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>, tabBarLabel: 'Disponíveis' }}
        >
          {() => <DisponiveisScreen motoboy={motoboy} onLogout={handleLogout} />}
        </Tab.Screen>
        <Tab.Screen
          name="MeusServicos"
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛵</Text>, tabBarLabel: 'Meus Serviços' }}
        >
          {() => <MeusServicosScreen motoboy={motoboy} />}
        </Tab.Screen>
        <Tab.Screen
          name="Entregues"
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>✅</Text>, tabBarLabel: 'Entregues' }}
        >
          {() => <EntreguesScreen motoboy={motoboy} />}
        </Tab.Screen>
        <Tab.Screen
          name="Saldo"
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>💰</Text>, tabBarLabel: 'Saldo' }}
        >
          {() => <SaldoScreen motoboy={motoboy} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
