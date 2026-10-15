// examen.js — arma las 29 preguntas aleatorias de cada examen
import { barajar, elegirN } from './azar.js';
import { generarPreguntas10 } from './razonamiento/index.js';

import { getBanco } from './banco.js';

// Claves para recordar preguntas recientes del estudiante (evitar repetición)
const CLAVE_HISTORIAL = (nombre, grado) => `historial_${nombre}_${grado}`;

/**
 * Arma el examen completo de 29 preguntas:
 *   - 19 de ciencias (química + física) del banco JSON
 *   - 10 de razonamiento (placeholders hasta Fase 3)
 * Devuelve array de objetos pregunta con opciones ya barajadas.
 */
export function armarExamen(estudiante) {
  const banco = getBanco().filter(p => p.activa);

  // Recuperar IDs de las últimas 2 partidas del mismo estudiante
  const claveHistorial = CLAVE_HISTORIAL(estudiante.nombre, estudiante.grado);
  const historial = JSON.parse(localStorage.getItem(claveHistorial) || '[]');

  // Banco disponible: preferir preguntas no vistas recientemente
  const disponibles = banco.filter(p =>
    !historial.includes(p.id) &&
    ['quimica','fisica','biologia'].includes(p.materia)
  );
  const bancoCiencias = banco.filter(p => ['quimica','fisica','biologia'].includes(p.materia));
  const bancoPrioritario = disponibles.length >= 19 ? disponibles : bancoCiencias;

  // Elegir 19 preguntas de ciencias al azar (química + física + biología)
  const ciencias = elegirN(bancoPrioritario, 19);

  // Las 10 de razonamiento — generadas por código, siempre distintas
  const razonamiento = generarPreguntas10();

  // Mezclar las 29 intercalando bloques
  const todas = barajar([...ciencias, ...razonamiento]);

  // Barajar opciones de cada pregunta y recalcular índice correcto
  return todas.map(p => barajarOpciones(p));
}

/**
 * Baraja las opciones de una pregunta y recalcula qué índice es la correcta.
 */
function barajarOpciones(pregunta) {
  const opcionCorrecta = pregunta.opciones[pregunta.correcta];
  const opcionesBarajadas = barajar(pregunta.opciones);
  const nuevaCorrecta = opcionesBarajadas.indexOf(opcionCorrecta);

  return {
    ...pregunta,
    opciones: opcionesBarajadas,
    correcta: nuevaCorrecta
  };
}

/**
 * Guarda los IDs del examen actual en el historial del estudiante.
 * Mantiene solo las últimas 2 partidas (38 IDs máx).
 */
export function guardarHistorial(estudiante, preguntas) {
  const clave = CLAVE_HISTORIAL(estudiante.nombre, estudiante.grado);
  const ids = preguntas
    .filter(p => p.tipo !== 'razonamiento')
    .map(p => p.id);
  const historialPrevio = JSON.parse(localStorage.getItem(clave) || '[]');
  const nuevo = [...historialPrevio, ...ids].slice(-38); // últimas 38 preguntas
  localStorage.setItem(clave, JSON.stringify(nuevo));
}

