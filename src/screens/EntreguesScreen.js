import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://flashdrop-backend-production.up.railway.app'; const fmtEndereco = (v) => { if (!v) return ''; try { var o = typeof v === 'string' ? JSON.parse(v) : v; if (o && typeof o === 'object') { return [o.rua, o.num, o.comp, o.bairro, o.cidade].filter(Boolean).join(', '); } return v; } catch (e) { return v; } };

export default function EntreguesScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState('hoje');

  useEffect(() => { loadUser(); }, []);
    useEffect(() => { if (user) fetchDelivered(); }, [user, filter]);

  const loadUser = async () => {
        try {
                const data = await AsyncStorage.getItem('flashdrop_user');
                if (data) setUser(JSON.parse(data));
        } catch (e) {}
  };

  const fetchDelivered = useCallback(async () => {
        if (!user) return;
        try {
                const res = await fetch(
                          API_BASE + '/orders?motoboy_id=' + user.id + '&status=entregue',
                  { headers: { 'Authorization': 'Bearer ' + user.token } }
                        );
                const data = await res.json();
                const all = Array.isArray(data) ? data : (data.orders || []);
                const now = new Date();
                const filtered = all.filter(o => {
                          const d = new Date(o.t_entregue || o.updated_at || o.createdAt || o.created_at);
                          if (filter === 'hoje') return d.toDateString() === now.toDateString();
                          if (filter === 'semana') {
                                      const w = new Date(now);
                                      w.setDate(w.getDate() - 7);
                                      return d >= w;
                          }
                          return true;
                });
                filtered.sort((a, b) =>
                          new Date(b.t_entregue || b.updated_at || b.createdAt || b.created_at) -
                          new Date(a.t_entregue || a.updated_at || a.createdAt || a.created_at)
                                    );
                setOrders(filtered);
        } catch (e) {
                console.error('Erro entregues:', e);
        } finally {
                setLoading(false);
                setRefreshing(false);
        }
  }, [user, filter]);

  const onRefresh = () => { setRefreshing(true); fetchDelivered(); };

  const totalGanho = orders.reduce((s, o) => s + parseFloat(o.motoboy_fee || o.valor_motoboy || 0), 0);

  const fmt = (d) => {
        try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return ''; }
  };
    const fmtT = (d) => {
          try { return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
    };

  const renderOrder = ({ item }) => {
        const dt = item.t_entregue || item.updated_at || item.createdAt || item.created_at;
        const g = parseFloat(item.motoboy_fee || item.valor_motoboy || 0);
        return (
                <View style={s.card}>
            <View style={s.row}>
          <Text style={s.dt}>{fmt(dt)}</Text>
            <Text style={s.dt}>{fmtT(dt)}</Text>
    </View>
          <Text style={s.addr}>Coleta: {fmtEndereco(item.pickup_address || item.endereco_coleta) || 'N/D'}</Text>
          <Text style={s.addr}>Entrega: {fmtEndereco(item.delivery_address || item.endereco_entrega) || 'N/D'}</Text>
          <View style={s.row}>
          <Text style={s.fee}>R$ {g.toFixed(2).replace('.', ',')}</Text>
            <Text style={s.badge}>Entregue</Text>
    </View>
    </View>
      );
};

  if (loading) {
                                                              return (
                                                                      <View style={s.ctr}>
        <ActivityIndicator size="large" color="#f97316" />
                                                                        <Text style={s.loadTxt}>Carregando...</Text>
                                                                </View>
        );
  }

  const lbl = filter === 'hoje' ? 'Total hoje' : filter === 'semana' ? 'Total semana' : 'Total geral';

  return (
        <View style={s.container}>
      <View style={s.sum}>
        <Text style={s.lbl}>{lbl}</Text>
        <Text style={s.amt}>R$ {totalGanho.toFixed(2).replace('.', ',')}</Text>
        <Text style={s.cnt}>{orders.length} {orders.length === 1 ? 'entrega' : 'entregas'}</Text>
    </View>
      <View style={s.filters}>
  {['hoje', 'semana', 'tudo'].map(f => (
              <TouchableOpacity
                                              key={f}
            style={[s.fbtn, filter === f && s.fbtnA]}
            onPress={() => { setLoading(true); setFilter(f); }}
          >
                          <Text style={[s.ftxt, filter === f && s.ftxtA]}>
  {f === 'hoje' ? 'Hoje' : f === 'semana' ? 'Semana' : 'Tudo'}
              </Text>
              </TouchableOpacity>
        ))}
          </View>
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id || item._id || Math.random())}
                  renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />}
        ListEmptyComponent={
                    <View style={s.empty}>
            <Text style={s.emptyT}>Nenhuma entrega encontrada</Text>
            <Text style={s.emptySub}>
{filter === 'hoje' ? 'Sem entregas hoje' : 'Sem entregas no periodo selecionado'}
          </Text>
          </View>
}
        contentContainerStyle={orders.length === 0 ? s.emptyList : s.list}
      />
          </View>
  );
          }

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadTxt: { marginTop: 10, color: '#666', fontSize: 14 },
    sum: { backgroundColor: '#f97316', margin: 12, borderRadius: 12, padding: 20, alignItems: 'center', elevation: 3 },
    lbl: { color: '#fff', fontSize: 14, opacity: 0.9 },
    amt: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    cnt: { color: '#fff', fontSize: 13, opacity: 0.85, marginTop: 2 },
    filters: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, gap: 8 },
    fbtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
    fbtnA: { backgroundColor: '#f97316', borderColor: '#f97316' },
    ftxt: { fontSize: 13, color: '#666', fontWeight: '500' },
    ftxtA: { color: '#fff', fontWeight: '700' },
    list: { paddingHorizontal: 12, paddingBottom: 20 },
    emptyList: { flex: 1 },
    card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, marginHorizontal: 12, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    dt: { fontSize: 12, color: '#999' },
    addr: { fontSize: 13, color: '#444', marginBottom: 2 },
    fee: { fontSize: 18, fontWeight: 'bold', color: '#22c55e' },
    badge: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyT: { fontSize: 16, color: '#666', fontWeight: '600', marginBottom: 4 },
    emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});
