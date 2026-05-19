import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const STATUS_COLORS = { 'Em andamento': '#ff8c00', 'Concluído': '#4CAF50', 'Cancelado': '#f44336' };

export default function MeusServicosScreen({ user }) {
  const [servicos] = useState([
    { id: '1', origem: 'Rua A, 100', destino: 'Rua B, 200', valor: 'R$ 15,00', status: 'Concluído', hora: '14:30' },
    { id: '2', origem: 'Av. C, 50', destino: 'Rua D, 300', valor: 'R$ 22,00', status: 'Em andamento', hora: '15:45' },
    { id: '3', origem: 'Rua E, 77', destino: 'Av. F, 10', valor: 'R$ 18,00', status: 'Cancelado', hora: '16:00' },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.hora}>{item.hora}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.rota}>📍 {item.origem}</Text>
      <Text style={styles.rota}>🏁 {item.destino}</Text>
      <Text style={styles.valor}>{item.valor}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={servicos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 8 },
  card: { backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  hora: { fontSize: 14, color: '#666' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  rota: { fontSize: 14, color: '#333', marginBottom: 4 },
  valor: { fontSize: 16, fontWeight: 'bold', color: '#ff8c00', marginTop: 8 },
});
