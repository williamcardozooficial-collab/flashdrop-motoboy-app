import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

export default function LoginScreen({ onLogin }) {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');

  const handleLogin = () => {
    if (!nome.trim() || !codigo.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    onLogin({ nome: nome.trim(), codigo: codigo.trim() });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>⚡ FlashDrop</Text>
        <Text style={styles.subtitle}>Painel do Motoboy</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Seu Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Código de Acesso</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu código"
          value={codigo}
          onChangeText={setCodigo}
          secureTextEntry
        />
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>ENTRAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#ff8c00', padding: 40, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 8 },
  form: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  btn: { backgroundColor: '#ff8c00', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
