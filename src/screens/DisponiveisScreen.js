import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, TouchableOpacity, FlatList,
    StyleSheet, Alert, RefreshControl, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'https://flashdrop-backend-production.up.railway.app';

export default function DisponiveisScreen({ onLogout }) {
const [user, setUser] = useState(null);
const [online, setOnline] = useState(false);
const [location, setLocation] = useState(null);
const [pedidos, setPedidos] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [toggling, setToggling] = useState(false);
const [saldo, setSaldo] = useState(0);
const pollRef = useRef(null);
const userRef = useRef(null);
const navigation = useNavigation();

useEffect(() => {
initUser();
requestLocation();
return () => { if (pollRef.current) clearInterval(pollRef.current); };
}, []);

const initUser = async () => {
try {
const d = await AsyncStorage.getItem('flashdrop_user');
if (d) {
const u = JSON.parse(d);
userRef.current = u;
setUser(u);
setOnline(u.online || false);
setSaldo(parseFloat(u.saldo || u.balance || 0));
startPolling(u);
}
} catch (e) {}
};

const startPolling = (u) => {
fetchPedidosWithUser(u);
if (pollRef.current) clearInterval(pollRef.current);
pollRef.current = setInterval(() => fetchPedidosWithUser(userRef.current), 10000);
};

const requestLocation = async () => {
try {
const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
const loc = await Location.getCurrentPositionAsync({});
setLocation(loc.coords);
}
} catch (e) {}
};

const fetchPedidosWithUser = async (u) => {
if (!u) return;
try {
const headers = { 'Authorization': 'Bearer ' + u.token };
const res = await fetch(API_BASE + '/orders?status=pendente', { headers });
const data = await res.json();
const list = Array.isArray(data) ? data : (data.orders || []);
const avail = list.filter(o => o.status === 'pendente' && !o.motoboy_id);
setPedidos(avail);

const uRes = await fetch(API_BASE + '/users/' + u.id, { headers });
const uData = await uRes.json();
if (uData && !uData.error) {
setSaldo(parseFloat(uData.saldo || uData.balance || 0));
setOnline(uData.online || false);
const updated = { ...u, ...uData };
userRef.current = updated;
setUser(updated);
await AsyncStorage.setItem('flashdrop_user', JSON.stringify(updated));
}
} catch (e) {
console.error('Erro pedidos:', e);
} finally {
setLoading(false);
setRefreshing(false);
}
};

const toggleOnline = async () => {
if (!user) return;
setToggling(true);
const novo = !online;
try {
const res = await fetch(API_BASE + '/users/' + user.id, {
method: 'PUT',
headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
body: JSON.stringify({ online: novo }),
});
if (res.ok) {
setOnline(novo);
const updated = { ...user, online: novo };
userRef.current = updated;
setUser(updated);
await AsyncStorage.setItem('flashdrop_user', JSON.stringify(updated));
} else {
const d = await res.json();
Alert.alert('Erro', d.message || 'Nao foi possivel alterar status');
}
} catch (e) {
Alert.alert('Erro', 'Falha na conexao');
} finally {
setToggling(false);
}
};

const aceitarPedido = (pedido) => {
if (!user) return;
const coleta = pedido.pickup_address || pedido.endereco_coleta || 'N/D';
const entrega = pedido.delivery_address || pedido.endereco_entrega || 'N/D';
const valor = parseFloat(pedido.motoboy_fee || pedido.valor_motoboy || 0);
Alert.alert(
'Aceitar pedido?',
'Coleta: ' + coleta + '\nEntrega: ' + entrega + '\nPagamento: ' + ({dinheiro:'💵 Dinheiro', pix:'⚡ PIX', maquina:'💳 Máquina'}[pedido.tipo_pagamento] || '💳 Máquina') + '\nValor: R$ ' + valor.toFixed(2).replace('.', ','),
[
{ text: 'Nao', style: 'cancel' },
{
text: 'Aceitar',
onPress: async () => {
try {
const res = await fetch(API_BASE + '/orders/' + pedido.id, {
method: 'PUT',
headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
body: JSON.stringify({ status: 'aceito', motoboy_id: user.id, t_aceito: new Date().toISOString() }),
});
if (res.ok) {
fetchPedidosWithUser(userRef.current);
Alert.alert('Pedido aceito!', 'Va ate o local de coleta.', [
{ text: 'OK', onPress: () => navigation.navigate('MeusServicos') }
]);
} else {
const d = await res.json();
Alert.alert('Erro', d.message || 'Nao foi possivel aceitar');
}
} catch (e) { Alert.alert('Erro', 'Falha na conexao'); }
},
},
]
);
};

const onRefresh = () => { setRefreshing(true); fetchPedidosWithUser(userRef.current); };

const calcDist = (p) => {
if (!location || !p.lat_coleta || !p.lng_coleta) return null;
const R = 6371;
const dLat = ((p.lat_coleta - location.latitude) * Math.PI) / 180;
const dLon = ((p.lng_coleta - location.longitude) * Math.PI) / 180;
const a = Math.sin(dLat/2)**2 + Math.cos(location.latitude*Math.PI/180)*Math.cos(p.lat_coleta*Math.PI/180)*Math.sin(dLon/2)**2;
const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
return d < 1 ? (d*1000).toFixed(0)+'m' : d.toFixed(1)+' km';
};

