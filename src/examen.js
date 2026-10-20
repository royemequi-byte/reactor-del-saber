// examen.js — arma las preguntas del examen con cuotas por materia
import { barajar, elegirN } from './azar.js';
import { getBanco } from './banco.js';
import { getConfig } from './config.js';

const CLAVE_HISTORIAL = (nombre, grado) => `historial_${nombre}_${grado}`;

const CUOTAS_DEFAULT = {
  grado8:  { biologia: 27, fisica: 4, quimica: 4, cts: 4 },
  grado9:  { biologia: 27, fisica: 4, quimica: 4, cts: 4 },
  grado10: { quimica: 19, fisica: 7, biologia: 8, cts: 5 },
};

const MATERIAS = ['biologia', 'fisica', 'quimica', 'cts'];

function gradoMatch(grado, filtro) {
  if (grado === 'todos') return true;
  if (Array.isArray(grado)) return grado.includes(filtro);
  return grado === filtro;
}

/**
 * Arma el examen con cuotas fijas por materia leídas desde Firebase /config/cuotas.
 * Dentro de cada materia: ICFES tiene prioridad, normales rellenan si faltan.
 * Las preguntas se barajan al final para evitar copia.
 */
export function armarExamen(estudiante, gradoSala = null) {
  const gradoFiltro = (gradoSala === null || gradoSala === 'final')
    ? Number(estudiante.grado)
    : Number(gradoSala);

  const config = getConfig();
  const cuotas = config.cuotas?.[`grado${gradoFiltro}`]
    || CUOTAS_DEFAULT[`grado${gradoFiltro}`]
    || CUOTAS_DEFAULT.grado8;

  const banco = getBanco().filter(p =>
    p.activa && gradoMatch(p.grado, gradoFiltro)
  );

  const claveHistorial = CLAVE_HISTORIAL(estudiante.nombre, gradoFiltro);
  const historial = JSON.parse(localStorage.getItem(claveHistorial) || '[]');

  const seleccionadas = [];

  for (const materia of MATERIAS) {
    const n = Number(cuotas[materia]) || 0;
    if (!n) continue;

    const pool   = banco.filter(p => p.materia === materia);
    const sinVer = pool.filter(p => !historial.includes(p.id));
    const fuente = sinVer.length >= n ? sinVer : pool;

    const icfes    = fuente.filter(p => p.origen === 'icfes');
    const normales = fuente.filter(p => p.origen !== 'icfes');

    const selICFES = elegirN(icfes, Math.min(n, icfes.length));
    const selNorm  = elegirN(normales, n - selICFES.length);
    seleccionadas.push(...selICFES, ...selNorm);
  }

  return barajar(seleccionadas).map(p => barajarOpciones(p));
}

function barajarOpciones(pregunta) {
  if (!pregunta.opciones || (pregunta.tipo && pregunta.tipo !== 'seleccion')) {
    return pregunta;
  }
  const opcionCorrecta    = pregunta.opciones[pregunta.correcta];
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
  const total = getTotalLocal(gradoFiltro);
  const nuevo = [...historialPrevio, ...ids].slice(-Math.round(total * 1.3));
  localStorage.setItem(clave, JSON.stringify(nuevo));
}

function getTotalLocal(grado) {
  const c = getConfig().cuotas?.[`grado${grado}`] || CUOTAS_DEFAULT[`grado${grado}`] || {};
  return Object.values(c).reduce((s, n) => s + (Number(n) || 0), 0) || 39;
}
