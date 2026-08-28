import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'flashdrop-background-location';
const API_BASE = 'https://flashdrop-backend-production.up.railway.app'; export async function ensureLocationPermissions() { try { const fg = await Location.requestForegroundPermissionsAsync(); if (fg.status !== 'granted') return false; try { await Location.requestBackgroundPermissionsAsync(); } catch (e) {} return true; } catch (e) { console.error('Erro ao solicitar permissoes de localizacao:', e.message); return false; } }

let currentUserId = null;
let currentOrderId = null;

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Erro na task de localizacao em segundo plano:', error.message);
    return;
  }
  if (!data || !currentUserId) return;
  try {
    const { locations } = data;
    const loc = locations && locations[0];
    if (!loc) return;
    await fetch(API_BASE + '/motoboys/' + currentUserId + '/localizacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        order_id: currentOrderId,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar localizacao em segundo plano:', e.message);
  }
});

export async function startBackgroundLocationTracking(userId, orderId) {
  currentUserId = userId || null;
  currentOrderId = orderId || null;
  if (!currentUserId) return false;
  try {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') return false;
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== 'granted') return false;
    const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    if (already) return true;
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 30000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'FlashDrop Motoboy',
        notificationBody: 'Compartilhando sua localizacao durante a entrega',
        notificationColor: '#ff6b00',
      },
    });
    return true;
  } catch (e) {
    console.error('Erro ao iniciar rastreamento em segundo plano:', e.message);
    return false;
  }
}

export async function stopBackgroundLocationTracking() {
  currentUserId = null;
  currentOrderId = null;
  try {
    const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    if (already) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch (e) {
    console.error('Erro ao parar rastreamento em segundo plano:', e.message);
  }
}
