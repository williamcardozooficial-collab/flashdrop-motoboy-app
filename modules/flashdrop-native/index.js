import { requireNativeModule } from 'expo-modules-core';

// Modulo nativo (Android). Se por algum motivo nao existir, as funcoes viram no-ops seguros.
let native = null;
try {
  native = requireNativeModule('FlashdropNative');
} catch (e) {
  native = null;
}

function safe(fn, fallback) {
  try {
    return native ? native[fn]() : fallback;
  } catch (e) {
    return fallback;
  }
}

export function canDrawOverlays() { return safe('canDrawOverlays', true); }
export function isIgnoringBatteryOptimizations() { return safe('isIgnoringBatteryOptimizations', true); }
export function openOverlaySettings() { return safe('openOverlaySettings', false); }
export function openBatterySettings() { return safe('openBatterySettings', false); }
export function bringAppToFront() { return safe('bringAppToFront', false); }
export const disponivel = !!native;
