// sala.js — operaciones de sala en Firebase Realtime Database
import { db } from './firebase.js';
import {
  ref, set, get, push, update, remove, onValue, serverTimestamp
} from 'firebase/database';

const EXPIRACION_MS = 3 * 60 * 60 * 1000; // salas se limpian a las 3 h

// ── GENERAR CÓDIGO DE 6 CARACTERES ─────────────────────────────────────────
export function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// ── CREAR SALA (profesor) ───────────────────────────────────────────────────
export async function crearSala(grado) {
  const codigo = generarCodigo();
  await set(ref(db, `salas/${codigo}`), {
    estado:   'esperando',
    grado:    grado,   // 8 | 9 | 10 | 'final'
    creadaEn: Date.now(),
  });
  return codigo;
}

// ── OBTENER GRADO DE SALA ───────────────────────────────────────────────────
export async function obtenerGradoSala(codigo) {
  const snap = await get(ref(db, `salas/${codigo}`));
  if (!snap.exists()) return { error: 'Sala no encontrada. Revisa el código.' };
  const data = snap.val();
  if (data.estado === 'jugando')    return { error: 'El examen ya empezó. Llegaste tarde 😅' };
  if (data.estado === 'finalizada') return { error: 'Esta sala ya terminó.' };
  return { grado: data.grado, estado: data.estado };
}

// ── UNIRSE A SALA (estudiante) ──────────────────────────────────────────────
export async function unirseASala(codigo, estudiante) {
  const salaSnap = await get(ref(db, `salas/${codigo}`));
  if (!salaSnap.exists())           return { error: 'Sala no encontrada. Revisa el código.' };
  const sala = salaSnap.val();
  if (sala.estado === 'jugando')    return { error: 'El examen ya empezó. Llegaste tarde 😅' };
  if (sala.estado === 'finalizada') return { error: 'Esta sala ya terminó.' };
  // Validar grado (segunda línea de defensa, la primera es el cliente)
  if (sala.grado !== 'final' && sala.grado != null &&
      Number(estudiante.grado) !== Number(sala.grado)) {
    return { error: `Esta sala es para grado ${sala.grado}°. Selecciona el grado correcto para continuar.` };
  }

  const nuevoRef = push(ref(db, `salas/${codigo}/estudiantes`));
  await set(nuevoRef, {
    nombre:    estudiante.nombre,
    grado:     estudiante.grado,
    curso:     estudiante.curso,
    avatar:    estudiante.avatar,
    estado:    'esperando',
    puntaje:   0,
    nota:      '0.0',
    unidoEn:   Date.now(),
    terminadoEn: 0,
  });
  return { uid: nuevoRef.key };
}

// ── INICIAR JUEGO (profesor) ────────────────────────────────────────────────
export async function iniciarJuego(codigo) {
  await update(ref(db, `salas/${codigo}`), {
    estado:     'jugando',
    iniciadaEn: Date.now(),
  });
}

// ── REPORTAR RESULTADO (estudiante al terminar) ─────────────────────────────
export async function reportarResultado(codigo, uid, puntaje, nota) {
  await update(ref(db, `salas/${codigo}/estudiantes/${uid}`), {
    estado:      'terminado',
    puntaje,
    nota,
    terminadoEn: Date.now(),
  });
}

// ── LISTENERS EN TIEMPO REAL ────────────────────────────────────────────────
export function escucharEstudiantes(codigo, callback) {
  const r = ref(db, `salas/${codigo}/estudiantes`);
  return onValue(r, snap => {
    const data = snap.val() || {};
    const lista = Object.entries(data)
      .map(([uid, e]) => ({ uid, ...e }))
      .sort((a, b) => b.puntaje - a.puntaje);
    callback(lista);
  });
}

export function escucharEstadoSala(codigo, callback) {
  return onValue(ref(db, `salas/${codigo}/estado`), snap => callback(snap.val()));
}

// ── LIMPIAR SALA ────────────────────────────────────────────────────────────
export async function cerrarSala(codigo) {
  await remove(ref(db, `salas/${codigo}`));
}
