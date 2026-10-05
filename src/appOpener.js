import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { bringAppToFront, canDrawOverlays } from '../modules/flashdrop-native';

// Tarefa que roda quando chega uma notificacao "silenciosa" (sem titulo/texto) vinda do servidor.
// O servidor so envia essa notificacao para motoboys ONLINE e SEM pedido em andamento,
// avisando que apareceu pedido novo. Aqui o app se traz para a frente da tela.
const TASK_ABRIR_APP = 'flashdrop-abrir-app-pedido-novo';

// O formato do payload muda entre Android/iOS e entre mensagens com e sem texto,
// entao procuramos a chave "abrirApp" em qualquer nivel (inclusive dentro de JSON em texto).
function acharDados(obj, nivel) {
  if (obj == null || nivel > 5) return null;
  if (typeof obj === 'string') {
    try { return acharDados(JSON.parse(obj), nivel + 1); } catch (e) { return null; }
  }
  if (typeof obj === 'object') {
    if (Object.prototype.hasOwnProperty.call(obj, 'abrirApp')) return obj;
    const chaves = Object.keys(obj);
    for (let i = 0; i < chaves.length; i++) {
      const r = acharDados(obj[chaves[i]], nivel + 1);
      if (r) return r;
    }
  }
  return null;
}

TaskManager.defineTask(TASK_ABRIR_APP, async ({ data, error }) => {
  if (error) return;
  try {
    const d = acharDados(data, 0);
    if (!d) return;
    const abrir = d.abrirApp === true || d.abrirApp === 'true';
    if (!abrir) return;
    // Sem a permissao "exibir sobre outros apps" o Android bloqueia abrir o app por tras.
    if (!canDrawOverlays()) return;
    bringAppToFront();
  } catch (e) {
    console.error('Erro ao abrir app por notificacao:', e && e.message);
  }
});

export async function registrarTarefaAbrirApp() {
  try {
    await Notifications.registerTaskAsync(TASK_ABRIR_APP);
  } catch (e) {
    console.error('Erro ao registrar tarefa de abrir app:', e && e.message);
  }
}

// Registra ja no carregamento do modulo (necessario para funcionar com o app fechado).
registrarTarefaAbrirApp();
