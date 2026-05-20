import React, { useState, useEffect } from 'react';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('flashdrop_user').then(val => {
      if (val) {
        const u = JSON.parse(val);
        if (u && u.id && u.role === 'motoboy') setUser(u);
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = async (userData) => {
    await AsyncStorage.setItem('flashdrop_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('flashdrop_user');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ffcc00" />
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
          tabBarActiveTintColor: '#ffcc00',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { backgroundColor: '#111', borderTopColor: '#333', height: 60 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
          headerStyle: { backgroundColor: '#0f0f0f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen
          name="Disponiveis"
          options={{ tabBarLabel: 'Disponíveis', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>, title: '📋 Disponíveis' }}
        >
          {() => <DisponiveisScreen user={user} onLogout={handleLogout} setUser={setUser} />}
        </Tab.Screen>
        <Tab.Screen
          name="MeusServicos"
          options={{ tabBarLabel: 'Meus Serviços', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛵</Text>, title: '🛵 Meus Serviços' }}
        >
          {() => <MeusServicosScreen user={user} setUser={setUser} />}
        </Tab.Screen>
        <Tab.Screen
          name="Entregues"
          options={{ tabBarLabel: 'Entregues', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>✅</Text>, title: '✅ Entregues' }}
        >
          {() => <EntreguesScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen
          name="Saldo"
          options={{ tabBarLabel: 'Saldo', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text>, title: '💰 Saldo' }}
        >
          {() => <SaldoScreen user={user} setUser={setUser} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
