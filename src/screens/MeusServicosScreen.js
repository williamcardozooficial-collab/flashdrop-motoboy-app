import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl, Linking, TextInput, Modal } from 'react-native';

const API = 'https://flashdrop-backend-production.up.railway.app';
const STATUS_LABELS = { pendente:'Aguardando',aceito:'Aceito',na_loja:'Na Loja',coletado:'A Entregar',no_cliente:'No Cliente',entregue:'Entregue',retornado:'Retornado' };
const ACTION_MAP = {
    aceito:    { label:'Cheguei na Loja',    next:'na_loja',    msg:'Colete o pedido na loja.' },
    na_loja:   { label:'Coletei o Pedido',   next:'coletado',   msg:'Va entregar ao cliente.' },
    coletado:  { label:'Cheguei no Cliente', next:'no_cliente', msg:'Conclua a entrega.' },
    no_cliente:{ label:'Entreguei',          next:'entregue',   msg:'Entrega concluida! Saldo atualizado.' },
};
const BADGE_COLORS = { aceito:'#17a2b8',na_loja:'#6610f2',coletado:'#fd7e14',no_cliente:'#007bff',entregue:'#28a745' };
const STEPS = ['aceito','na_loja','coletado','no_cliente','entregue'];

function Timer({ tAceito }) {
    const TOTAL = 15 * 60;
    const elapsed = tAceito ? Math.floor((Date.now() - new Date(tAceito).getTime()) / 1000) : 0;
    const [rem, setRem] = useState(Math.max(TOTAL - elapsed, 0));
    useEffect(() => {
          const t = setInterval(() => setRem(r => Math.max(r - 1, 0)), 1000);
          return () => clearInterval(t);
    }, []);
    const m = Math.floor(rem / 60), s = rem % 60;
    const urgent = rem <= 120;
    return (
          <View style={[ts.box, urgent && ts.urgent]}>
            <Text style={[ts.txt, urgent && ts.urgentTxt]}>
    {rem <= 0 ? 'Tempo esgotado! Chegue logo na loja.' : 'Chegue na loja em ' + m + ':' + (s < 10 ? '0' : '') + s}
</Text>
  </View>
  );
}
const ts = StyleSheet.create({
    box:{ flexDirection:'row',alignItems:'center',backgroundColor:'#1a1a1a',borderWidth:1,borderColor:'#ffa500',borderRadius:8,padding:8,marginVertical:8 },
    urgent:{ borderColor:'#f44336' },
    txt:{ color:'#ffa500',fontWeight:'600',fontSize:13 },
    urgentTxt:{ color:'#f44336' },
});

