import React,{useState,useEffect} from 'react';
import {View,Text,ScrollView,StyleSheet,RefreshControl} from 'react-native';
const API='https://flashdrop-backend-production.up.railway.app';
export default function SaldoScreen({motoboy}){
  const [eventos,setEventos]=useState([]);
  const [saldo,setSaldo]=useState(0);
  const [refreshing,setRefreshing]=useState(false);
  useEffect(()=>{load();},[]);
  async function load(){try{const r=await fetch(API+'/api/motoboy/saldo?id='+motoboy.id);if(r.ok){const d=await r.json();setEventos(d.eventos||[]);setSaldo(d.saldo||0);}}catch(e){}}
  const onRefresh=async()=>{setRefreshing(true);await load();setRefreshing(false);};
  return(<View style={s.c}><View style={s.h}><Text style={s.t}>Saldo</Text><Text style={s.saldo}>R$ {parseFloat(saldo).toFixed(2)}</Text></View><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#ff6b00'/>}><Text style={s.st}>Ultimas 24h</Text>{eventos.length===0?<Text style={s.v}>Nenhum evento nas ultimas 24h</Text>:eventos.map((e,i)=>(<View key={i} style={s.card}><View style={s.row}><Text style={s.desc}>{e.description}</Text><Text style={[s.val,{color:e.amount>0?'#00d26a':'#ff4444'}]}>{e.amount>0?'+':''}R$ {parseFloat(e.amount).toFixed(2)}</Text></View><Text style={s.data}>{e.created_at?new Date(e.created_at).toLocaleString('pt-BR'):''}</Text></View>))}<View style={{height:20}}/></ScrollView></View>);
}
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#0f0f0f'},h:{padding:20,paddingTop:50,backgroundColor:'#1a1a1a',borderBottomWidth:1,borderBottomColor:'#2a2a2a',alignItems:'center'},t:{color:'#fff',fontSize:22,fontWeight:'bold'},saldo:{color:'#f0c040',fontSize:36,fontWeight:'bold',marginTop:8},st:{color:'#aaa',fontSize:13,margin:16,marginBottom:8},v:{color:'#666',textAlign:'center',padding:30},card:{marginHorizontal:16,marginBottom:10,backgroundColor:'#1a1a1a',padding:14,borderRadius:10,borderWidth:1,borderColor:'#2a2a2a'},row:{flexDirection:'row',justifyContent:'space-between'},desc:{color:'#ddd',fontSize:14,flex:1},val:{fontWeight:'bold',fontSize:15},data:{color:'#666',fontSize:11,marginTop:4}});