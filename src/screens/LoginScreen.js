import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'https://flashdrop-backend-production.up.railway.app';

export default function LoginScreen({ onLogin }) {
  const [login, setLoginVal] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!login || !senha) { Alert.alert('Atencao', 'Preencha login e senha'); return; }
    setLoading(true);
    try {
      const res = await fetch(API + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: login, password: senha, role: 'motoboy' }) });
      const data = await res.json();
      if (data.success && data.user) {
        await AsyncStorage.setItem('@flashdrop_motoboy', JSON.stringify(data.user));
        onLogin(data.user);
      } else { Alert.alert('Erro', data.message || 'Login invalido'); }
    } catch (e) { Alert.alert('Erro', 'Sem conexao com o servidor'); }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <Text style={s.logo}>FlashDrop</Text>
        <Text style={s.sub}>Area do Motoboy</Text>
      </View>
      <View style={s.form}>
        <TextInput style={s.input} placeholder='Login' placeholderTextColor='#666' value={login} onChangeText={setLoginVal} autoCapitalize='none' />
        <TextInput style={s.input} placeholder='Senha' placeholderTextColor='#666' value={senha} onChangeText={setSenha} secureTextEntry />
        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color='#fff' /> : <Text style={s.btnText}>ENTRAR</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#ff6b00' },
  sub: { fontSize: 16, color: '#aaa', marginTop: 8 },
  form: { gap: 16 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  btn: { backgroundColor: '#ff6b00', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});