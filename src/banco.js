// banco.js — banco de preguntas sincronizado con Firebase Realtime Database
import { ref, get, set, onValue } from 'firebase/database';
import { db } from './firebase.js';
import bancoBruto from '../data/banco-preguntas.json';

const RUTA = 'banco-preguntas';
let cache = [];

function normalizar(val) {
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
}

// Llamar al arrancar la app — carga desde Firebase y activa listener en tiempo real
export async function initBanco() {
  const snap = await get(ref(db, RUTA));
  if (snap.exists()) {
    cache = normalizar(snap.val());
  } else {
    // Primera vez: subir el banco inicial desde el JSON
    cache = JSON.parse(JSON.stringify(bancoBruto));
    await set(ref(db, RUTA), cache);
  }
  // Mantener cache sincronizado con cambios de otros usuarios en tiempo real
  onValue(ref(db, RUTA), snap => {
    if (snap.exists()) cache = normalizar(snap.val());
  });
}

export function getBanco() {
  return cache;
}

export function setBanco(arr) {
  cache = arr;
  set(ref(db, RUTA), arr).catch(console.error);
}

export function resetBanco() {
  const idsActuales = new Set(cache.map(p => p.id));
  const faltantes = bancoBruto.filter(p => !idsActuales.has(p.id));
  const merged = [...cache, ...faltantes];
  setBanco(merged);
  return merged;
}

export function agregarPregunta(p) {
  setBanco([...cache, p]);
}

export function actualizarPregunta(id, cambios) {
  const i = cache.findIndex(p => p.id === id);
  if (i === -1) return false;
  const nuevo = [...cache];
  nuevo[i] = { ...nuevo[i], ...cambios };
  setBanco(nuevo);
  return true;
}

export function eliminarPregunta(id) {
  setBanco(cache.filter(p => p.id !== id));
}

export function toggleActiva(id) {
  const i = cache.findIndex(p => p.id === id);
  if (i === -1) return null;
  const nuevo = [...cache];
  nuevo[i].activa = !nuevo[i].activa;
  setBanco(nuevo);
  return nuevo[i].activa;
}
