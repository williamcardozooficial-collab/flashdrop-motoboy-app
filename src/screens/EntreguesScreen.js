import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function EntreguesScreen({ user }) {
  const [entregues] = useState([
    { id: '1', origem: 'Rua A, 100', destino: 'Rua B, 200', valor: 'R$ 15,00', data: '19/05/2026' },
    { id: '2', origem: 'Av. C, 50', destino: 'Rua D, 300', valor: 'R$ 22,00', data: '18/05/2026' },
    { id: '3', origem: 'Rua E, 77', destino: 'Av. F, 10', valor: 'R$ 18,00', data: '18/05/2026' },
  ]);

  const total = entregues.reduce((sum, e) => sum + parseFloat(e.valor.replace('R$ ', '').replace(',', '.')), 0);

  return (
    <View style={styles.container}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Entregue (hoje)</Text>
        <Text style={styles.totalValor}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        <Text style={styles.totalCount}>{entregues.length} entregas</Text>
      </View>
      <FlatList
        data={entregues}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.data}>{item.data}</Text>
            <Text style={styles.rota}>📍 {item.origem}</Text>
            <Text style={styles.rota}>🏁 {item.destino}</Text>
            <Text style={styles.valor}>{item.valor}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  totalCard: { backgroundColor: '#ff8c00', padding: 24, alignItems: 'center', margin: 8, borderRadius: 8 },
  totalLabel: { color: '#fff', fontSize: 14 },
  totalValor: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 4 },
  totalCount: { color: '#fff', fontSize: 12 },
  card: { backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 8, elevation: 2 },
  data: { fontSize: 12, color: '#999', marginBottom: 8 },
  rota: { fontSize: 14, color: '#333', marginBottom: 4 },
  valor: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 8 },
});
