import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://flashdrop-backend-production.up.railway.app';

export default function SaldoScreen() {
    const [user, setUser] = useState(null);
    const [saldo, setSaldo] = useState({ disponivel: 0, pendente: 0, total_mes: 0 });
    const [historico, setHistorico] = useState([]);
    const [saques, setSaques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalSaque, setModalSaque] = useState(false);
    const [valorSaque, setValorSaque] = useState('');
    const [chavePix, setChavePix] = useState('');
    const [enviandoSaque, setEnviandoSaque] = useState(false);

  useEffect(() => { loadUser(); }, []);
    useEffect(() => { if (user) fetchAll(); }, [user]);

  const loadUser = async () => {
        try {
                const d = await AsyncStorage.getItem('flashdrop_user');
                if (d) setUser(JSON.parse(d));
        } catch (e) {}
  };

  const fetchAll = useCallback(async () => {
        if (!user) return;
        try {
                const headers = { 'Authorization': 'Bearer ' + user.token };

          const [uRes, wRes] = await Promise.all([
                    fetch(API_BASE + '/users/' + user.id, { headers }),
                    fetch(API_BASE + '/users/' + user.id + '/wallet-events', { headers }),
                  ]);

          const uData = await uRes.json();
                const wData = await wRes.json();

          if (uData && !uData.error) {
                    setSaldo({
                                disponivel: parseFloat(uData.saldo || uData.balance || 0),
                                pendente: parseFloat(uData.saldo_pendente || uData.pending_balance || 0),
                                total_mes: parseFloat(uData.total_mes || uData.monthly_total || 0),
                    });
                    if (uData.pix_key || uData.chave_pix) {
                                setChavePix(uData.pix_key || uData.chave_pix);
                    }
          }

          const events = Array.isArray(wData) ? wData : (wData.events || []);
                events.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
                setHistorico(events);

          try {
                    const sRes = await fetch(API_BASE + '/withdrawals/motoboy/' + user.id, { headers });
                    const sData = await sRes.json();
                    const swList = Array.isArray(sData) ? sData : (sData.withdrawals || []);
                    swList.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
                    setSaques(swList.slice(0, 5));
          } catch (e) {}

        } catch (e) {
                console.error('Erro saldo:', e);
        } finally {
                setLoading(false);
                setRefreshing(false);
        }
  }, [user]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const solicitarSaque = async () => {
        const v = parseFloat(valorSaque.replace(',', '.'));
        if (!v || v <= 0) { Alert.alert('Erro', 'Informe um valor valido'); return; }
        if (v > saldo.disponivel) { Alert.alert('Erro', 'Saldo insuficiente'); return; }
        if (!chavePix.trim()) { Alert.alert('Erro', 'Informe sua chave PIX'); return; }
        setEnviandoSaque(true);
        try {
                const res = await fetch(API_BASE + '/withdrawals', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.token },
                          body: JSON.stringify({ motoboy_id: user.id, amount: v, pix_key: chavePix }),
                });
                const data = await res.json();
                if (res.ok) {
                          Alert.alert('Saque solicitado!', 'Seu saque de R$ ' + v.toFixed(2).replace('.', ',') + ' foi solicitado.');
                          setModalSaque(false);
                          setValorSaque('');
                          fetchAll();
                } else {
                    Alert.alert('Erro', data.message || data.error || 'Nao foi possivel solicitar saque');
                }
        } catch (e) {
                Alert.alert('Erro', 'Falha na conexao');
        } finally {
                setEnviandoSaque(false);
        }
  };

  const fmt = (d) => { try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return ''; } };

  const renderEvent = (item, idx) => {
        const v = parseFloat(item.amount || item.valor || 0);
        const isPos = v >= 0;
        const desc = item.description || item.descricao || item.type || 'Movimentacao';
        return (
                <View key={String(item.id || idx)} style={s.eventRow}>
        <View style={s.eventInfo}>
          <Text style={s.eventDesc}>{desc}</Text>
            <Text style={s.eventDate}>{fmt(item.created_at || item.createdAt)}</Text>
  </View>
        <Text style={[s.eventVal, isPos ? s.pos : s.neg]}>
{isPos ? '+' : ''}R$ {v.toFixed(2).replace('.', ',')}
</Text>
  </View>
    );
};

  const renderSaque = (item, idx) => {
        const v = parseFloat(item.amount || item.valor || 0);
        const status = item.status || 'pendente';
        const statusColor = status === 'aprovado' || status === 'pago' ? '#22c55e' : status === 'recusado' ? '#ef4444' : '#f97316';
        return (
                <View key={String(item.id || idx)} style={s.eventRow}>
        <View style={s.eventInfo}>
          <Text style={s.eventDesc}>Saque PIX</Text>
          <Text style={[s.saqueStatus, { color: statusColor }]}>{status}</Text>
          <Text style={s.eventDate}>{fmt(item.created_at || item.createdAt)}</Text>
    </View>
        <Text style={[s.eventVal, s.neg]}>-R$ {v.toFixed(2).replace('.', ',')}</Text>
    </View>
    );
};

  if (loading) {
        return (
                <View style={s.ctr}>
        <ActivityIndicator size="large" color="#f97316" />
                  <Text style={s.loadTxt}>Carregando saldo...</Text>
          </View>
        );
  }

  return (
        <View style={s.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />}>
            <View style={s.saldoCard}>
          <Text style={s.saldoLabel}>Saldo Disponivel</Text>
          <Text style={s.saldoAmt}>R$ {saldo.disponivel.toFixed(2).replace('.', ',')}</Text>
          <View style={s.row}>
            <View style={s.subInfo}>
              <Text style={s.subLabel}>Pendente</Text>
              <Text style={s.subVal}>R$ {saldo.pendente.toFixed(2).replace('.', ',')}</Text>
    </View>
            <View style={s.subInfo}>
              <Text style={s.subLabel}>Total do mes</Text>
                  <Text style={s.subVal}>R$ {saldo.total_mes.toFixed(2).replace('.', ',')}</Text>
    </View>
    </View>
    </View>

        <TouchableOpacity style={s.saqueBtn} onPress={() => setModalSaque(true)}>
              <Text style={s.saqueBtnTxt}>Solicitar Saque PIX</Text>
    </TouchableOpacity>

{historico.length > 0 && (
            <View style={s.section}>
            <Text style={s.sectionTitle}>Historico de Movimentacoes</Text>
 {historico.slice(0, 20).map((item, idx) => renderEvent(item, idx))}
 </View>
         )}

{saques.length > 0 && (
            <View style={s.section}>
            <Text style={s.sectionTitle}>Ultimos Saques</Text>
 {saques.map((item, idx) => renderSaque(item, idx))}
 </View>
         )}

{historico.length === 0 && saques.length === 0 && (
            <View style={s.empty}>
            <Text style={s.emptyT}>Nenhuma movimentacao encontrada</Text>
             <Text style={s.emptySub}>Suas entregas e saques aparecerao aqui</Text>
  </View>
         )}
</ScrollView>

      <Modal visible={modalSaque} transparent animationType="slide">
          <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Solicitar Saque</Text>
            <Text style={s.modalLabel}>Valor (disponivel: R$ {saldo.disponivel.toFixed(2).replace('.', ',')})</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: 50,00"
              keyboardType="decimal-pad"
              value={valorSaque}
              onChangeText={setValorSaque}
            />
                            <Text style={s.modalLabel}>Chave PIX</Text>
            <TextInput
              style={s.input}
              placeholder="CPF, email, telefone ou chave aleatoria"
              value={chavePix}
              onChangeText={setChavePix}
              autoCapitalize="none"
            />
                            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalSaque(false)}>
                                <Text style={s.cancelTxt}>Cancelar</Text>
                </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={solicitarSaque} disabled={enviandoSaque}>
              {enviandoSaque ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmTxt}>Confirmar</Text>}
                </TouchableOpacity>
                </View>
                </View>
                </View>
                </Modal>
                </View>
  );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadTxt: { marginTop: 10, color: '#666', fontSize: 14 },
    saldoCard: { backgroundColor: '#f97316', margin: 12, borderRadius: 12, padding: 20, alignItems: 'center', elevation: 3 },
    saldoLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
    saldoAmt: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
    row: { flexDirection: 'row', gap: 24 },
    subInfo: { alignItems: 'center' },
    subLabel: { color: '#fff', fontSize: 12, opacity: 0.8 },
    subVal: { color: '#fff', fontSize: 16, fontWeight: '700' },
    saqueBtn: { backgroundColor: '#16a34a', marginHorizontal: 12, marginBottom: 12, borderRadius: 10, padding: 14, alignItems: 'center', elevation: 2 },
    saqueBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
    section: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12, borderRadius: 10, padding: 14, elevation: 2 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10 },
    eventRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    eventInfo: { flex: 1 },
    eventDesc: { fontSize: 14, color: '#333', fontWeight: '500' },
    eventDate: { fontSize: 12, color: '#999', marginTop: 2 },
    saqueStatus: { fontSize: 12, fontWeight: '600', marginTop: 1 },
    eventVal: { fontSize: 16, fontWeight: '700' },
    pos: { color: '#22c55e' },
    neg: { color: '#ef4444' },
    empty: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
    emptyT: { fontSize: 16, color: '#666', fontWeight: '600', marginBottom: 4 },
    emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
    modalLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 12, backgroundColor: '#fafafa' },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center' },
    cancelTxt: { fontSize: 15, color: '#666', fontWeight: '600' },
    confirmBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#f97316', alignItems: 'center' },
    confirmTxt: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
