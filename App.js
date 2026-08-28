import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import MotoboyWebApp from './src/screens/MotoboyWebApp'; import './src/backgroundLocationTask';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('flashdrop_user').then((data) => {
      if (data) {
        const u = JSON.parse(data);
        if (u && u.id && u.role === 'motoboy') {
          setUser(u);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try { await AsyncStorage.removeItem('flashdrop_user'); } catch (e) {}
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#ffcc00" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MotoboyWebApp user={user} onLogout={handleLogout} />;
}
