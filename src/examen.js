// examen.js — arma las 29 preguntas aleatorias de cada examen
import { barajar, elegirN } from './azar.js';
import { generarPreguntas10 } from './razonamiento/index.js';
import { getBanco } from './banco.js';

const CLAVE_HISTORIAL = (nombre, grado) => `historial_${nombre}_${grado}`;

function gradoMatch(grado, filtro) {
  if (grado === 'todos') return true;
  if (Array.isArray(grado)) return grado.includes(filtro);
  return grado === filtro;
}

/**
 * Arma el examen de 29 preguntas filtradas por grado:
 *   - gradoSala: número (8/9/10) para sala de un grado específico
 *   - gradoSala: 'final' o null → usa el grado propio del estudiante
 */
const TOTAL_EXAMEN = 29;
const N_CIENCIAS   = Math.round(TOTAL_EXAMEN * 0.8); // 23 — 80 % ICFES
const N_RAZ        = TOTAL_EXAMEN - N_CIENCIAS;       // 6  — 20 % razonamiento

export function armarExamen(estudiante, gradoSala = null) {
  const gradoFiltro = (gradoSala === null || gradoSala === 'final')
    ? Number(estudiante.grado)
    : Number(gradoSala);

  const banco = getBanco().filter(p =>
    p.activa && gradoMatch(p.grado, gradoFiltro)
  );

  const claveHistorial = CLAVE_HISTORIAL(estudiante.nombre, gradoFiltro);
  const historial = JSON.parse(localStorage.getItem(claveHistorial) || '[]');

  // ── Ciencias (química + física + biología) — ICFES primero, normales de relleno ──
  const ciencias  = banco.filter(p => ['quimica','fisica','biologia','cts'].includes(p.materia));
  const sinVer    = ciencias.filter(p => !historial.includes(p.id));
  const fuente    = sinVer.length >= N_CIENCIAS ? sinVer : ciencias;

  const icfes     = fuente.filter(p => p.origen === 'icfes');
  const normales  = fuente.filter(p => p.origen !== 'icfes');

  const selICFES   = elegirN(icfes, Math.min(N_CIENCIAS, icfes.length));
  const restantes  = N_CIENCIAS - selICFES.length;
  const selNormales = elegirN(normales, restantes);

  const cienciasFinal = barajar([...selICFES, ...selNormales]).slice(0, N_CIENCIAS);

  // ── Razonamiento: del banco si hay suficientes, sino código generado ──
  const razBanco  = banco.filter(p => p.materia === 'razonamiento');
  const razSinVer = razBanco.filter(p => !historial.includes(p.id));
  const razFuente = razSinVer.length >= N_RAZ ? razSinVer : razBanco;
  const razonamiento = razFuente.length >= N_RAZ
    ? elegirN(razFuente, N_RAZ)
    : generarPreguntas10().slice(0, N_RAZ);

  const todas = barajar([...cienciasFinal, ...razonamiento]);
  return todas.map(p => barajarOpciones(p));
}

function barajarOpciones(pregunta) {
  // Los tipos interactivos no usan opciones/correcta clásicos
  if (!pregunta.opciones || (pregunta.tipo && pregunta.tipo !== 'seleccion')) {
    return pregunta;
  }
  const opcionCorrecta   = pregunta.opciones[pregunta.correcta];
  const opcionesBarajadas = barajar(pregunta.opciones);
  return {
    ...pregunta,
    opciones: opcionesBarajadas,
    correcta: opcionesBarajadas.indexOf(opcionCorrecta)
  };
}

export function guardarHistorial(estudiante, preguntas) {
  const gradoFiltro = Number(estudiante.grado);
  const clave = CLAVE_HISTORIAL(estudiante.nombre, gradoFiltro);
  const ids = preguntas.filter(p => p.id).map(p => p.id);
  const historialPrevio = JSON.parse(localStorage.getItem(clave) || '[]');
  const nuevo = [...historialPrevio, ...ids].slice(-38);
  localStorage.setItem(clave, JSON.stringify(nuevo));
}
