// banco.js — gestión del banco de preguntas (localStorage + JSON fallback)
import bancoBruto from '../data/banco-preguntas.json';

const CLAVE = 'iti_banco';

export function getBanco() {
  const raw = localStorage.getItem(CLAVE);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  return JSON.parse(JSON.stringify(bancoBruto));
}

export function setBanco(arr) {
  localStorage.setItem(CLAVE, JSON.stringify(arr));
}

export function resetBanco() {
  localStorage.removeItem(CLAVE);
  return JSON.parse(JSON.stringify(bancoBruto));
}

export function agregarPregunta(p) {
  const banco = getBanco();
  banco.push(p);
  setBanco(banco);
}

export function actualizarPregunta(id, cambios) {
  const banco = getBanco();
  const i = banco.findIndex(p => p.id === id);
  if (i === -1) return false;
  banco[i] = { ...banco[i], ...cambios };
  setBanco(banco);
  return true;
}

export function eliminarPregunta(id) {
  setBanco(getBanco().filter(p => p.id !== id));
}

export function toggleActiva(id) {
  const banco = getBanco();
  const i = banco.findIndex(p => p.id === id);
  if (i === -1) return null;
  banco[i].activa = !banco[i].activa;
  setBanco(banco);
  return banco[i].activa;
}
