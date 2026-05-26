import React, { useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const getHTML = (user) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=h1.0,maximum-shcale=1.0">
<title>FlashDrop - Motoboy</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#1a1a1a;color:#fff;min-height:100vh;padding-bottom:80px}
.header{background:#0f0f0f;padding:20px;text-align:center;border-bottom:2px solid #333}
.header h1{font-size:24px;margin-bottom:5px}
.status-badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-top:8px}
.status-badge.online{background:#28a745;color:#fff}
.status-badge.offline{background:#6c757d;color:#fff}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:15px;max-width:600px;margin:0 auto}
.stat-card{background:#2a2a2a;padding:15px;border-radius:12px;text-align:center}
.stat-value{font-size:20px;font-weight:700;color:#ffcc00;margin-bottom:4px}
.stat-label{color:#999;font-size:11px;text-transform:uppercase}
.orders{max-width:600px;margin:0 auto;padding:15px}
.section-title{font-size:18px;font-weight:600;margin-bottom:12px;color:#fff}
.order-card{background:#2a2a2a;border-radius:12px;padding:16px;margin-bottom:12px;border:2px solid transparent}
.order-card.pending{border-color:#ffa500}
.order-card.mine{border-color:#0088cc}
.order-card.done-card{border-color:#28a745;opacity:0.65}
.order-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.order-id{font-size:16px;font-weight:600}
.badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
.badge-pendente{background:#ffa500;color:#000}
.badge-aceito{background:#17a2b8;color:#fff}
.badge-na_loja{background:#6610f2;color:#fff}
.badge-coletado{background:#fd7e14;color:#fff}
.badge-no_cliente{background:#007bff;color:#fff}
.badge-entregue{background:#28a745;color:#fff}
.badge-retornado{background:#ff9500;color:#000}
.info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #3a3a3a;font-size:14px}
.info-row:last-of-type{border:none}
.info-label{color:#999}
.info-value{font-weight:500;color:#fff;text-align:right;max-width:60%}
.progress-steps{display:flex;justify-content:space-between;margin:12px 0;padding:10px;background:#1a1a1a;border-radius:8px}
.step{text-align:center;flex:1;font-size:10px;color:#555}
.step.done{color:#28a745}
.step.active{color:#ffcc00;font-weight:bold}
.timer-box{display:flex;align-items:center;gap:8px;background:#1a1a1a;border:1px solid #ffa500;border-radius:8px;padding:8px 12px;margin:10px 0;font-size:13px;color:#ffa500}
.timer-box.urgent{border-color:#f44336;color:#f44336;animation:pulse 1s infinite}
.timer-box.ok{border-color:#28a745;color:#28a745}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.timer-icon{font-size:16px}
.timer-text{font-weight:600}
.btn-action{width:100%;padding:16px;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:10px;transition:filter 0.15s}
.btn-action:active{filter:brightness(0.88)}
.btn-accept{background:#28a745;color:#fff}
.btn-na_loja{background:#6610f2;color:#fff}
.btn-coletado{background:#fd7e14;color:#fff}
.btn-no_cliente{background:#007bff;color:#fff}
.btn-entregue{background:#28a745;color:#fff}
.btn-cancel{width:100%;padding:12px;border:2px solid #f44336;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:#f44336;transition:filter 0.15s}
.btn-cancel:active{filter:brightness(0.85)}
.btn-nav{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:none;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;margin:3px;transition:opacity .2s}
.btn-nav-gmaps{background:#4285F4;color:#fff}
.btn-nav-waze{background:#33CCFF;color:#000}
.btn-nav-group{margin:8px 0 4px;display:flex;flex-wrap:wrap;gap:4px}
.nav-label{font-size:11px;color:#888;margin-bottom:2px}
.status-badge.online{cursor:pointer;box-shadow:0 0 8px rgba(40,167,69,0.5)}
.status-badge.offline{cursor:pointer}
.confirm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center}
.confirm-box{background:#2a2a2a;border-radius:16px;padding:24px;max-width:320px;width:90%;text-align:center}
.confirm-box h3{color:#fff;margin-bottom:12px;font-size:16px}
.confirm-box p{color:#ccc;font-size:14px;margin-bottom:20px;line-height:1.5}
.confirm-btns{display:flex;gap:12px;justify-content:center}
.confirm-btn-sim{flex:1;padding:12px;background:#27ae60;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer}
.confirm-btn-nao{flex:1;padding:12px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer}
.empty{text-align:center;padding:40px 20px;color:#666}
.penalty-banner{background:#3a1a1a;border:2px solid #f44336;border-radius:12px;padding:14px;margin:0 15px 15px;text-align:center;font-size:13px;color:#f44336;font-weight:600}
.penalty-banner span{display:block;font-size:11px;color:#aaa;margin-top:4px;font-weight:400}
.saque-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px}
.saque-box{background:#1e1e1e;border-radius:16px;padding:24px;width:100%;max-width:360px;border:1px solid #333}
.saque-box h3{color:#ffcc00;margin-bottom:16px;font-size:17px;text-align:center}
.saque-input{width:100%;padding:12px;background:#111;border:1px solid #444;border-radius:10px;color:#fff;font-size:15px;margin-bottom:12px}
.saque-input::placeholder{color:#555}
.btn-saque-submit{width:100%;padding:14px;background:#ffcc00;color:#000;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:8px}
.btn-saque-cancel{width:100%;padding:12px;background:transparent;color:#aaa;border:1px solid #444;border-radius:10px;font-size:14px;cursor:pointer}
.saque-history{margin-top:16px}
.saque-item{background:#111;border-radius:8px;padding:10px;margin-bottom:8px;font-size:13px;border-left:3px solid #555}
.saque-item.pendente{border-color:#ffa500}
.saque-item.aprovado{border-color:#28a745}
.saque-item.recusado{border-color:#f44336}
.btn-pedir-saque{width:100%;padding:13px;background:#1a2a00;border:2px solid #ffcc00;border-radius:12px;color:#ffcc00;font-size:15px;font-weight:700;cursor:pointer;margin:0 0 15px}
.tab-bar{display:flex;background:#111;border-bottom:2px solid #333;position:sticky;top:0;z-index:100}
.tab-btn{flex:1;padding:12px 4px;background:transparent;border:none;color:#888;font-size:13px;font-weight:600;cursor:pointer;border-bottom:3px solid transparent;transition:all .2s;text-align:center}
.tab-btn.active{color:#ffcc00;border-bottom:3px solid #ffcc00;background:#1a1a00}
.tab-panel{display:none}
.tab-panel.active{display:block}
.tab-badge{display:inline-block;background:#f44336;color:#fff;border-radius:10px;font-size:10px;font-weight:700;padding:1px 6px;margin-left:3px;vertical-align:middle}
.logout-btn{position:fixed;bottom:12px;right:12px;background:#333;border:1px solid #555;border-radius:8px;padding:8px 14px;color:#aaa;font-size:12px;font-weight:600;cursor:pointer;z-index:50}
</style>
</head>
<body>
<div class="header" style="position:relative">
<button id="notif-toggle-btn" onclick="notifEnabled=!notifEnabled;this.textContent=notifEnabled?'\uD83D\uDD14':'\uD83D\uDD15';" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.1);color:#ffcc00;border:1px solid #555;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:bold;cursor:pointer;">🔔</button>
<button id="sair-btn" class="logout-btn" onclick="doLogout()">Sair</button>
<h1>FlashDrop Motoboy</h1>
<div id="motoboy-name" style="color:#aaa;font-size:14px">Carregando...</div>
<div id="motoboy-custom-id" style="font-size:12px;color:#ffcc00;font-weight:700;letter-spacing:1px;margin-top:2px"></div>
<span class="status-badge offline" id="status-badge" onclick="toggleOnline()" style="cursor:pointer;user-select:none;" title="Clique para alternar">Offline</span>
</div>
<div class="stats">
<div class="stat-card"><div class="stat-value" id="total-entregas">0</div><div class="stat-label">Entregas</div></div>
<div class="stat-card"><div class="stat-value" id="total-ganhos">R$ 0</div><div class="stat-label">Ganho Hoje</div></div>
<div class="stat-card"><div class="stat-value" id="user-balance">R$ 0</div><div class="stat-label">Saldo</div></div>
</div>
<div id="penalty-banner" class="penalty-banner" style="display:none">&#x1F6AB; Voce esta bloqueado por cancelamento<span id="penalty-timer"></span></div>
<div class="tab-bar">
<button class="tab-btn active" id="tab-btn-available" onclick="switchTab('available')">&#x1F4CB; Disponiveis<span id="tab-badge-available" class="tab-badge" style="display:none">0</span></button>
<button class="tab-btn" id="tab-btn-mine" onclick="switchTab('mine')">&#x1F6F5; Meus Servicos<span id="tab-badge-mine" class="tab-badge" style="display:none">0</span></button>
<button class="tab-btn" id="tab-btn-done" onclick="switchTab('done')">&#x2705; Entregues</button>
<button class="tab-btn" id="tab-btn-saldo" onclick="switchTab('saldo')">&#x1F4B0; Saldo</button>
</div>
<div class="orders">
<div id="avisos-mb-banner" style="display:none;background:#1a1a00;border:1px solid #ffcc00;border-radius:10px;padding:12px;margin-bottom:12px;"></div>
<div id="tab-panel-available" class="tab-panel active"><div id="available-orders"></div></div>
<div id="tab-panel-mine" class="tab-panel"><div id="my-orders"></div></div>
<div id="tab-panel-done" class="tab-panel"><div id="done-orders"></div></div>
<div id="tab-panel-saldo" class="tab-panel">
<button class="btn-pedir-saque" onclick="openSaqueModal()">&#x1F4B8; Solicitar Saque</button>
<div id="indicacao-panel" style="background:#1a1a00;border:1px solid #ffcc00;border-radius:10px;padding:14px;margin:10px 0;display:none">
<div style="font-size:13px;font-weight:700;color:#ffcc00;margin-bottom:10px">&#x1F517; Meu Codigo de Indicacao</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
<div id="mb-ref-code" style="font-size:22px;font-weight:900;color:#fff;letter-spacing:4px;flex:1;text-align:center;background:#222;border-radius:8px;padding:10px">--</div>
<button onclick="copyRefCode()" style="padding:10px 14px;background:#ffcc00;border:none;border-radius:8px;color:#000;font-weight:700;cursor:pointer;font-size:13px">&#x1F4CB;</button>
</div>
<div style="font-size:11px;color:#aaa;text-align:center;margin-bottom:10px">Compartilhe este codigo. Quem usar no cadastro gera comissoes para voce!</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
<div style="background:#222;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#ffcc00" id="mb-total-indicados">0</div><div style="font-size:10px;color:#aaa">Total Indicados</div></div>
<div style="background:#222;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#4caf50" id="mb-total-ganhos">R$ 0,00</div><div style="font-size:10px;color:#aaa">Ganho 30 dias</div></div>
</div>
<div id="mb-indicados-list" style="font-size:12px;color:#888;text-align:center">Nenhum indicado ainda.</div>
</div>
<div class="card" style="margin-top:16px;background:#1e1e1e;border-radius:12px;padding:16px">
<h3 style="color:#ffcc00;margin-bottom:10px;font-size:14px">&#x23F1; Saldo - Ultimas 24h</h3>
<div id="mb-wallet-events-list"><p style="color:#aaa;font-size:12px">Carregando...</p></div>
</div>
</div>
</div>
<script>
function doLogout() {
  try { localStorage.removeItem('flashdrop_user'); } catch(e) {}
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage('logout');
  }
}

function showConfirm(title, msg, onSim, onNao) {
  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.id = 'confirm-overlay';
  overlay.innerHTML = '<div class="confirm-box"><h3>' + title + '</h3><p>' + msg + '</p><div class="confirm-btns"><button class="confirm-btn-sim" id="confirm-sim">&#x2705; Sim</button><button class="confirm-btn-nao" id="confirm-nao">&#x274C; Nao</button></div></div>';
  document.body.appendChild(overlay);
  document.getElementById('confirm-sim').onclick = function() { overlay.remove(); if(onSim) onSim(); };
  document.getElementById('confirm-nao').onclick = function() { overlay.remove(); if(onNao) onNao(); };
}

function openNav(app, address) {
  var encoded = encodeURIComponent(address);
  var url = app === 'waze' ? 'https://waze.com/ul?q=' + encoded + '&navigate=yes' : 'https://www.google.com/maps/dir/?api=1&destination=' + encoded;
  window.open(url, '_blank');
}

function makeNavBtns(label, address) {
  if (!address) return null;
  var wrap = document.createElement('div'); wrap.style = 'margin:6px 0 2px';
  var lbl = document.createElement('div'); lbl.className = 'nav-label'; lbl.innerHTML = '&#x1F5FA; Navegar ate ' + label + ':';
  var gmaps = document.createElement('button'); gmaps.className = 'btn-nav btn-nav-gmaps'; gmaps.innerHTML = '&#x1F4CD; Google Maps'; gmaps.onclick = function() { openNav('gmaps', address); };
  var waze = document.createElement('button'); waze.className = 'btn-nav btn-nav-waze'; waze.innerHTML = '&#x1F697; Waze'; waze.onclick = function() { openNav('waze', address); };
  var grp = document.createElement('div'); grp.className = 'btn-nav-group';
  grp.appendChild(gmaps); grp.appendChild(waze);
  wrap.appendChild(lbl); wrap.appendChild(grp);
  return wrap;
}

var API = "https://flashdrop-backend-production.up.railway.app";
var tg = { showAlert: function(m){ alert(m); }, expand: function(){} };

var user = ${JSON.stringify(user)};
try { localStorage.setItem("flashdrop_user", JSON.stringify(user)); } catch(e) {}
if (!user || !user.id) { doLogout(); }

var activeOrders = [];
var allOrdersCache = [];
var allUsersCache = [];
var activeTimers = {};
var _autoOfflineTimer = null;
var _onlineAt = null;
        var notifEnabled = true;
        var _prevOrderIds = new Set();
var AUTO_OFFLINE_MS = 60 * 60 * 1000;
var TIMER_DURATION = 15 * 60;

var STATUS_LABELS = { pendente:"Aguardando", aceito:"Aceito", na_loja:"Na Loja", coletado:"A Entregar", no_cliente:"No Cliente", entregue:"Entregue", retornado:"Retornado", cancelado:"Cancelado" };

var ACTION_MAP = {
  pendente: { label:"Aceitar", icon:"&#x2705;", cls:"btn-accept", next:"aceito", msg:"Entrega aceita! Va buscar o pedido na loja.", startTimer:true },
  aceito: { label:"Cheguei na Loja", icon:"&#x1F3EA;", cls:"btn-na_loja", next:"na_loja", msg:"Otimo! Colete o pedido.", stopTimer:true },
  na_loja: { label:"Coletei o Pedido", icon:"&#x1F4E6;", cls:"btn-coletado", next:"coletado", msg:"Pedido coletado! Va entregar ao cliente." },
  coletado: { label:"Cheguei no Cliente", icon:"&#x1F3E0;", cls:"btn-no_cliente", next:"no_cliente", msg:"Chegou no cliente! Conclua a entrega." },
  no_cliente: { label:"Entreguei", icon:"&#x1F389;", cls:"btn-entregue", next:"entregue", msg:"Entrega concluida! Saldo atualizado." }
};

function startTimer(orderId, elapsedSeconds) {
  if (activeTimers[orderId]) clearInterval(activeTimers[orderId].interval);
  var remaining = TIMER_DURATION - (elapsedSeconds || 0);
  activeTimers[orderId] = { remaining: remaining };
  activeTimers[orderId].interval = setInterval(function() {
    activeTimers[orderId].remaining -= 1;
    updateTimerEl(orderId);
    if (activeTimers[orderId].remaining <= 0) { clearInterval(activeTimers[orderId].interval); alert("Atencao! Tempo de 15 min atingido para o pedido #" + orderId + ". Chegue logo!"); }
  }, 1000);
}

function stopTimer(orderId) {
  if (activeTimers[orderId]) { clearInterval(activeTimers[orderId].interval); delete activeTimers[orderId]; }
}

function updateTimerEl(orderId) {
  var el = document.getElementById("timer-" + orderId);
  if (!el) return;
  var rem = activeTimers[orderId] ? activeTimers[orderId].remaining : 0;
  var mins = Math.floor(Math.max(rem, 0) / 60);
  var secs = Math.max(rem, 0) % 60;
  el.querySelector(".timer-text").textContent = rem <= 0 ? "Tempo esgotado! Chegue logo na loja." : ("Chegue na loja em " + mins + ":" + (secs < 10 ? "0" : "") + secs);
  el.className = "timer-box " + (rem <= 120 ? "urgent" : rem <= 300 ? "" : "ok");
}

function updateStatusUI() {
  var badge = document.getElementById("status-badge");
  if (user.online) { badge.innerHTML = "&#x1F7E2; Online - toque para sair"; badge.className = "status-badge online"; }
  else { badge.innerHTML = "&#x26AB; Offline - toque para entrar"; badge.className = "status-badge offline"; }
  var sairBtn = document.getElementById('sair-btn'); if(sairBtn) sairBtn.style.display = user.online ? 'none' : 'block';
}

async function toggleOnline() {
  if (user.online && activeOrders.length > 0) { alert("Voce nao pode ficar Offline com pedido em aberto!"); return; }
  var newOnline = !user.online;
  try {
    var resp = await fetch(API + "/users/" + user.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ online: newOnline }) });
    if (resp.ok) {
      user.online = newOnline;
      var sairBtn2 = document.getElementById('sair-btn'); if(sairBtn2) sairBtn2.style.display = newOnline ? 'none' : 'block';
      if (newOnline) { _onlineAt = Date.now(); localStorage.setItem('_fd_onlineAt', _onlineAt); _autoOfflineTimer = setTimeout(autoOfflineCheck, AUTO_OFFLINE_MS); }
      else { _onlineAt = null; localStorage.removeItem('_fd_onlineAt'); if (_autoOfflineTimer) { clearTimeout(_autoOfflineTimer); _autoOfflineTimer = null; } }
      syncUser();
    }
  } catch(e) { alert("Erro ao atualizar status."); }
}

async function autoOfflineCheck() {
  if (!user.online || !_onlineAt) return;
  var elapsed = Date.now() - _onlineAt;
  if (elapsed < AUTO_OFFLINE_MS) { _autoOfflineTimer = setTimeout(autoOfflineCheck, AUTO_OFFLINE_MS - elapsed); return; }
  if (activeOrders && activeOrders.length > 0) { _autoOfflineTimer = setTimeout(autoOfflineCheck, 5 * 60 * 1000); return; }
  try {
    var resp2 = await fetch(API + "/users/" + user.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ online: false }) });
    if (resp2.ok) { user.online = false; _onlineAt = null; localStorage.removeItem('_fd_onlineAt'); _autoOfflineTimer = null; syncUser(); alert("Voce foi colocado Offline automaticamente apos 60 minutos."); }
  } catch(e2) {}
}

async function syncUser() {
  try {
    var r = await fetch(API + "/users/" + user.id);
    var u = await r.json();
    if (u && u.id) {
      user = Object.assign({}, user, u);
      localStorage.setItem("flashdrop_user", JSON.stringify(user));
      document.getElementById("user-balance").textContent = "R$ " + parseFloat(user.balance || 0).toFixed(2);
      document.getElementById("motoboy-name").innerHTML = user.name;
      var cidEl = document.getElementById("motoboy-custom-id"); if(cidEl && user.custom_id) cidEl.innerHTML = "&#x1FAA6; " + user.custom_id;
      updateStatusUI();
      updatePenaltyBanner(u.blocked_until);
    }
  } catch(e) {}
}

function updatePenaltyBanner(blockedUntil) {
  var banner = document.getElementById("penalty-banner");
  var timerEl = document.getElementById("penalty-timer");
  if (!banner) return;
  var bu = parseInt(blockedUntil) || 0;
  if (bu > Date.now()) {
    var remaining = Math.ceil((bu - Date.now()) / 1000);
    var mins = Math.floor(remaining / 60); var secs = remaining % 60;
    timerEl.textContent = "Aguarde " + mins + ":" + (secs < 10 ? "0" : "") + secs + " para aceitar novos pedidos";
    banner.style.display = "block";
  } else { banner.style.display = "none"; }
}

function makeInfoRow(label, value, highlight) {
  var row = document.createElement("div"); row.className = "info-row";
  var l = document.createElement("span"); l.className = "info-label"; l.innerHTML = label;
  var v = document.createElement("span"); v.className = "info-value"; v.innerHTML = value;
  if (highlight) v.style.color = "#ffcc00";
  row.appendChild(l); row.appendChild(v);
  return row;
}

function makeProgressEl(status) {
  var steps = ["aceito","na_loja","coletado","no_cliente","entregue"];
  var idx = steps.indexOf(status);
  var wrap = document.createElement("div"); wrap.className = "progress-steps";
  steps.forEach(function(s, i) {
    var d = document.createElement("div");
    d.className = "step " + (i < idx ? "done" : i === idx ? "active" : "");
    d.textContent = STATUS_LABELS[s];
    wrap.appendChild(d);
  });
  return wrap;
}

function makeTimerEl(orderId, tAceito) {
  var elapsed = tAceito ? Math.floor((Date.now() - new Date(tAceito).getTime()) / 1000) : 0;
  var remaining = TIMER_DURATION - elapsed;
  var rem = Math.max(remaining, 0);
  var mins = Math.floor(rem / 60); var secs = rem % 60;
  var cls = remaining <= 120 ? "urgent" : remaining <= 300 ? "" : "ok";
  var txt = remaining <= 0 ? "Tempo esgotado! Chegue logo na loja." : ("Chegue na loja em " + mins + ":" + (secs < 10 ? "0" : "") + secs);
  var box = document.createElement("div"); box.className = "timer-box " + cls; box.id = "timer-" + orderId;
  var icon = document.createElement("span"); icon.className = "timer-icon"; icon.innerHTML = "&#x23F1;";
  var text = document.createElement("span"); text.className = "timer-text"; text.textContent = txt;
  box.appendChild(icon); box.appendChild(text);
  return box;
}

function fmtDt(ts) {
  if (!ts) return null;
  var d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
}

function buildTimeline(o) {
  var events = [
    { label: 'Pedido criado', icon: '&#x1F195;', ts: o.created_at },
    { label: 'Aceito', icon: '&#x2705;', ts: o.t_aceito },
    { label: 'Chegou na loja', icon: '&#x1F3EA;', ts: o.t_na_loja },
    { label: 'Pedido coletado', icon: '&#x1F4E6;', ts: o.t_coletado },
    { label: 'Chegou no cliente', icon: '&#x1F3E0;', ts: o.t_no_cliente },
    { label: 'Entregue', icon: '&#x1F389;', ts: o.t_entregue },
    { label: 'Retornado', icon: '&#x1F504;', ts: o.t_retornado }
  ].filter(function(e){ return !!e.ts; });
  if (events.length === 0) return null;
  var wrap = document.createElement('div');
  wrap.style.cssText = 'margin-top:10px;border-top:1px solid #3a3a3a;padding-top:8px';
  var title = document.createElement('div');
  title.style.cssText = 'font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px';
  title.textContent = 'Historico';
  wrap.appendChild(title);
  events.forEach(function(e) {
    var row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:12px';
    var icon = document.createElement('span'); icon.style.fontSize = '13px'; icon.innerHTML = e.icon;
    var label = document.createElement('span'); label.style.cssText = 'color:#aaa;flex:1'; label.textContent = e.label;
    var time = document.createElement('span'); time.style.cssText = 'color:#ffcc00;font-weight:600;white-space:nowrap;font-size:11px'; time.textContent = fmtDt(e.ts);
    row.appendChild(icon); row.appendChild(label); row.appendChild(time); wrap.appendChild(row);
  });
  return wrap;
}

function makeOrderCard(o, cardType) {
  var card = document.createElement("div"); card.className = "order-card " + cardType;
  var header = document.createElement("div"); header.className = "order-header";
  var idEl = document.createElement("div"); idEl.className = "order-id"; idEl.textContent = "Pedido #" + o.id;
  var badgeEl = document.createElement("span");
  if (cardType === "pending") { badgeEl.className = "badge badge-pendente"; badgeEl.textContent = "Disponivel"; }
  else { badgeEl.className = "badge badge-" + o.status; badgeEl.textContent = STATUS_LABELS[o.status] || o.status; }
  header.appendChild(idEl); header.appendChild(badgeEl); card.appendChild(header);

  if (cardType === "mine") {
    card.appendChild(makeProgressEl(o.status));
    if (o.status === "aceito") {
      card.appendChild(makeTimerEl(o.id, o.t_aceito));
      if (!activeTimers[o.id]) { var el = o.t_aceito ? Math.floor((Date.now() - new Date(o.t_aceito).getTime()) / 1000) : 0; startTimer(o.id, el); }
    }
  }

  var _lojaUser = allUsersCache.find(function(u){ return u.username === o.loja_user; }) || {};
  var lojaDisplay = o.loja_name || _lojaUser.name || o.loja_user || '-';
  var lojaId = _lojaUser.custom_id || '';
  card.appendChild(makeInfoRow("&#x1F3EA; Loja", lojaDisplay + (lojaId ? ' - ' + lojaId : '')));

  if (o.endereco_coleta) {
    card.appendChild(makeInfoRow("&#x1F4E6; Coleta", o.endereco_coleta + (o.complemento_coleta ? " - " + o.complemento_coleta : "")));
    if (cardType === "mine") { var navColeta = makeNavBtns("Coleta", o.endereco_coleta); if (navColeta) card.appendChild(navColeta); }
  }

  var clienteVisivel = (o.status === "coletado" || o.status === "no_cliente");
  if (clienteVisivel) {
    if (o.nome_cliente) card.appendChild(makeInfoRow("&#x1F464; Cliente", o.nome_cliente));
    if (o.telefone_cliente) card.appendChild(makeInfoRow("&#x1F4F1; Tel Cliente", o.telefone_cliente));
    if (o.endereco_entrega) {
      card.appendChild(makeInfoRow("&#x1F4CD; Entrega", o.endereco_entrega + (o.complemento_entrega ? " - " + o.complemento_entrega : "")));
      var navEntrega = makeNavBtns("Entrega", o.endereco_entrega);
      if (navEntrega) card.appendChild(navEntrega);
      if (o.tipo_pagamento === "dinheiro") {
        var valorPedido = parseFloat(o.valor_pedido || 0); var valorEntrega = parseFloat(o.valor_total || 0); var totalCobrar = valorPedido + valorEntrega;
        var cobrarDiv = document.createElement("div"); cobrarDiv.style.cssText = "background:#1a2a00;border:2px solid #ffcc00;border-radius:10px;padding:12px;margin:10px 0;text-align:center;";
        cobrarDiv.innerHTML = "<div style='font-size:11px;color:#ffcc00;font-weight:700;text-transform:uppercase;margin-bottom:4px;'>&#x1F4B5; Cobrar do Cliente</div><div style='font-size:22px;font-weight:900;color:#ffcc00;'>R$ " + totalCobrar.toFixed(2) + "</div><div style='font-size:11px;color:#aaa;margin-top:4px;'>Produto: R$ " + valorPedido.toFixed(2) + " + Entrega: R$ " + valorEntrega.toFixed(2) + "</div>";
        card.appendChild(cobrarDiv);
      }
    }
  } else if (o.status === "entregue") {
    var privDiv = document.createElement("div"); privDiv.style = "font-size:11px;color:#666;font-style:italic;margin:4px 0;"; privDiv.innerHTML = "&#x1F512; Dados do cliente ocultados por privacidade."; card.appendChild(privDiv);
    if (o.endereco_entrega) card.appendChild(makeInfoRow("&#x1F4CD; Entrega", o.endereco_entrega));
  } else {
    if (o.endereco_entrega) card.appendChild(makeInfoRow("&#x1F4CD; Entrega", o.endereco_entrega));
    var privDiv2 = document.createElement("div"); privDiv2.style = "font-size:11px;color:#ff9500;font-style:italic;margin:4px 0;"; privDiv2.innerHTML = "&#x1F512; Dados do cliente liberados ao coletar."; card.appendChild(privDiv2);
  }

  if (cardType === "mine" && o.telefone_loja) card.appendChild(makeInfoRow("&#x1F4DE; Tel Loja", o.telefone_loja));

  var vMotoboy = parseFloat(o.valor_motoboy || 0);
  var isDinheiro = o.tipo_pagamento === "dinheiro";
  card.appendChild(makeInfoRow(isDinheiro ? "&#x1F4B0; Ganho Liquido" : "&#x1F4B0; Ganho", "R$ " + vMotoboy.toFixed(2), true));

  if (cardType === "mine" && isDinheiro) {
              var valorProd = parseFloat(o.valor_pedido || 0);
              var cashBanner = document.createElement("div");
              cashBanner.style.cssText = "background:#1a1500;border:2px solid #ffa500;border-radius:10px;padding:12px;margin:10px 0;";
              cashBanner.innerHTML = "<div style='font-size:13px;color:#ffa500;font-weight:700;'>&#x1F4B5; Dinheiro: R$ " + valorProd.toFixed(2) + " do produto ser\u00e1 debitado do seu saldo (valor que voc\u00ea cobrou da loja).</div>";
              card.appendChild(cashBanner);
              if (!o.pagou_restaurante) {
                var btnPagar = document.createElement("button");
                btnPagar.className = "btn-action btn-accept";
                btnPagar.style.marginTop = "8px";
                btnPagar.innerHTML = "&#x1F3C3; Pagar ao Restaurante";
                (function(oid) {
                  btnPagar.addEventListener("click", async function() {
                    try {
                      var infoR = await fetch(API + "/orders/" + oid + "/pagar-restaurante/info");
                      var info = infoR.ok ? await infoR.json() : {};
                      var maxVal = parseFloat(info.max_valor || 0);
                      // Build modal overlay
                      var overlay = document.createElement("div");
                      overlay.id = "pagar-rest-overlay";
                      overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;";
                      overlay.innerHTML = "<div style='background:#1e1e2e;border:2px solid #4caf50;border-radius:16px;padding:24px;width:85%;max-width:360px;'>" +
                        "<div style='font-size:18px;font-weight:700;color:#4caf50;margin-bottom:8px;'>&#x1F4B8; Pagar ao Restaurante</div>" +
                        "<div style='font-size:13px;color:#ccc;margin-bottom:16px;'>Valor maximo disponivel: <strong style=\'color:#fff;\'>R$ " + maxVal.toFixed(2) + "</strong></div>" +
                        "<input id='pagar-rest-valor' type='number' step='0.01' min='0.01' max='" + maxVal + "' placeholder='Valor a pagar (R$)' style='width:100%;box-sizing:border-box;padding:12px;background:#2a2a3e;border:1px solid #4caf50;border-radius:8px;color:#fff;font-size:15px;margin-bottom:12px;outline:none;' />" +
                        "<button id='pagar-rest-confirm' style='width:100%;padding:14px;background:#4caf50;border:none;border-radius:8px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:8px;'>Confirmar Pagamento</button>" +
                        "<button id='pagar-rest-cancel' style='width:100%;padding:12px;background:#333;border:1px solid #555;border-radius:8px;color:#ccc;font-size:14px;cursor:pointer;'>Cancelar</button>" +
                        "</div>";
                      document.body.appendChild(overlay);
                      document.getElementById("pagar-rest-cancel").addEventListener("click", function() { overlay.remove(); });
                      document.getElementById("pagar-rest-confirm").addEventListener("click", async function() {
                        var val = parseFloat(document.getElementById("pagar-rest-valor").value);
                        if (!val || val <= 0) { alert("Informe um valor v\u00e1lido."); return; }
                        if (val > maxVal) { alert("Valor maior que o m\u00e1ximo dispon\u00edvel."); return; }
                        try {
                          var pr = await fetch(API + "/orders/" + oid + "/pagar-restaurante", {
                            method: "POST",
                            headers: {"Content-Type":"application/json"},
                            body: JSON.stringify({ motoboy_id: user.id, valor: val })
                          });
                          if (pr.ok) { overlay.remove(); alert("Pagamento registrado!"); await loadOrders(); }
                          else { alert("Erro ao registrar pagamento."); }
                        } catch(e2) { alert("Erro: " + e2.message); }
                      });
                    } catch(e) { alert("Erro ao buscar informa\u00e7\u00f5es: " + e.message); }
                  });
                })(o.id);
                card.appendChild(btnPagar);
              } else {
                var paidDiv = document.createElement("div");
                paidDiv.style.cssText = "text-align:center;color:#28a745;font-weight:600;font-size:13px;margin:8px 0;padding:10px;background:#0a1a0a;border-radius:8px;";
                paidDiv.innerHTML = "&#x2705; Pagamento ao restaurante confirmado";
                card.appendChild(paidDiv);
              }
            }
            var tl = buildTimeline(o);
  if (tl) card.appendChild(tl);

  var actionKey = cardType === "pending" ? "pendente" : o.status;
  var action = ACTION_MAP[actionKey];
  if (action && cardType !== "done-card") {
    var btn = document.createElement("button"); btn.className = "btn-action " + action.cls;
    btn.innerHTML = action.icon + " " + action.label;
    (function(oid, akey, alabel) {
      btn.addEventListener("click", function() {
        showConfirm(alabel, "Confirmar acao: <strong>" + alabel + "</strong>?", function() { doAction(oid, akey); });
      });
    })(o.id, actionKey, action.label);
    card.appendChild(btn);
  }

  if (cardType === "mine" && (o.status === "aceito" || o.status === "na_loja")) {
    var cancelBtn = document.createElement("button"); cancelBtn.className = "btn-cancel"; cancelBtn.innerHTML = "&#x274C; Cancelar Entrega";
    (function(oid) { cancelBtn.addEventListener("click", function() { cancelOrder(oid); }); })(o.id);
    card.appendChild(cancelBtn);
  }
  return card;
}

var _activeTab = 'available';
function switchTab(tab) {
  _activeTab = tab;
  ['available','mine','done','saldo'].forEach(function(t) {
    var btn = document.getElementById('tab-btn-' + t); var panel = document.getElementById('tab-panel-' + t);
    if (btn) btn.className = 'tab-btn' + (t === tab ? ' active' : '');
    if (panel) panel.className = 'tab-panel' + (t === tab ? ' active' : '');
  });
}

function updateTabBadge(id, count) {
  var el = document.getElementById('tab-badge-' + id); if (!el) return;
  if (count > 0) { el.textContent = count; el.style.display = 'inline-block'; } else { el.style.display = 'none'; }
}

async       function playBeep() {
        try {
          var ctx = new (window.AudioContext || window.webkitAudioContext)();
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 5);
        } catch(e) {}
      }

      async function loadOrders() {
  try {
    var r = await fetch(API + "/orders");
    var orders = await r.json();
    allOrdersCache = orders;
        // New order notification detection
        var _newOrderIds = allOrdersCache.map(function(o){return o.id||o._id||o.orderId||'';});
        var _hasNew = _newOrderIds.some(function(id){return id && !_prevOrderIds.has(id);});
        var _hasNewOrders = allOrdersCache.some(function(o){ var oid = String(o.id||o._id||o.orderId||""); return oid && !_prevOrderIds.has(oid); }); if(_hasNewOrders && notifEnabled && _prevOrderIds.size > 0) { playBeep(); }
        _prevOrderIds = new Set(_newOrderIds.filter(Boolean));
    try { var ru = await fetch(API + "/users"); allUsersCache = await ru.json(); } catch(e2) {}
    var available = orders.filter(function(o) { return o.status === "pendente" && !o.motoboy_id; });
    var mine = orders.filter(function(o) { return String(o.motoboy_id) === String(user.id); });
    var active = mine.filter(function(o) { return o.status !== "entregue" && o.status !== "retornado" && o.status !== "cancelado"; });
    var done = mine.filter(function(o) { return o.status === "entregue" || o.status === "retornado"; });
    activeOrders = active;

    var avDiv = document.getElementById("available-orders"); avDiv.innerHTML = "";
    var doneDiv = document.getElementById("done-orders"); doneDiv.innerHTML = "";
    if (available.length === 0) { avDiv.innerHTML = '<div class="empty">Nenhum pedido disponivel</div>'; }
    else { available.forEach(function(o) { avDiv.appendChild(makeOrderCard(o, "pending")); }); }

    var myDiv = document.getElementById("my-orders"); myDiv.innerHTML = "";
    if (active.length === 0) { myDiv.innerHTML = '<div class="empty">Nenhuma entrega ativa</div>'; }
    else {
      active.forEach(function(o) { myDiv.appendChild(makeOrderCard(o, "mine")); });
      Object.keys(activeTimers).forEach(function(tid) {
        var still = active.find(function(o) { return String(o.id) === tid && o.status === "aceito"; });
        if (!still) stopTimer(tid);
      });
    }

    if (done.length === 0) { doneDiv.innerHTML = '<div class="empty">Nenhuma entrega concluida hoje</div>'; }
    else {
      var titleDone = document.createElement("div"); titleDone.className = "section-title"; titleDone.style.cssText = "margin-top:16px;color:#aaa;font-size:14px"; titleDone.textContent = "Concluidas hoje";
      doneDiv.appendChild(titleDone);
      done.forEach(function(o) { doneDiv.appendChild(makeOrderCard(o, "done-card")); });
    }

    document.getElementById("total-entregas").textContent = done.length;
    var hoje = new Date().toISOString().slice(0, 10);
    var doneHoje = done.filter(function(o) { return o.created_at && o.created_at.slice(0,10) === hoje; });
    var totalGanhos = doneHoje.reduce(function(s, o) { return s + parseFloat(o.valor_motoboy || 0); }, 0);
    document.getElementById("total-ganhos").textContent = "R$ " + totalGanhos.toFixed(2);
    updateTabBadge('available', available.length);
    updateTabBadge('mine', active.length);
  } catch(e) { console.error("loadOrders error:", e); }
}

async function doAction(orderId, currentStatus) {
  var action = ACTION_MAP[currentStatus];
  if (!action) return;
  if (currentStatus === "pendente" && !user.online) { alert("Voce precisa estar Online para aceitar pedidos!"); return; }
  var codigoDigitado = null;
  if (action.next === "entregue") {
    codigoDigitado = prompt("CODIGO DE ENTREGA\\n\\nDigite o codigo de 4 digitos que o cliente informou:");
    if (codigoDigitado === null) return;
    codigoDigitado = codigoDigitado.trim();
    if (!codigoDigitado) { alert("O codigo de entrega e obrigatorio para finalizar."); return; }
  }
  if (action.next === "na_loja") {
    var geoPassed = false;
    try {
      var geoBtn = document.querySelector('.btn-na_loja');
      if(geoBtn){ geoBtn.disabled = true; geoBtn.textContent = "Verificando localizacao..."; }
      const pos = await new Promise(function(resolve, reject) { navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, enableHighAccuracy: true }); });
      const verResp = await fetch(API + "/orders/" + orderId + "/verificar-na-loja", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }) });
      const verData = await verResp.json();
      if (!verData.ok) { alert(verData.error || "Voce esta longe da loja."); if(geoBtn){ geoBtn.disabled = false; geoBtn.textContent = action.icon + " " + action.label; } return; }
      geoPassed = true;
      if(geoBtn){ geoBtn.disabled = false; geoBtn.textContent = action.icon + " " + action.label; }
    } catch(geoErr) {
      var geoBtn2 = document.querySelector('.btn-na_loja');
      if (geoErr.code === 1) { var continuar = confirm("Permissao de localizacao negada.\\nDeseja registrar a chegada mesmo assim?"); if (!continuar) { if(geoBtn2){ geoBtn2.disabled = false; geoBtn2.textContent = action.icon + " " + action.label; } return; } }
      geoPassed = true;
      if(geoBtn2){ geoBtn2.disabled = false; geoBtn2.textContent = action.icon + " " + action.label; }
    }
    if (!geoPassed) return;
  }
  try {
    var update = { status: action.next };
    var tsMap = { aceito:"t_aceito", na_loja:"t_na_loja", coletado:"t_coletado", no_cliente:"t_no_cliente", entregue:"t_entregue" };
    if (tsMap[action.next]) update[tsMap[action.next]] = new Date().toISOString();
    if (currentStatus === "pendente") { update.motoboy_id = user.id; update.motoboy_name = user.name; }
    if (action.next === "entregue" && codigoDigitado) update.observacao_entrega = codigoDigitado;
    var orderResp = await fetch(API + "/orders/" + orderId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    if (orderResp.status === 403) { var errData = await orderResp.json(); alert(errData.error || "Acao nao permitida."); return; }
    if (orderResp.status === 400) { alert("Codigo de entrega incorreto. Verifique com o cliente."); return; }
    if (!orderResp.ok) throw new Error("Erro ao atualizar pedido");
    if (action.startTimer) startTimer(orderId, 0);
    if (action.stopTimer) stopTimer(orderId);
    alert(action.msg);
    await loadOrders();
    await syncUser();
  } catch(e) { alert("Erro: " + e.message); }
}

function cancelOrder(orderId) {
  showConfirm("ATENCAO - PENALIDADE", "Se cancelar voce ficara BLOQUEADO por 10 minutos e nao podera aceitar novos pedidos. Deseja continuar?", async function() {
    try {
      var resp = await fetch(API + "/orders/" + orderId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "pendente", motoboy_id: null, motoboy_name: null, t_aceito: null }) });
      if (!resp.ok) { var err = await resp.json(); alert(err.error || "Erro ao cancelar."); return; }
      stopTimer(orderId);
      alert("Entrega cancelada. Voce esta bloqueado por 10 minutos.");
      await loadOrders(); await syncUser();
    } catch(e) { alert("Erro ao cancelar: " + e.message); }
  });
}

async function openSaqueModal() {
  await syncUser();
  document.getElementById('saque-saldo-info').textContent = 'Seu saldo atual: R$ ' + parseFloat(user.balance || 0).toFixed(2);
  document.getElementById('saque-valor').value = '';
  document.getElementById('saque-pix').value = user.pix_key || '';
  document.getElementById('saque-modal').style.display = 'flex';
  await loadSaqueHistory();
}
function closeSaqueModal() { document.getElementById('saque-modal').style.display = 'none'; }

async function loadSaqueHistory() {
  var listEl = document.getElementById('saque-history-list');
  try {
    var r = await fetch(API + '/withdrawals/motoboy/' + user.id);
    var items = await r.json();
    if (!items || items.length === 0) { listEl.innerHTML = '<div style="color:#555;font-size:12px;text-align:center;padding:10px">Nenhum saque solicitado.</div>'; return; }
    var statusLabel = { pendente: '&#x23F3; Pendente', aprovado: '&#x2705; Aprovado', recusado: '&#x274C; Recusado' };
    listEl.innerHTML = items.map(function(w) {
      var dt = new Date(w.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(w.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
      return '<div class="saque-item ' + w.status + '"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong style="color:#fff">R$ ' + parseFloat(w.valor).toFixed(2) + '</strong><span style="color:' + (w.status==='aprovado'?'#28a745':w.status==='recusado'?'#f44336':'#ffa500') + ';font-weight:600">' + (statusLabel[w.status]||w.status) + '</span></div><div style="color:#888">PIX: ' + w.pix_key + '</div><div style="color:#666;font-size:11px;margin-top:3px">' + dt + '</div>' + (w.obs ? '<div style="color:#aaa;font-size:11px;margin-top:3px">Obs: ' + w.obs + '</div>' : '') + '</div>';
    }).join('');
  } catch(e) { listEl.innerHTML = '<div style="color:#f44336;font-size:12px">Erro ao carregar historico.</div>'; }
}

async function submitSaque() {
  var valor = parseFloat(document.getElementById('saque-valor').value);
  var pixKey = document.getElementById('saque-pix').value.trim();
  if (!valor || valor <= 0) { alert('Informe um valor valido.'); return; }
  if (!pixKey) { alert('Informe a chave PIX.'); return; }
  if (valor > parseFloat(user.balance || 0)) { alert('Saldo insuficiente. Seu saldo: R$ ' + parseFloat(user.balance||0).toFixed(2)); return; }
  try {
    var r = await fetch(API + '/withdrawals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motoboy_id: user.id, motoboy_name: user.name, valor: valor, pix_key: pixKey }) });
    var data = await r.json();
    if (!r.ok) { alert('Erro: ' + (data.error || 'Tente novamente.')); return; }
    alert('Saque de R$ ' + valor.toFixed(2) + ' solicitado! Aguarde aprovacao.');
    document.getElementById('saque-valor').value = '';
    await loadSaqueHistory();
  } catch(e) { alert('Erro ao solicitar saque: ' + e.message); }
}

async function loadAvisosMotboy() {
  try {
    var r = await fetch(API+'/notices?target=motoboy'); var list = await r.json();
    var banner = document.getElementById('avisos-mb-banner');
    if (!list || list.length === 0) { banner.style.display='none'; return; }
    banner.style.display='block';
    banner.innerHTML = '<div style="font-size:11px;color:#ffcc00;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">&#x1F4E2; Avisos do Admin</div>' + list.map(function(n){return '<div style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2a2a00"><div style="font-weight:600;color:#fff;font-size:13px;margin-bottom:2px">'+n.title+'</div><div style="color:#ccc;font-size:12px;line-height:1.4">'+n.body+'</div></div>';}).join('');
  } catch(e) {}
}

async function loadMbIndicacao() {
  try {
    var codeResp = await fetch(API + '/referral-code/' + user.id); var codeData = await codeResp.json();
    if (codeData.code) { document.getElementById('mb-ref-code').textContent = codeData.code; document.getElementById('indicacao-panel').style.display = 'block'; window._mbRefCode = codeData.code; }
    var refResp = await fetch(API + '/referrals/user/' + user.id); var refData = await refResp.json();
    document.getElementById('mb-total-indicados').textContent = (refData.referred || []).length;
    document.getElementById('mb-total-ganhos').textContent = 'R$ ' + parseFloat(refData.total_ganhos || 0).toFixed(2).replace('.',',');
    var listEl = document.getElementById('mb-indicados-list');
    if (!refData.referred || !refData.referred.length) { listEl.textContent = 'Nenhum indicado ainda.'; }
    else { listEl.innerHTML = refData.referred.map(function(r) { var role = r.referred_role === 'loja' ? '&#x1F3EA;' : '&#x1F6F5;'; return '<div style="background:#222;border-radius:7px;padding:8px 10px;margin-bottom:6px">' + role + ' <strong style="color:#fff">' + r.referred_name + '</strong>' + (r.total_ganho > 0 ? ' <span style="float:right;color:#ffcc00;font-size:11px">+R$ ' + parseFloat(r.total_ganho).toFixed(2) + '</span>' : '') + '</div>'; }).join(''); }
  } catch(e) {}
}


async function loadWalletEvents() {
  try {
    var resp = await fetch(API + '/users/' + user.id + '/wallet-events'); var events = await resp.json();
    var listEl = document.getElementById('mb-wallet-events-list'); if (!listEl) return;
    if (!events || !events.length) { listEl.innerHTML = '<p style="color:#aaa;font-size:12px;text-align:center">Nenhum evento nas ultimas 24h</p>'; return; }
    var tipoLabel = { corrida: '&#x1F699; Corrida', bonus_promo: '&#x1F389; Bonus Promo', bonus_indicacao: '&#x1F91D; Bonus Indicacao' };
    listEl.innerHTML = events.map(function(ev) {
      var dt = new Date(ev.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      var label = tipoLabel[ev.tipo] || ev.tipo;
      var valor = parseFloat(ev.valor || 0).toFixed(2).replace('.', ',');
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #333"><div><div style="font-size:13px">' + label + '</div><div style="font-size:11px;color:#aaa">' + dt + ' - ' + (ev.descricao || '') + '</div></div><div style="color:#4caf50;font-weight:bold;font-size:14px">+R$ ' + valor + '</div></div>';
    }).join('');
  } catch(e) {}
}

async function loadPromoAtiva() {
            try {
              var r = await fetch(API + "/promotions/motoboy/" + user.id);
              if (!r.ok) return;
              var promos = await r.json();
              var banner = document.getElementById("avisos-mb-banner");
              if (!banner) return;
              var oldPromo = document.getElementById('promo-ativa-div');
              if (oldPromo) oldPromo.remove();
              if (!promos || !promos.length) return;
              var html = promos.map(function(p) {
                var pct = Math.min(100, Math.round((p.contagem / p.meta_entregas) * 100));
                var restam = p.meta_entregas - p.contagem;
                var msg = p.pago ? 'BONUS PAGO! Parabens!' : 'Faltam ' + restam + ' entrega(s) para ganhar R$ ' + parseFloat(p.valor_bonus).toFixed(2) + '!';
                return '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;align-items:center;"><strong style="color:#ffcc00;">Promocao: ' + p.nome + '</strong><span style="color:#aaa;font-size:12px;">' + p.contagem + '/' + p.meta_entregas + '</span></div><div style="background:#333;border-radius:6px;height:8px;margin:4px 0;"><div style="background:' + (p.pago ? '#66bb6a' : '#ffcc00') + ';width:' + pct + '%;height:8px;border-radius:6px;"></div></div><div style="color:' + (p.pago ? '#66bb6a' : '#fff') + ';font-size:12px;">' + msg + '</div></div>';
              }).join('');
              var promoDiv = document.createElement("div");
              promoDiv.id = 'promo-ativa-div';
              promoDiv.innerHTML = '<div style="color:#66bb6a;font-size:12px;font-weight:bold;margin-bottom:6px;">PROMOCAO ATIVA</div>' + html;
              banner.insertAdjacentElement('afterend', promoDiv);
            } catch(e) {}
          }
          async function init() {
  document.getElementById("motoboy-name").textContent = user.name || "Motoboy";
  updateStatusUI();
  await syncUser();
  await loadOrders();
  setInterval(loadOrders, 10000);
  if (user.online) {
    var _savedOnlineAt = parseInt(localStorage.getItem('_fd_onlineAt') || '0');
    _onlineAt = (_savedOnlineAt > 0) ? _savedOnlineAt : Date.now();
    if (!_savedOnlineAt) localStorage.setItem('_fd_onlineAt', _onlineAt);
    var _remainingMs = AUTO_OFFLINE_MS - (Date.now() - _onlineAt);
    _autoOfflineTimer = setTimeout(autoOfflineCheck, _remainingMs > 0 ? _remainingMs : 0);
  }
  setInterval(syncUser, 30000);
  loadAvisosMotboy(); setInterval(loadAvisosMotboy, 60000);
              loadPromoAtiva(); setInterval(loadPromoAtiva, 30000);
  loadMbIndicacao();
  loadWalletEvents();
}
init();
</script>
<!-- MODAL SAQUE -->
<div id="saque-modal" class="saque-modal" style="display:none">
<div class="saque-box">
<h3>&#x1F4B8; Solicitar Saque</h3>
<div id="saque-saldo-info" style="text-align:center;margin-bottom:14px;color:#aaa;font-size:13px"></div>
<input id="saque-valor" class="saque-input" type="number" step="0.01" min="0.01" placeholder="Valor do saque (R$)">
<input id="saque-pix" class="saque-input" type="text" placeholder="Chave PIX (CPF, e-mail, telefone...)">
<button class="btn-saque-submit" onclick="submitSaque()">Solicitar Saque</button>
<button class="btn-saque-cancel" onclick="closeSaqueModal()">Cancelar</button>
<div class="saque-history">
<div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Historico de Saques</div>
<div id="saque-history-list"><div style="color:#555;font-size:12px;text-align:center">Carregando...</div></div>
</div>
</div>
</div>
</body>
</html>`;

export default function MotoboyWebApp({ user, onLogout }) {
  const webviewRef = useRef(null);

  const injectedJS = `
    (function() {
      try {
        var userData = ${JSON.stringify(JSON.stringify(user))};
        localStorage.setItem('flashdrop_user', userData);
      } catch(e) {}
    })();
    true;
  `;

  const html = getHTML(user);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html, baseUrl: 'https://flashdrop-backend-production.up.railway.app' }}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'logout') {
            onLogout();
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        allowsInlineMediaPlayback={true}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#ffcc00" />
          </View>
        )}
        onError={(e) => console.error('WebView error:', e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  webview: { flex: 1, backgroundColor: '#1a1a1a' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
});