const renderPedido = ({ item }) => {
const valor = parseFloat(item.motoboy_fee || item.valor_motoboy || 0);
const dist = calcDist(item);
return (
<View style={s.card}>
<View style={s.cardTop}>
<Text style={s.addr} numberOfLines={1}>Coleta: {item.pickup_address || item.endereco_coleta || 'N/D'}</Text>
{dist ? <Text style={s.dist}>{dist}</Text> : null}
</View>
<Text style={s.addr} numberOfLines={1}>Entrega: {item.delivery_address || item.endereco_entrega || 'N/D'}</Text>
<View style={s.pagRow}>
{item.tipo_pagamento === 'dinheiro' && <Text style={s.pagDinheiro}>💵 Dinheiro</Text>}
{item.tipo_pagamento === 'pix' && <Text style={s.pagPix}>⚡ PIX</Text>}
{(item.tipo_pagamento === 'maquina' || !item.tipo_pagamento) && <Text style={s.pagMaquina}>💳 Máquina</Text>}
        {item.tipo_pagamento === 'cartao_aproximacao' && <Text style={s.pagCartaoAprox}>💳 Cartão Aprox.</Text>}
</View>
<View style={s.cardBot}>
<Text style={s.valor}>R$ {valor.toFixed(2).replace('.', ',')}</Text>
<TouchableOpacity style={s.aceitarBtn} onPress={() => aceitarPedido(item)}>
<Text style={s.aceitarTxt}>ACEITAR</Text>
</TouchableOpacity>
</View>
</View>
);
};

if (loading) {
return <View style={s.ctr}><ActivityIndicator size="large" color="#f97316"/><Text style={s.loadTxt}>Carregando...</Text></View>;
}

const nome = user ? (user.nome || user.name || user.username || '') : '';

return (
<View style={s.container}>
<View style={[s.bar, { backgroundColor: online ? '#16a34a' : '#6b7280' }]}>
<Text style={s.barTxt}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
<View style={s.barRight}>
<Text style={s.saldoTxt}>R$ {saldo.toFixed(2).replace('.', ',')}</Text>
<TouchableOpacity style={s.toggleBtn} onPress={toggleOnline} disabled={toggling}>
{toggling
? <ActivityIndicator color="#fff" size="small"/>
: <Text style={s.toggleTxt}>{online ? 'Ficar Offline' : 'Ficar Online'}</Text>}
</TouchableOpacity>
</View>
</View>
<View style={s.info}>
<Text style={s.infoTxt}>Ola, {nome}!</Text>
{location ? <Text style={s.gpsTxt}>GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text> : null}
</View>
{online ? (
<FlatList
data={pedidos}
keyExtractor={item => String(item.id || item._id || Math.random())}
renderItem={renderPedido}
refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']}/>}
ListHeaderComponent={<Text style={s.secTitle}>Pedidos Disponiveis</Text>}
ListEmptyComponent={
<View style={s.empty}>
<Text style={s.emptyT}>Nenhum pedido disponivel</Text>
<Text style={s.emptySub}>Aguarde novos pedidos...</Text>
</View>
}
contentContainerStyle={pedidos.length === 0 ? s.emptyList : s.list}
/>
) : (
<View style={s.offCtr}>
<Text style={s.offT}>Voce esta offline</Text>
<Text style={s.offSub}>Toque em "Ficar Online" para receber pedidos</Text>
</View>
)}
<TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
<Text style={s.logoutTxt}>Sair</Text>
</TouchableOpacity>
</View>
);
}

const s = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f5f5f5' },
ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
loadTxt: { marginTop: 10, color: '#666', fontSize: 14 },
bar: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
barTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
barRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
saldoTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },
toggleBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
toggleTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
info: { backgroundColor: '#fff', padding: 12, marginHorizontal: 12, marginTop: 10, borderRadius: 10, elevation: 1 },
infoTxt: { fontSize: 15, fontWeight: '600', color: '#333' },
gpsTxt: { fontSize: 11, color: '#888', marginTop: 2 },
secTitle: { fontSize: 16, fontWeight: '700', color: '#333', margin: 12 },
list: { paddingBottom: 16 },
emptyList: { flex: 1 },
card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 10, padding: 14, elevation: 2 },
cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
addr: { fontSize: 13, color: '#444', flex: 1, marginBottom: 2 },
dist: { fontSize: 12, color: '#888' },
cardBot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
valor: { fontSize: 18, fontWeight: 'bold', color: '#f97316' },
aceitarBtn: { backgroundColor: '#f97316', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
aceitarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
emptyT: { fontSize: 16, color: '#666', fontWeight: '600', marginBottom: 4 },
emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
offCtr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
offT: { fontSize: 18, color: '#666', fontWeight: '600', marginBottom: 8 },
offSub: { fontSize: 14, color: '#aaa', textAlign: 'center' },
logoutBtn: { margin: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
logoutTxt: { color: '#999', fontSize: 14 },
pagRow: { flexDirection: 'row', marginTop: 8, marginBottom: 2 },
pagDinheiro: { fontSize: 12, fontWeight: '700', color: '#fff', backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
pagPix: { fontSize: 12, fontWeight: '700', color: '#fff', backgroundColor: '#7c3aed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
pagMaquina: { fontSize: 12, fontWeight: '700', color: '#fff', backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pagCartaoAprox: { fontSize: 12, fontWeight: '700', color: '#fff', backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
});
