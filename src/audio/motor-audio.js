// motor-audio.js — música generativa con Web Audio API
// Todo el sonido se sintetiza en código; no se necesitan archivos .mp3

let ctx = null;          // AudioContext (se crea solo tras interacción del usuario)
let masterGain = null;   // Volumen maestro
let silenciado = false;
let volumenActual = 0.7;

// Nodos activos
let baseNodo   = null;   // Reactor zumbando (capa base)
let energiaNodo = null;  // Arpegio de racha
let intervaloArpegio = null;
let intervaloTicTac  = null;
let lfoNodo    = null;

// Estado musical
let bpmActual  = 90;
let materiaActual = 'quimica';
let rachaActual   = 0;

// Escalas por materia (frecuencias en Hz)
const ESCALAS = {
  quimica:      [261.6, 293.7, 329.6, 392.0, 440.0, 523.2],  // Do mayor (burbujeante)
  fisica:       [220.0, 246.9, 293.7, 329.6, 369.9, 440.0],  // La menor (eléctrico)
  biologia:     [261.6, 311.1, 349.2, 392.0, 466.2, 523.2],  // Do mixolidio (natural)
  razonamiento: [349.2, 392.0, 440.0, 493.9, 523.2, 587.3],  // Fa mayor (campanas)
};

// ──────────────────────────────────────────────────────────
//  INICIALIZACIÓN (solo una vez, tras clic del usuario)
// ──────────────────────────────────────────────────────────
export function iniciarAudio() {
  if (ctx) return; // ya iniciado
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(silenciado ? 0 : volumenActual, ctx.currentTime);
  masterGain.connect(ctx.destination);
  iniciarCapaBase();
}

export function setVolumen(v) {
  volumenActual = v;
  if (masterGain && !silenciado) {
    masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1);
  }
}

export function toggleSilencio() {
  silenciado = !silenciado;
  if (!masterGain) return;
  masterGain.gain.linearRampToValueAtTime(
    silenciado ? 0 : volumenActual,
    ctx.currentTime + 0.1
  );
  return silenciado;
}

// ──────────────────────────────────────────────────────────
//  CAPA BASE — Reactor zumbando en loop
// ──────────────────────────────────────────────────────────
function iniciarCapaBase() {
  if (!ctx) return;

  // Oscilador base (pulso del reactor)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filtro = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(400, ctx.currentTime);

  // LFO: hace que el volumen pulse suavemente (como reactor respirando)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.8, ctx.currentTime); // 0.8 Hz = casi 1 pulso/seg
  lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start();
  lfoNodo = lfo;

  osc.connect(filtro);
  filtro.connect(gain);
  gain.connect(masterGain);
  osc.start();
  baseNodo = { osc, gain, filtro };

  // Segunda capa: acorde suave de fondo (pad)
  const pad = ctx.createOscillator();
  const padGain = ctx.createGain();
  const padFiltro = ctx.createBiquadFilter();
  pad.type = 'triangle';
  pad.frequency.setValueAtTime(160, ctx.currentTime);
  padGain.gain.setValueAtTime(0.05, ctx.currentTime);
  padFiltro.type = 'lowpass';
  padFiltro.frequency.setValueAtTime(600, ctx.currentTime);
  pad.connect(padFiltro);
  padFiltro.connect(padGain);
  padGain.connect(masterGain);
  pad.start();
}

// ──────────────────────────────────────────────────────────
//  ACTUALIZAR SEGÚN EL JUEGO
// ──────────────────────────────────────────────────────────

// Cambia timbre según la materia de la pregunta actual
export function setMateria(materia) {
  materiaActual = materia || 'quimica';
  if (!ctx || !baseNodo) return;

  const configs = {
    quimica:      { freq: 80,  filtro: 500,  tipo: 'sine'     },
    fisica:       { freq: 110, filtro: 800,  tipo: 'sawtooth' },
    biologia:     { freq: 70,  filtro: 350,  tipo: 'sine'     },
    razonamiento: { freq: 130, filtro: 1200, tipo: 'triangle' },
  };
  const c = configs[materia] || configs.quimica;
  const t = ctx.currentTime;
  baseNodo.osc.frequency.linearRampToValueAtTime(c.freq, t + 0.3);
  baseNodo.filtro.frequency.linearRampToValueAtTime(c.filtro, t + 0.3);
}

// Sube el BPM según el progreso del examen (pregunta 1→29)
export function setProgreso(preguntaNum) {
  bpmActual = Math.round(90 + (preguntaNum / 29) * 40); // 90→130 BPM
  if (baseNodo && lfoNodo) {
    const bps = bpmActual / 60;
    lfoNodo.frequency.linearRampToValueAtTime(bps * 0.5, ctx.currentTime + 0.5);
  }
}

// Activa/desactiva la capa de energía (arpegio) según la racha
export function setRacha(racha) {
  rachaActual = racha;
  if (racha >= 3) {
    activarArpegio();
  } else {
    detenerArpegio();
  }
}

function activarArpegio() {
  if (intervaloArpegio || !ctx) return;
  let idx = 0;
  const escala = ESCALAS[materiaActual] || ESCALAS.quimica;
  const intervaloMs = Math.round(60000 / bpmActual / 2); // corcheas

  intervaloArpegio = setInterval(() => {
    if (!ctx || silenciado) return;
    const freq = escala[idx % escala.length] * (rachaActual >= 5 ? 2 : 1);
    tocarNota(freq, 'triangle', 0.06, 0.12);
    idx++;
  }, intervaloMs);
}

function detenerArpegio() {
  clearInterval(intervaloArpegio);
  intervaloArpegio = null;
}

// Capa de tensión: tic-tac cuando quedan ≤10 segundos
export function setTiempoRestante(segundos) {
  if (segundos <= 10 && segundos > 0) {
    activarTicTac(segundos);
    // Sube el filtro para dar sensación de "urgencia"
    if (baseNodo) {
      baseNodo.filtro.frequency.linearRampToValueAtTime(
        1200 + (10 - segundos) * 100,
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

function activarTicTac(segsRestantes) {
  detenerTicTac();
  if (!ctx) return;
  // El intervalo se acorta con cada segundo que pasa
  const ms = Math.max(300, segsRestantes * 80);
  tocarNota(880, 'square', 0.08, 0.05); // tic inmediato
  intervaloTicTac = setTimeout(() => activarTicTac(segsRestantes - 0.5), ms);
}

function detenerTicTac() {
  clearTimeout(intervaloTicTac);
  intervaloTicTac = null;
}

// ──────────────────────────────────────────────────────────
//  UTILIDAD: toca una nota breve
// ──────────────────────────────────────────────────────────
function tocarNota(freq, tipo = 'sine', volumen = 0.1, duracion = 0.2) {
  if (!ctx || silenciado) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volumen, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + duracion + 0.05);
}

// Exportar para uso interno en efectos.js
export function getCtx()       { return ctx; }
export function getMasterGain(){ return masterGain; }
export function getSilenciado(){ return silenciado; }
export { tocarNota };
