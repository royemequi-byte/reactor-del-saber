// efectos.js — efectos de sonido mejorados (cálidos, con reverb)
import { tocarNota, getCtx, getMasterGain, getReverbBus, getSilenciado } from './motor-audio.js';

function ctx()    { return getCtx(); }
function master() { return getMasterGain(); }
function reverb() { return getReverbBus(); }
function mudo()   { return getSilenciado(); }

// Toca un acorde de varias notas con retardo y reverb
function acorde(notas, tipo, vol, dur, retraso = 60) {
  notas.forEach((f, i) => setTimeout(() => tocarNota(f, tipo, vol, dur, true), i * retraso));
}

// ── RESPUESTA CORRECTA — acorde mayor ascendente cálido ─────────────────────
export function tocarAcierto() {
  if (!ctx() || mudo()) return;
  // Do-Mi-Sol en 5a octava, onda seno con reverb
  acorde([523.2, 659.3, 783.9], 'sine', 0.14, 0.5, 70);
  // Refuerzo con quinta alta un poco después
  setTimeout(() => tocarNota(1046.5, 'sine', 0.07, 0.4, true), 240);
}

// ── RESPUESTA INCORRECTA — dos notas descendentes suaves ────────────────────
export function tocarError() {
  if (!ctx() || mudo()) return;
  tocarNota(311.1, 'sine', 0.1, 0.35, false);
  setTimeout(() => tocarNota(233.1, 'sine', 0.08, 0.4, false), 180);
}

// ── RACHA ACTIVADA — arpegio ascendente brillante ───────────────────────────
export function tocarRacha(nivel) {
  if (!ctx() || mudo()) return;
  const c = ctx();
  const sets = {
    1: [392.0, 523.2, 659.3],                    // x1.5 — Sol-Do-Mi
    2: [523.2, 659.3, 783.9, 1046.5],             // x2   — Do-Mi-Sol-Do alta
    3: [523.2, 659.3, 783.9, 1046.5, 1318.5],     // x3   — escala completa épica
  };
  const notas = sets[nivel] || sets[1];
  acorde(notas, 'sine', 0.11, 0.45, 80);

  // Whoosh ascendente suave
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.4);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(master());
  if (reverb()) gain.connect(reverb());
  osc.start();
  osc.stop(c.currentTime + 0.55);
}

// ── PODER USADO ──────────────────────────────────────────────────────────────
export function tocarPoder(tipo) {
  if (!ctx() || mudo()) return;
  if (tipo === 'catalizador') {
    // Burbujeo alegre ascendente
    [523.2, 659.3, 783.9, 1046.5].forEach((f, i) =>
      setTimeout(() => tocarNota(f, 'sine', 0.09, 0.18, true), i * 55)
    );
  } else if (tipo === 'reposo') {
    // Nota larga, calmante, descendente suave
    acorde([440, 349.2], 'sine', 0.09, 1.0, 120);
  } else if (tipo === 'isotopo') {
    // Acorde ambiguo (cambio/transformación)
    acorde([466.2, 523.2, 392.0], 'sine', 0.09, 0.5, 60);
  }
}

// ── FANFARRIA FINAL ──────────────────────────────────────────────────────────
export function tocarFanfarra(puesto) {
  if (!ctx() || mudo()) return;

  if (puesto === 1) {
    // 🥇 Épico — Do mayor completo + remate
    const melodia = [523.2, 659.3, 783.9, 1046.5, 783.9, 1046.5, 1318.5];
    melodia.forEach((f, i) => setTimeout(() => tocarNota(f, 'sine', 0.15, 0.4, true), i * 130));
    // Acorde final sostenido
    setTimeout(() => acorde([523.2, 659.3, 783.9, 1046.5], 'sine', 0.12, 1.2, 30), 1000);

  } else if (puesto === 2) {
    // 🥈 La menor ascendente
    [440, 523.2, 659.3, 783.9, 659.3].forEach((f, i) =>
      setTimeout(() => tocarNota(f, 'sine', 0.12, 0.38, true), i * 120)
    );
  } else if (puesto === 3) {
    // 🥉 Sol mayor corto
    [392.0, 493.9, 587.3, 783.9].forEach((f, i) =>
      setTimeout(() => tocarNota(f, 'sine', 0.1, 0.32, true), i * 110)
    );
  } else {
    // Sin podio — acorde amable de participación
    acorde([392.0, 523.2, 659.3], 'sine', 0.09, 0.5, 80);
  }
}

// ── INTRO AL EXAMEN ──────────────────────────────────────────────────────────
export function tocarIntro() {
  if (!ctx() || mudo()) return;
  // Pentatónica ascendente — Do Re Mi Sol La
  [261.6, 293.7, 329.6, 392.0, 440.0].forEach((f, i) =>
    setTimeout(() => tocarNota(f, 'sine', 0.11, 0.35, true), i * 110)
  );
}
