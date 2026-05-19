import React,{useState,useEffect,useRef} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StyleSheet,RefreshControl,Alert,AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
const API='https://flashdrop-backend-production.up.railway.app';
const AUTO_OFF=60*60*1000;
export default function DisponiveisScreen({motoboy,onLogout}){
  const [online,setOnline]=useState(false);
  const [pedidos,setPedidos]=useState([]);
  const [stats,setStats]=useState({entregas:0,ganhoHoje:0,saldo:0});
  const [avisos,setAvisos]=useState([]);
  const [promos,setPromos]=useState([]);
  const [refreshing,setRefreshing]=useState(false);
  const timer=useRef(null);
  const prevLen=useRef(0);
  useEffect(()=>{
    carregarEstado();
    load();
    pedirLocalizacao();
    const iv=setInterval(load,15000);
    return()=>{clearInterval(iv);if(timer.current)clearTimeout(timer.current);};
  },[]);
  async function carregarEstado(){
    const isOn=await AsyncStorage.getItem('@fd_online');
    const onAt=await AsyncStorage.getItem('@fd_onlineAt');
    if(isOn==='true'&&onAt){
      const elapsed=Date.now()-parseInt(onAt);
      if(elapsed<AUTO_OFF){setOnline(true);timer.current=setTimeout(goOffline,AUTO_OFF-elapsed);}
      else{await AsyncStorage.removeItem('@fd_online');await AsyncStorage.removeItem('@fd_onlineAt');}
    }
  }
  async function pedirLocalizacao(){
    const {status}=await Location.requestForegroundPermissionsAsync();
    if(status!=='granted')return;
    Location.watchPositionAsync({accuracy:Location.Accuracy.Balanced,timeInterval:30000,distanceInterval:50},loc=>{
      fetch(API+'/api/motoboy/location',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:motoboy.id,lat:loc.coords.latitude,lng:loc.coords.longitude})}).catch(()=>{});
    });
  }
  async function load(){
    try{
      const [sRes,pRes,aRes,prRes]=await Promise.all([fetch(API+'/api/motoboy/stats?id='+motoboy.id),fetch(API+'/api/pedidos/disponiveis'),fetch(API+'/api/avisos'),fetch(API+'/api/promocoes?id='+motoboy.id)]);
      if(sRes.ok)setStats(await sRes.json());
      if(pRes.ok){const novos=await pRes.json();if(novos.length>prevLen.current&&prevLen.current>0){Notifications.scheduleNotificationAsync({content:{title:'Novo pedido disponivel!',body:'Toque para ver',sound:true},trigger:null});}prevLen.current=novos.length;setPedidos(novos);}
      if(aRes.ok)setAvisos(await aRes.json());
      if(prRes.ok)setPromos(await prRes.json());
    }catch(e){}
  }
  async function toggleOnline(){
      await fetch(API+'/api/motoboy/online',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:motoboy.id,online:true})});
      await AsyncStorage.setItem('@fd_online','true');
      await AsyncStorage.setItem('@fd_onlineAt',Date.now().toString());
      setOnline(true);
      timer.current=setTimeout(goOffline,AUTO_OFF);
    }else{await goOffline();}
  }
  async function goOffline(){
    await fetch(API+'/api/motoboy/online',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:motoboy.id,online:false})});
    await AsyncStorage.removeItem('@fd_online');
    await AsyncStorage.removeItem('@fd_onlineAt');
    setOnline(false);
    if(timer.current)clearTimeout(timer.current);
  }
  async function aceitar(id){
    try{const r=await fetch(API+'/api/pedidos/aceitar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pedidoId:id,motoboyId:motoboy.id})});const d=await r.json();if(d.success){Alert.alert('Pedido aceito!','Va para Meus Servicos');load();}else Alert.alert('Erro',d.message||'Tente novamente');}catch(e){Alert.alert('Erro','Sem conexao');}
  }
  const onRefresh=async()=>{setRefreshing(true);await load();setRefreshing(false);};
}
const s=StyleSheet.create({c:{flex:1,backgroundColor:'#0f0f0f'},h:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',padding:20,paddingTop:50,backgroundColor:'#1a1a1a'},titulo:{color:'#fff',fontSize:20,fontWeight:'bold'},nome:{color:'#ccc',fontSize:14},id:{color:'#888',fontSize:12},stBtn:{margin:16,padding:14,borderRadius:30,alignItems:'center'},stOn:{backgroundColor:'#1a3a1a',borderWidth:1,borderColor:'#00d26a'},stOff:{backgroundColor:'#2a2a2a',borderWidth:1,borderColor:'#555'},stTxt:{color:'#fff',fontWeight:'600'},stats:{flexDirection:'row',marginHorizontal:16,gap:8,marginBottom:8},sc:{flex:1,backgroundColor:'#1a1a1a',padding:14,borderRadius:12,alignItems:'center',borderWidth:1,borderColor:'#2a2a2a'},sv:{color:'#fff',fontSize:22,fontWeight:'bold'},svg:{color:'#f0c040',fontSize:18,fontWeight:'bold'},sl:{color:'#888',fontSize:10,marginTop:4},av:{margin:16,backgroundColor:'#1a1800',padding:16,borderRadius:12,borderWidth:1,borderColor:'#3a3000'},avt:{color:'#f0c040',fontWeight:'bold',marginBottom:8},avn:{color:'#fff',fontWeight:'600',marginBottom:4},avm:{color:'#ccc',fontSize:13},pr:{margin:16,marginTop:0,backgroundColor:'#0a2a0a',padding:16,borderRadius:12,borderWidth:1,borderColor:'#1a4a1a'},prt:{color:'#888',fontSize:11,letterSpacing:1,marginBottom:12},prn:{color:'#f0c040',fontWeight:'600'},pbg:{height:6,backgroundColor:'#333',borderRadius:3,marginVertical:6},pf:{height:6,backgroundColor:'#00d26a',borderRadius:3},prd:{color:'#ccc',fontSize:12},sec:{color:'#fff',fontWeight:'bold',fontSize:16,marginHorizontal:16,marginBottom:12},v:{color:'#666',textAlign:'center',padding:30},card:{margin:16,marginTop:0,backgroundColor:'#1a1a1a',padding:16,borderRadius:12,borderWidth:1,borderColor:'#2a2a2a',marginBottom:12},cl:{color:'#fff',fontWeight:'bold',fontSize:16,marginBottom:4},ce:{color:'#aaa',fontSize:13,marginBottom:4},cv:{color:'#f0c040',fontWeight:'bold',fontSize:15,marginBottom:12},btn:{backgroundColor:'#ff6b00',padding:12,borderRadius:10,alignItems:'center'},btnt:{color:'#fff',fontWeight:'bold',letterSpacing:1}});