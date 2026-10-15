// estado.js — estado global del juego en memoria durante la partida

export const estado = {
  // Datos del estudiante actual
  estudiante: {
    nombre: '',
    grado: null,
    curso: '',
    avatar: ''
  },

  // Progreso del examen
  preguntaActual: 0,       // índice de la pregunta que se muestra (0 a 28)
  preguntas: [],           // array con las 29 preguntas armadas para este examen
  respuestas: [],          // array de { correcta: bool, puntaje: number } por pregunta

  // Puntaje del juego
  puntaje: 0,
  racha: 0,                // aciertos seguidos
  multiplicador: 1,        // 1 | 1.5 | 2 | 3

  // Poderes (true = disponible, false = ya usado)
  poderes: {
    catalizador: true,     // elimina 2 opciones incorrectas
    reposo: true,          // congela el reloj 15s
    isotopo: true          // cambia la pregunta por otra del mismo tema
  },

  // Tiempo
  tiempoRestante: 30,      // segundos del reloj actual
  tiempoTotal: 0,          // segundos totales usados en el examen

  // Audio
  volumen: 0.7,
  silencio: false,

  // Nota final calculada (se llena al terminar)
  notaFinal: 0,
  aciertos: {
    ciencias: 0,           // de 19
    razonamiento: 0        // de 10
  }
};

// Reinicia el estado para un nuevo intento (conserva preferencias de audio)
export function resetearEstado() {
  const volGuardado = estado.volumen;
  const silGuardado = estado.silencio;

  estado.estudiante    = { nombre: '', grado: null, curso: '', avatar: '' };
  estado.preguntaActual = 0;
  estado.preguntas     = [];
  estado.respuestas    = [];
  estado.puntaje       = 0;
  estado.racha         = 0;
  estado.multiplicador = 1;
  estado.poderes       = { catalizador: true, reposo: true, isotopo: true };
  estado.tiempoRestante = 30;
  estado.tiempoTotal   = 0;
  estado.notaFinal     = 0;
  estado.aciertos      = { ciencias: 0, razonamiento: 0 };

  estado.volumen  = volGuardado;
  estado.silencio = silGuardado;
}

// Calcula la nota final (Opción B: 80% ciencias + 20% razonamiento, escala 0-5)
export function calcularNota() {
  const pctCiencias     = estado.aciertos.ciencias / 19;
  const pctRazonamiento = estado.aciertos.razonamiento / 10;
  const nota = (pctCiencias * 0.8 + pctRazonamiento * 0.2) * 5;
  estado.notaFinal = Math.round(nota * 10) / 10; // 1 decimal
  return estado.notaFinal;
}