export default function MeusServicosScreen({ user }) {
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [codigoModal, setCodigoModal] = useState(false);
    const [codigoInput, setCodigoInput] = useState('');
    const [pendingOrder, setPendingOrder] = useState(null);
    const userRef = useRef(user);

  useEffect(() => { userRef.current = user; }, [user]);

  // ── Carrega apenas os pedidos ativos deste motoboy ──
  const loadOrders = useCallback(async () => {
        const u = userRef.current;
        if (!u) return;
        try {
                const headers = { 'Authorization': 'Bearer ' + u.token };
                const r = await fetch(API + '/orders', { headers });
                const all = await r.json();
                const list = Array.isArray(all) ? all : (all.orders || []);
                const active = list.filter(o =>
                          String(o.motoboy_id) === String(u.id) &&
                          !['entregue', 'retornado', 'cancelado', 'pendente'].includes(o.status)
                                                 );
                setOrders(active);
        } catch (e) {
                console.error('loadOrders error:', e);
        }
  }, []);

  useEffect(() => {
        loadOrders();
        const t = setInterval(loadOrders, 10000);
        return () => clearInterval(t);
  }, [loadOrders]);

  const onRefresh = async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); };

  const openMaps = (addr) => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addr));
    const openWaze = (addr) => Linking.openURL('https://waze.com/ul?q=' + encodeURIComponent(addr) + '&navigate=yes');

  // ── Lida com toque no botao de acao ──
  const doAction = (order) => {
        const action = ACTION_MAP[order.status];
        if (!action) return;

        // Etapa final: pede codigo de entrega via modal
        if (action.next === 'entregue') {
                setPendingOrder(order);
                setCodigoInput('');
                setCodigoModal(true);
                return;
        }

        // Demais etapas: confirmacao simples
        Alert.alert(action.label, 'Confirmar: ' + action.label + '?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => executeAction(order, action) },
              ]);
  };

  // ── Envia atualizacao ao backend ──
  const executeAction = async (order, action, codigo) => {
        const u = userRef.current;
        try {
                const tsMap = { na_loja:'t_na_loja', coletado:'t_coletado', no_cliente:'t_no_cliente', entregue:'t_entregue' };
                const body = { status: action.next };
                if (tsMap[action.next]) body[tsMap[action.next]] = new Date().toISOString();
                if (codigo) body.observacao_entrega = codigo;

          const r = await fetch(API + '/orders/' + order.id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (u ? u.token : '') },
                    body: JSON.stringify(body),
          });

          if (r.status === 400) {
                    Alert.alert('Codigo incorreto', 'Verifique o codigo com o cliente e tente novamente.');
                    return;
          }
                if (r.status === 403) {
                          const d = await r.json();
                          Alert.alert('Erro', d.error || 'Acao nao permitida.');
                          return;
                }
                if (!r.ok) {
                          Alert.alert('Erro', 'Nao foi possivel atualizar o pedido.');
                          return;
                  }
                Alert.alert('Sucesso', action.msg);
                loadOrders();
        } catch (e) {
                Alert.alert('Erro', 'Falha na conexao.');
        }
  };

  // ── Confirmacao do codigo de entrega ──
  const confirmEntrega = () => {
        const codigo = codigoInput.trim();
        if (!codigo) {
                Alert.alert('Codigo obrigatorio', 'Digite o codigo de 4 digitos que o cliente informou.');
                return;
        }
        setCodigoModal(false);
        executeAction(pendingOrder, ACTION_MAP['no_cliente'], codigo);
  };

  // ── Cancelar pedido ──
  const cancelOrder = (order) => {
        Alert.alert('ATENCAO - PENALIDADE',
                          'Se cancelar voce ficara BLOQUEADO por 10 minutos. Deseja continuar?',
                          [
                            { text: 'Nao', style: 'cancel' },
                            { text: 'Sim, cancelar', style: 'destructive', onPress: async () => {
                                        try {
                                                      await fetch(API + '/orders/' + order.id, {
                                                                      method: 'PUT',
                                                                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (userRef.current ? userRef.current.token : '') },
                                                                      body: JSON.stringify({ status: 'pendente', motoboy_id: null, motoboy_name: null, t_aceito: null }),
                                                      });
                                                      Alert.alert('Cancelado', 'Voce esta bloqueado por 10 minutos.');
                                                      loadOrders();
                                        } catch (e) { Alert.alert('Erro', 'Nao foi possivel cancelar.'); }
                            }},
                                  ]
                        );
  };

  return (
        <View style={s.container}>

  {/* ── Modal de codigo de entrega ── */}
          <Modal visible={codigoModal} transparent animationType="slide">
            <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>🔑 Codigo de Entrega</Text>
              <Text style={s.modalSub}>Digite o codigo de 4 digitos que o cliente informou:</Text>
              <TextInput
                  style={s.modalInput}
              value={codigoInput}
              onChangeText={setCodigoInput}
              keyboardType="numeric"
              maxLength={6}
              placeholder="0000"
              placeholderTextColor="#555"
              autoFocus
            />
                            <TouchableOpacity style={s.modalBtn} onPress={confirmEntrega}>
                              <Text style={s.modalBtnTxt}>✅ Confirmar Entrega</Text>
                </TouchableOpacity>
            <TouchableOpacity style={s.modalCancel} onPress={() => setCodigoModal(false)}>
                              <Text style={s.modalCancelTxt}>Cancelar</Text>
                </TouchableOpacity>
                </View>
                </View>
                </Modal>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffcc00" />}>
                        <Text style={s.section}>Minhas Entregas Ativas ({orders.length})</Text>

{orders.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyTxt}>Nenhuma entrega ativa</Text></View>
          ) : orders.map(order => {
                      const statusColor = BADGE_COLORS[order.status] || '#888';
                      const clienteVisivel = ['coletado', 'no_cliente'].includes(order.status);
                      const action = ACTION_MAP[order.status];

                                   return (
                                                 <View key={order.id} style={s.card}>
{/* Cabecalho */}
                <View style={s.cardHeader}>
                <Text style={s.orderId}>Pedido #{order.id}</Text>
                 <View style={[s.badge, { backgroundColor: statusColor }]}>
                    <Text style={s.badgeTxt}>{STATUS_LABELS[order.status] || order.status}</Text>
  </View>
  </View>

{/* Timer na etapa aceito */}
{order.status === 'aceito' && <Timer tAceito={order.t_aceito} />}

{/* Barra de progresso */}
              <View style={s.progress}>
              {STEPS.map((st, i) => {
                                  const idx = STEPS.indexOf(order.status);
                                  const done = i < idx, active = i === idx;
                                  return (
                                                        <Text key={st} style={[s.step, done && s.stepDone, active && s.stepActive]}>
                                  {STATUS_LABELS[st]}
                         </Text>
                                           );
})}
  </View>

{/* Loja e coleta */}
              <View style={s.row}><Text style={s.lbl}>Loja</Text><Text style={s.val}>{order.loja_name || order.loja_user}</Text></View>
{order.endereco_coleta && (
                  <View style={s.row}><Text style={s.lbl}>Coleta</Text><Text style={s.val}>{order.endereco_coleta}</Text></View>
               )}
{order.endereco_coleta && (
                  <View style={s.navRow}>
                  <TouchableOpacity style={s.navMaps} onPress={() => openMaps(order.endereco_coleta)}>
                      <Text style={s.navTxt}>📍 Maps Coleta</Text>
  </TouchableOpacity>
                   <TouchableOpacity style={s.navWaze} onPress={() => openWaze(order.endereco_coleta)}>
                      <Text style={s.navTxtDark}>🚗 Waze Coleta</Text>
  </TouchableOpacity>
  </View>
               )}

{/* Dados do cliente - somente apos coletar */}
{clienteVisivel ? (
                  <>
{order.nome_cliente && <View style={s.row}><Text style={s.lbl}>Cliente</Text><Text style={s.val}>{order.nome_cliente}</Text></View>}
{order.telefone_cliente && <View style={s.row}><Text style={s.lbl}>Tel Cliente</Text><Text style={s.val}>{order.telefone_cliente}</Text></View>}
 {order.endereco_entrega && (
                       <View style={s.row}><Text style={s.lbl}>Entrega</Text><Text style={s.val}>{order.endereco_entrega}</Text></View>
                    )}
 {order.endereco_entrega && (
                       <View style={s.navRow}>
                         <TouchableOpacity style={s.navMaps} onPress={() => openMaps(order.endereco_entrega)}>
                           <Text style={s.navTxt}>📍 Maps Entrega</Text>
   </TouchableOpacity>
                        <TouchableOpacity style={s.navWaze} onPress={() => openWaze(order.endereco_entrega)}>
                           <Text style={s.navTxtDark}>🚗 Waze Entrega</Text>
   </TouchableOpacity>
   </View>
                    )}
 {order.tipo_pagamento === 'dinheiro' && (
                       <View style={s.cobranca}>
                         <Text style={s.cobrancaLbl}>💵 Cobrar do Cliente</Text>
                         <Text style={s.cobrancaVal}>R$ {(parseFloat(order.valor_pedido || 0) + parseFloat(order.valor_total || 0)).toFixed(2)}</Text>
                       <Text style={s.cobrancaSub}>
                           Produto: R$ {parseFloat(order.valor_pedido || 0).toFixed(2)} + Entrega: R$ {parseFloat(order.valor_total || 0).toFixed(2)}
 </Text>
   </View>
                   )}
 </>
               ) : (
                                 <Text style={s.privado}>🔒 Dados do cliente liberados ao coletar o pedido.</Text>
               )}

{order.telefone_loja && <View style={s.row}><Text style={s.lbl}>Tel Loja</Text><Text style={s.val}>{order.telefone_loja}</Text></View>}
               <View style={s.row}>
                <Text style={s.lbl}>Ganho Liquido</Text>
                 <Text style={[s.val, { color: '#ffcc00', fontWeight: '700' }]}>R$ {parseFloat(order.valor_motoboy || 0).toFixed(2)}</Text>
  </View>

 {/* Botao de acao principal */}
 {action && (
                   <TouchableOpacity style={s.btnAction} onPress={() => doAction(order)}>
                     <Text style={s.btnTxt}>{action.label}</Text>
   </TouchableOpacity>
               )}

{/* Botao cancelar (apenas nas primeiras etapas) */}
{['aceito', 'na_loja'].includes(order.status) && (
                  <TouchableOpacity style={s.btnCancel} onPress={() => cancelOrder(order)}>
                    <Text style={s.btnCancelTxt}>✕ Cancelar Entrega</Text>
  </TouchableOpacity>
              )}
</View>
          );
})}
        <View style={{ height: 20 }} />
          </ScrollView>
          </View>
  );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a1a' },
    section: { fontSize: 16, fontWeight: '600', color: '#fff', margin: 16 },
    empty: { alignItems: 'center', padding: 40 },
    emptyTxt: { color: '#666', fontSize: 16 },
    card: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 2, borderColor: '#0088cc' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    orderId: { fontSize: 16, fontWeight: '700', color: '#fff' },
    badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    badgeTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },
    progress: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 8, marginBottom: 8 },
    step: { fontSize: 9, color: '#555', flex: 1, textAlign: 'center' },
    stepDone: { color: '#28a745' },
    stepActive: { color: '#ffcc00', fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#3a3a3a' },
    lbl: { color: '#999', fontSize: 13 },
    val: { color: '#fff', fontSize: 13, fontWeight: '500', flex: 1, textAlign: 'right' },
    navRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
    navMaps: { flex: 1, backgroundColor: '#4285F4', borderRadius: 8, padding: 10, alignItems: 'center' },
    navWaze: { flex: 1, backgroundColor: '#33CCFF', borderRadius: 8, padding: 10, alignItems: 'center' },
    navTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
    navTxtDark: { color: '#000', fontSize: 12, fontWeight: '700' },
    cobranca: { backgroundColor: '#1a2a00', borderWidth: 2, borderColor: '#ffcc00', borderRadius: 10, padding: 12, marginVertical: 8, alignItems: 'center' },
    cobrancaLbl: { fontSize: 11, color: '#ffcc00', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    cobrancaVal: { fontSize: 22, fontWeight: '900', color: '#ffcc00' },
    cobrancaSub: { fontSize: 11, color: '#aaa', marginTop: 4 },
    privado: { fontSize: 11, color: '#ff9500', fontStyle: 'italic', marginVertical: 4 },
    btnAction: { backgroundColor: '#0088cc', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
    btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
    btnCancel: { borderWidth: 2, borderColor: '#f44336', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8 },
    btnCancelTxt: { color: '#f44336', fontSize: 14, fontWeight: '700' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: '#2a2a2a', borderRadius: 16, padding: 24, width: '100%', borderWidth: 1, borderColor: '#444' },
    modalTitle: { color: '#ffcc00', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    modalSub: { color: '#ccc', fontSize: 13, marginBottom: 16, textAlign: 'center' },
    modalInput: { backgroundColor: '#111', borderWidth: 2, borderColor: '#ffcc00', borderRadius: 10, color: '#fff', fontSize: 28, textAlign: 'center', padding: 14, marginBottom: 16, letterSpacing: 10 },
    modalBtn: { backgroundColor: '#28a745', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8 },
    modalBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
    modalCancel: { borderWidth: 1, borderColor: '#555', borderRadius: 10, padding: 12, alignItems: 'center' },
    modalCancelTxt: { color: '#aaa', fontSize: 14 },
});
