import React,{useState,useEffect} from 'react';
import {View,Text,ScrollView,StyleSheet,RefreshControl} from 'react-native';
const API='https://flashdrop-backend-production.up.railway.app';
export default function EntreguesScreen({motoboy}){
  const [pedidos,setPedidos]=useState([]);
  const [refreshing,setRefreshing]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){try{const r=await fetch(API+'/api/motoboy/entregues?id='+motoboy.id);if(r.ok)setPedidos(await r.json());}catch(e){}}
  const onRefresh=async()=>{setRefreshing(true);await load();setRefreshing(false);};
  return(<View style={s.c}><View style={s.h}><Text style={s.t}>Entregues</Text><Text style={s.sub}>{pedidos.length} entrega(s)</Text></View><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#ff6b00'/>}>{pedidos.length===0?<Text style={s.v}>Nenhuma entrega concluida</Text>:pedidos.map(p=>(<View key={p.id} style={s.card}><View style={s.row}><Text style={s.loja}>{p.store_name}</Text><Text style={s.val}>R$ {parseFloat(p.delivery_fee||0).toFixed(2)}</Text></View><Text style={s.end}>{p.delivery_address}</Text><Text style={s.data}>{p.completed_at?new Date(p.completed_at).toLocaleString('pt-BR'):''}</Text></View>))}<View style={{height:20}}/></ScrollView></View>);
}
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#0f0f0f'},h:{padding:20,paddingTop:50,backgroundColor:'#1a1a1a',borderBottomWidth:1,borderBottomColor:'#2a2a2a'},t:{color:'#fff',fontSize:22,fontWeight:'bold'},sub:{color:'#888',fontSize:13,marginTop:4},v:{color:'#666',textAlign:'center',padding:40},card:{margin:16,marginBottom:0,backgroundColor:'#1a1a1a',padding:16,borderRadius:12,borderWidth:1,borderColor:'#2a2a2a'},row:{flexDirection:'row',justifyContent:'space-between',marginBottom:8},loja:{color:'#fff',fontWeight:'bold',fontSize:15},val:{color:'#00d26a',fontWeight:'bold',fontSize:15},end:{color:'#aaa',fontSize:13},data:{color:'#666',fontSize:11,marginTop:6}});