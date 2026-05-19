import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function DisponiveisScreen({ user, onLogout }) {
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [pedidos, setPedidos] = useState([
    { id: 1, origem: 'Rua A, 100', destino: 'Rua B, 200', valor: 'R$ 15,00', distancia: '2.3 km' },
    { id: 2, origem: 'Av. C, 50', destino: 'Rua D, 300', valor: 'R$ 22,00', distancia: '4.1 km' },
  ]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
  }, []);

  const toggleOnline = () => {
    setOnline(!online);
    Alert.alert(online ? 'Offline' : 'Online', online ? 'Você ficou offline' : 'Você está online e recebendo pedidos!');
  };

  const aceitarPedido = (pedido) => {
    Alert.alert('Pedido Aceito!', pedido.origem + ' → ' + pedido.destino);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statusBar, { backgroundColor: online ? '#4CAF50' : '#ccc' }]}>
        <Text style={styles.statusText}>{online ? '🟢 ONLINE' : '⚫ OFFLINE'}</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={toggleOnline}>
          <Text style={styles.toggleText}>{online ? 'Ficar Offline' : 'Ficar Online'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.infoText}>Olá, {user.nome}! 👋</Text>
        {location && <Text style={styles.gpsText}>📍 GPS ativo: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>}
      </View>
      <Text style={styles.sectionTitle}>Pedidos Disponíveis</Text>
      {online ? pedidos.map(p => (
        <View key={p.id} style={styles.pedidoCard}>
          <Text style={styles.pedidoRota}>📍 {p.origem}</Text>
          <Text style={styles.pedidoRota}>🏁 {p.destino}</Text>
          <View style={styles.pedidoInfo}>
            <Text style={styles.pedidoValor}>{p.valor}</Text>
            <Text style={styles.pedidoDist}>{p.distancia}</Text>
          </View>
          <TouchableOpacity style={styles.aceitarBtn} onPress={() => aceitarPedido(p)}>
            <Text style={styles.aceitarText}>ACEITAR</Text>
          </TouchableOpacity>
        </View>
      )) : (
        <Text style={styles.offlineMsg}>Fique online para ver pedidos disponíveis</Text>
      )}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statusBar: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toggleBtn: { backgroundColor: 'rgba(255,255,255,0.3)', padding: 8, borderRadius: 6 },
  toggleText: { color: '#fff', fontWeight: '600' },
  info: { backgroundColor: '#fff', padding: 16, margin: 8, borderRadius: 8 },
  infoText: { fontSize: 16, fontWeight: '600', color: '#333' },
  gpsText: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', margin: 16 },
  pedidoCard: { backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 8, elevation: 2 },
  pedidoRota: { fontSize: 14, color: '#333', marginBottom: 4 },
  pedidoInfo: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  pedidoValor: { fontSize: 16, fontWeight: 'bold', color: '#ff8c00' },
  pedidoDist: { fontSize: 14, color: '#666' },
  aceitarBtn: { backgroundColor: '#ff8c00', padding: 12, borderRadius: 6, alignItems: 'center' },
  aceitarText: { color: '#fff', fontWeight: 'bold' },
  offlineMsg: { textAlign: 'center', color: '#999', fontSize: 16, margin: 32 },
  logoutBtn: { margin: 16, padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  logoutText: { color: '#999' },
});
