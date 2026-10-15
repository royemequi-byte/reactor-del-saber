// motor-audio.js — música generativa mejorada con reverb y sonidos cálidos
let ctx = null;
let masterGain = null;
let reverbBus  = null;   // bus de reverb global
let silenciado = false;
let volumenActual = 0.7;

let baseNodo   = null;
let lfoNodo    = null;
let intervaloArpegio = null;
let intervaloTicTac  = null;

let bpmActual     = 90;
let materiaActual = 'quimica';
let rachaActual   = 0;

const ESCALAS = {
  quimica:      [261.6, 293.7, 329.6, 392.0, 440.0, 523.2],
  fisica:       [220.0, 246.9, 293.7, 329.6, 369.9, 440.0],
  biologia:     [261.6, 311.1, 349.2, 392.0, 466.2, 523.2],
  razonamiento: [349.2, 392.0, 440.0, 493.9, 523.2, 587.3],
};

// ── INICIALIZACIÓN ──────────────────────────────────────────────────────────
export function iniciarAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(silenciado ? 0 : volumenActual, ctx.currentTime);
  masterGain.connect(ctx.destination);

  reverbBus = crearReverb();
  reverbBus.connect(masterGain);

  iniciarCapaBase();
}

export function setVolumen(v) {
  volumenActual = v;
  if (masterGain && !silenciado) {
    masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.15);
  }
}

export function toggleSilencio() {
  silenciado = !silenciado;
  if (!masterGain) return silenciado;
  masterGain.gain.linearRampToValueAtTime(
    silenciado ? 0 : volumenActual,
    ctx.currentTime + 0.15
  );
  return silenciado;
}

// ── REVERB (impulso sintético) ──────────────────────────────────────────────
function crearReverb() {
  const convolver = ctx.createConvolver();
  const duracion  = 1.2;
  const samples   = Math.round(ctx.sampleRate * duracion);
  const buffer    = ctx.createBuffer(2, samples, ctx.sampleRate);

  for (let canal = 0; canal < 2; canal++) {
    const datos = buffer.getChannelData(canal);
    for (let i = 0; i < samples; i++) {
      datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples, 2.5);
    }
  }
  convolver.buffer = buffer;

  const gainReverb = ctx.createGain();
  gainReverb.gain.value = 0.18;
  convolver.connect(gainReverb);
  return gainReverb; // conecta al masterGain externamente
}

// ── CAPA BASE (zumbido del reactor) ─────────────────────────────────────────
function iniciarCapaBase() {
  if (!ctx) return;

  // Oscilador principal: onda seno suave a 80 Hz
  const osc1  = ctx.createOscillator();
  const osc2  = ctx.createOscillator(); // capa armónica a la quinta
  const gain  = ctx.createGain();
  const filtro = ctx.createBiquadFilter();

  osc1.type = 'sine';
  osc1.frequency.value = 80;
  osc2.type = 'sine';
  osc2.frequency.value = 120; // quinta perfecta
  gain.gain.value = 0.08;
  filtro.type = 'lowpass';
  filtro.frequency.value = 400;
  filtro.Q.value = 0.5;

  // LFO de respiración (0.6 Hz)
  const lfo     = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.6;
  lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start();
  lfoNodo = lfo;

  osc1.connect(filtro);
  osc2.connect(filtro);
  filtro.connect(gain);
  gain.connect(masterGain);
  gain.connect(reverbBus); // algo de reverb en el fondo
  osc1.start();
  osc2.start();
  baseNodo = { osc1, osc2, gain, filtro };
}

// ── CAMBIAR TIMBRE POR MATERIA ───────────────────────────────────────────────
export function setMateria(materia) {
  materiaActual = materia || 'quimica';
  if (!ctx || !baseNodo) return;

  const configs = {
    quimica:      { f1: 80,  f2: 120, filtro: 500  },
    fisica:       { f1: 110, f2: 165, filtro: 700  },
    biologia:     { f1: 65,  f2:  98, filtro: 350  },
    razonamiento: { f1: 130, f2: 195, filtro: 1000 },
  };
  const c = configs[materia] || configs.quimica;
  const t = ctx.currentTime;
  baseNodo.osc1.frequency.linearRampToValueAtTime(c.f1, t + 0.5);
  baseNodo.osc2.frequency.linearRampToValueAtTime(c.f2, t + 0.5);
  baseNodo.filtro.frequency.linearRampToValueAtTime(c.filtro, t + 0.5);
}

// ── BPM PROGRESIVO ──────────────────────────────────────────────────────────
export function setProgreso(preguntaNum) {
  bpmActual = Math.round(90 + (preguntaNum / 29) * 40);
  if (lfoNodo) {
    const bps = bpmActual / 60;
    lfoNodo.frequency.linearRampToValueAtTime(bps * 0.4, ctx.currentTime + 0.5);
  }
}

// ── ARPEGIO DE RACHA ────────────────────────────────────────────────────────
export function setRacha(racha) {
  rachaActual = racha;
  if (racha >= 3) activarArpegio();
  else            detenerArpegio();
}

function activarArpegio() {
  if (intervaloArpegio || !ctx) return;
  let idx = 0;
  const escala = ESCALAS[materiaActual] || ESCALAS.quimica;
  const ms     = Math.round(60000 / bpmActual / 2);

  intervaloArpegio = setInterval(() => {
    if (!ctx || silenciado) return;
    const oct  = rachaActual >= 5 ? 2 : 1;
    const freq = escala[idx % escala.length] * oct;
    tocarNota(freq, 'sine', 0.05, 0.18);
    idx++;
  }, ms);
}

function detenerArpegio() {
  clearInterval(intervaloArpegio);
  intervaloArpegio = null;
}

// ── TIC-TAC DE URGENCIA ─────────────────────────────────────────────────────
export function setTiempoRestante(segundos) {
  if (segundos <= 10 && segundos > 0) {
    activarTicTac(segundos);
    if (baseNodo) {
      baseNodo.filtro.frequency.linearRampToValueAtTime(
        600 + (10 - segundos) * 80,
        ctx.currentTime + 0.1
      );
    }
  } else if (segundos > 10) {
    detenerTicTac();
    if (baseNodo) {
      baseNodo.filtro.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.3);
    }
  }
}

function activarTicTac(segs) {
  detenerTicTac();
  if (!ctx) return;
  const ms = Math.max(220, segs * 70);
  tocarNota(1200, 'sine', 0.07, 0.04);
  intervaloTicTac = setTimeout(() => activarTicTac(segs - 0.5), ms);
}

function detenerTicTac() {
  clearTimeout(intervaloTicTac);
  intervaloTicTac = null;
}

// ── UTILIDAD: nota individual con envolvente suave ───────────────────────────
export function tocarNota(freq, tipo = 'sine', volumen = 0.1, duracion = 0.25, conReverb = false) {
  if (!ctx || silenciado) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  const atacke = 0.012;

  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  // Envolvente ADSR suave
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + atacke);
  gain.gain.setValueAtTime(volumen, ctx.currentTime + duracion * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duracion);

  osc.connect(gain);
  gain.connect(masterGain);
  if (conReverb && reverbBus) gain.connect(reverbBus);
  osc.start();
  osc.stop(ctx.currentTime + duracion + 0.05);
}

// Exports internos para efectos.js
export function getCtx()        { return ctx; }
export function getMasterGain() { return masterGain; }
export function getReverbBus()  { return reverbBus; }
export function getSilenciado() { return silenciado; }
