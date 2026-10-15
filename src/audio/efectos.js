// efectos.js — efectos de sonido puntuales del juego

// Importamos las funciones internas del motor
import { tocarNota, getCtx, getMasterGain, getSilenciado } from './motor-audio.js';

function ctx()     { return getCtx(); }
function master()  { return getMasterGain(); }
function callado() { return getSilenciado(); }

// ──────────────────────────────────────────────────────────
//  RESPUESTA CORRECTA — acorde mayor ascendente (Do-Mi-Sol)
// ──────────────────────────────────────────────────────────
export function tocarAcierto() {
  if (!ctx() || callado()) return;
  const notas = [523.2, 659.3, 783.9]; // C5-E5-G5
  notas.forEach((f, i) => {
    setTimeout(() => tocarNota(f, 'sine', 0.12, 0.25), i * 80);
  });
}

// ──────────────────────────────────────────────────────────
//  RESPUESTA INCORRECTA — nota grave corta (no humillante)
// ──────────────────────────────────────────────────────────
export function tocarError() {
  if (!ctx() || callado()) return;
  tocarNota(180, 'triangle', 0.1, 0.3);
  setTimeout(() => tocarNota(160, 'triangle', 0.07, 0.2), 150);
}

// ──────────────────────────────────────────────────────────
//  RACHA ACTIVADA — whoosh + subida de tono
// ──────────────────────────────────────────────────────────
export function tocarRacha(nivel) {
  if (!ctx() || callado()) return;
  const c = ctx();
  const osc  = c.createOscillator();
  const gain = c.createGain();
  const baseFreq = nivel === 3 ? 300 : nivel === 2 ? 400 : 500;
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 3, c.currentTime + 0.4);
  gain.gain.setValueAtTime(0.12, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(master());
  osc.start();
  osc.stop(c.currentTime + 0.55);

  // Acorde extra en rachas altas
  if (nivel >= 2) {
    setTimeout(() => tocarNota(880, 'sine', 0.08, 0.15), 400);
  }
  if (nivel >= 3) {
    setTimeout(() => tocarNota(1046, 'sine', 0.06, 0.15), 550);
  }
}

// ──────────────────────────────────────────────────────────
//  PODER USADO — sonido especial de laboratorio
// ──────────────────────────────────────────────────────────
export function tocarPoder(tipo) {
  if (!ctx() || callado()) return;
  const c = ctx();

  if (tipo === 'catalizador') {
    // Burbujeo rápido (elimina opciones)
    [600, 700, 800, 700].forEach((f, i) => {
      setTimeout(() => tocarNota(f, 'sine', 0.09, 0.1), i * 60);
    });
  } else if (tipo === 'reposo') {
    // Nota larga y suave (congelar el tiempo)
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, c.currentTime);
    osc.frequency.linearRampToValueAtTime(220, c.currentTime + 1.0);
    g.gain.setValueAtTime(0.1, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
    osc.connect(g); g.connect(master());
    osc.start(); osc.stop(c.currentTime + 1.3);
  } else if (tipo === 'isotopo') {
    // Whoosh de transformación
    [400, 500, 400, 300, 400].forEach((f, i) => {
      setTimeout(() => tocarNota(f, 'triangle', 0.08, 0.12), i * 50);
    });
  }
}

// ──────────────────────────────────────────────────────────
//  FANFARRIA FINAL — diferente para 1°, 2° y 3° puesto
// ──────────────────────────────────────────────────────────
export function tocarFanfarra(puesto) {
  if (!ctx() || callado()) return;

  if (puesto === 1) {
    // 🥇 Fanfarria épica — Do mayor ascendente largo
    const melodia = [
      { f: 523.2, t: 0 },   { f: 659.3, t: 120 }, { f: 783.9, t: 240 },
      { f: 1046.5, t: 400 },{ f: 783.9, t: 560 }, { f: 1046.5, t: 680 },
    ];
    melodia.forEach(({ f, t }) => setTimeout(() => tocarNota(f, 'sine', 0.15, 0.3), t));

  } else if (puesto === 2) {
    // 🥈 Fanfarria media — La menor
    const melodia = [
      { f: 440, t: 0 }, { f: 523.2, t: 150 }, { f: 659.3, t: 300 },
      { f: 783.9, t: 450 }, { f: 659.3, t: 600 },
    ];
    melodia.forEach(({ f, t }) => setTimeout(() => tocarNota(f, 'triangle', 0.12, 0.25), t));

  } else {
    // 🥉 Fanfarria corta — Sol mayor
    const melodia = [
      { f: 392, t: 0 }, { f: 493.9, t: 150 }, { f: 587.3, t: 300 },
    ];
    melodia.forEach(({ f, t }) => setTimeout(() => tocarNota(f, 'sine', 0.1, 0.2), t));
  }
}

// ──────────────────────────────────────────────────────────
//  INTRO — sonido al entrar al examen
// ──────────────────────────────────────────────────────────
export function tocarIntro() {
  if (!ctx() || callado()) return;
  const notas = [261.6, 329.6, 392.0, 523.2];
  notas.forEach((f, i) => setTimeout(() => tocarNota(f, 'sine', 0.1, 0.3), i * 100));
}
