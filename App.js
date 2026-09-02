import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import LoginScreen from './src/screens/LoginScreen';
import MotoboyWebApp from './src/screens/MotoboyWebApp'; import './src/backgroundLocationTask'; import { ensureLocationPermissions } from './src/backgroundLocationTask';

const API_BASE = 'https://flashdrop-backend-production.up.railway.app';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

async function setupNotificationChannelAndCategory() {
    try {
        await Notifications.setNotificationChannelAsync('pedidos_flashdrop_v3', {
            name: 'Novos pedidos',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'novo_pedido_small.mp3',
            vibrationPattern: [0, 250, 250, 250, 250, 250, 250, 250],
            lightColor: '#ff6b00',
            audioAttributes: {
                usage: Notifications.AndroidAudioUsage.ALARM,
            },
            bypassDnd: true,
        });
        await Notifications.setNotificationCategoryAsync('novo_pedido', [
            { identifier: 'aceitar', buttonTitle: 'Aceitar', options: { opensAppToForeground: false } },
            ]);
    } catch (e) {
        console.error('Erro ao configurar canal/categoria de notificacao:', e.message);
    }
}

async function registerForPush(u) {
    try {
        const perm = await Notifications.getPermissionsAsync();
        let finalStatus = perm.status;
        if (finalStatus !== 'granted') {
            const reqPerm = await Notifications.requestPermissionsAsync();
            finalStatus = reqPerm.status;
        }
        if (finalStatus !== 'granted') return;
        await setupNotificationChannelAndCategory();
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: 'ab1269ff-5731-40d4-98ec-b5865a3a3380' });
        const token = tokenData && tokenData.data;
        if (token && u && u.id) {
            await fetch(API_BASE + '/users/' + u.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + u.token },
                body: JSON.stringify({ push_token: token }),
            });
        }
    } catch (ePush) {
        console.error('Erro ao registrar push token:', ePush.message);
    }
}

async function aceitarPedidoViaNotificacao(orderId, u) {
    try {
        const resp = await fetch(API_BASE + '/orders/' + orderId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'aceito',
                t_aceito: new Date().toISOString(),
                motoboy_id: u.id,
                motoboy_name: u.name,
            }),
        });
        let msg = 'Pedido #' + orderId + ' aceito! Va buscar na loja.';
        let ok = resp.ok;
        if (!ok) {
            let errData = {};
            try { errData = await resp.json(); } catch (eJson) {}
            msg = errData.error || ('Nao foi possivel aceitar o pedido #' + orderId + '.');
        }
        await Notifications.scheduleNotificationAsync({
            content: { title: ok ? 'Pedido aceito' : 'Nao foi possivel aceitar', body: msg, sound: 'default' },
            trigger: null,
        });
    } catch (e) {
        console.error('Erro ao aceitar pedido via notificacao:', e.message);
    }
}

async function handleNotificationResponse(response) {
    try {
        const data = (response && response.notification && response.notification.request.content.data) || {};
        const orderId = data.orderId;
        if (response.actionIdentifier === 'aceitar' && orderId) {
            const raw = await AsyncStorage.getItem('flashdrop_user');
            const u = raw ? JSON.parse(raw) : null;
            if (u && u.id) {
                await aceitarPedidoViaNotificacao(orderId, u);
            }
        }
    } catch (e) {
        console.error('Erro ao processar resposta de notificacao:', e.message);
    }
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    AsyncStorage.getItem('flashdrop_user').then((data) => {
        if (data) {
            const u = JSON.parse(data);
            if (u && u.id && u.role === 'motoboy') {
                setUser(u); ensureLocationPermissions(); registerForPush(u);
            }
        }
        setLoading(false);
    }).catch(() => setLoading(false));

          const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    Notifications.getLastNotificationResponseAsync().then((resp) => {
        if (resp) handleNotificationResponse(resp);
    }).catch(() => {});

          return () => { sub.remove(); };
}, []);

const handleLogin = (userData) => {
    setUser(userData); ensureLocationPermissions(); registerForPush(userData);
};

const handleLogout = async () => {
    try { await AsyncStorage.removeItem('flashdrop_user'); } catch (e) {}
    setUser(null);
};

if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
    <ActivityIndicator size="large" color="#ffcc00" />
    </View>
    );
}

if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
}

return <MotoboyWebApp user={user} onLogout={handleLogout} />;
}
