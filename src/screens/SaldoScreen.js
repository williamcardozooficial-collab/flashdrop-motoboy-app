import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function SaldoScreen({ user }) {
  const [saldo] = useState({ disponivel: 127.50, pendente: 45.00, total: 172.50 });
  const [historico] = useState([
    { id: '1', desc: 'Entrega #001', valor: '+R$ 15,00', data: '19/05', tipo: 'entrada' },
    { id: '2', desc: 'Entrega #002', valor: '+R$ 22,00', data: '19/05', tipo: 'entrada' },
    { id: '3', desc: 'Saque', valor: '-R$ 50,00', data: '18/05', tipo: 'saida' },
    { id: '4', desc: 'Entrega #003', valor: '+R$ 18,00', data: '18/05', tipo: 'entrada' },
  ]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.saldoCard}>
        <Text style={styles.saldoLabel}>Saldo Disponível</Text>
        <Text style={styles.saldoValor}>R$ {saldo.disponivel.toFixed(2).replace('.', ',')}</Text>
        <View style={styles.saldoRow}>
          <View style={styles.saldoItem}>
            <Text style={styles.saldoItemLabel}>Pendente</Text>
            <Text style={styles.saldoItemValor}>R$ {saldo.pendente.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.saldoItem}>
            <Text style={styles.saldoItemLabel}>Total do mês</Text>
            <Text style={styles.saldoItemValor}>R$ {saldo.total.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Histórico</Text>
      {historico.map(item => (
        <View key={item.id} style={styles.histCard}>
          <View>
            <Text style={styles.histDesc}>{item.desc}</Text>
            <Text style={styles.histData}>{item.data}</Text>
          </View>
          <Text style={[styles.histValor, { color: item.tipo === 'entrada' ? '#4CAF50' : '#f44336' }]}>
            {item.valor}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  saldoCard: { backgroundColor: '#ff8c00', padding: 24, margin: 8, borderRadius: 8, alignItems: 'center' },
  saldoLabel: { color: '#fff', fontSize: 14 },
  saldoValor: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  saldoRow: { flexDirection: 'row', marginTop: 8 },
  saldoItem: { alignItems: 'center', marginHorizontal: 16 },
  saldoItemLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  saldoItemValor: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', margin: 16 },
  histCard: { backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 8, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histDesc: { fontSize: 14, fontWeight: '600', color: '#333' },
  histData: { fontSize: 12, color: '#999', marginTop: 2 },
  histValor: { fontSize: 16, fontWeight: 'bold' },
});
