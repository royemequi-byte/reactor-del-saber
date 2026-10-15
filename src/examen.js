// examen.js — arma las 29 preguntas aleatorias de cada examen
import { barajar, elegirN } from './azar.js';
import { generarPreguntas10 } from './razonamiento/index.js';
import { getBanco } from './banco.js';

const CLAVE_HISTORIAL = (nombre, grado) => `historial_${nombre}_${grado}`;

/**
 * Arma el examen de 29 preguntas filtradas por grado:
 *   - gradoSala: número (8/9/10) para sala de un grado específico
 *   - gradoSala: 'final' o null → usa el grado propio del estudiante
 */
export function armarExamen(estudiante, gradoSala = null) {
  const gradoFiltro = (gradoSala === null || gradoSala === 'final')
    ? Number(estudiante.grado)
    : Number(gradoSala);

  const banco = getBanco().filter(p =>
    p.activa && (p.grado === gradoFiltro || p.grado === 'todos')
  );

  const claveHistorial = CLAVE_HISTORIAL(estudiante.nombre, gradoFiltro);
  const historial = JSON.parse(localStorage.getItem(claveHistorial) || '[]');

  // ── Ciencias (química + física + biología) ──
  const ciencias = banco.filter(p => ['quimica','fisica','biologia'].includes(p.materia));
  const cienciasSinVer = ciencias.filter(p => !historial.includes(p.id));
  const cienciasFinal  = elegirN(cienciasSinVer.length >= 19 ? cienciasSinVer : ciencias, 19);

  // ── Razonamiento: del banco si hay ≥10, sino código generado ──
  const razBanco   = banco.filter(p => p.materia === 'razonamiento');
  const razSinVer  = razBanco.filter(p => !historial.includes(p.id));
  const razFuente  = razSinVer.length >= 10 ? razSinVer : razBanco;
  const razonamiento = razFuente.length >= 10
    ? elegirN(razFuente, 10)
    : generarPreguntas10();

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
