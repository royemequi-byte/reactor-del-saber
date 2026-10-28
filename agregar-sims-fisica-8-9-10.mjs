// agregar-sims-fisica-8-9-10.mjs — sube las preguntas de los 8 simuladores nuevos de Física
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  apiKey:            "AIzaSyBNE8g0il0ISljpCgmk__AtF_AQHMbVfAg",
  authDomain:        "iti-olimpiadas.firebaseapp.com",
  databaseURL:       "https://iti-olimpiadas-default-rtdb.firebaseio.com",
  projectId:         "iti-olimpiadas",
  storageBucket:     "iti-olimpiadas.firebasestorage.app",
  messagingSenderId: "762225015291",
  appId:             "1:762225015291:web:dd4bf9faf01f46823fb35e",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

function base(id, grado, simulador, tema, dificultad) {
  return { id, materia: 'fisica', tipo: 'simulador', simulador, tema, grado, dificultad, origen: 'normal', activa: true, autor: 'iti-docente', imagen: null, imagen2: null };
}

const NUEVAS = [
  // ── Grado 8 — Movimiento (MRU/MRUA) ──────────────────────────────────────
  {
    ...base('SIM-FIS-8-MOV-001', 8, 'movimiento', 'movimiento', 2),
    enunciado: 'En el simulador, ajusta v₀ = 2 m/s y a = 3 m/s² e inicia. ¿Qué velocidad lleva el carro a los 4 s?',
    opciones: ['14 m/s', '12 m/s', '6 m/s', '20 m/s'],
    correcta: 0,
    explicacion: 'v = v₀ + a·t = 2 + 3×4 = 14 m/s.',
  },
  {
    ...base('SIM-FIS-8-MOV-002', 8, 'movimiento', 'movimiento', 2),
    enunciado: 'Con el mismo carro (v₀ = 2 m/s, a = 3 m/s²), ¿qué distancia recorrió en esos 4 s?',
    opciones: ['32 m', '24 m', '8 m', '14 m'],
    correcta: 0,
    explicacion: 'x = v₀t + ½at² = 2×4 + ½×3×16 = 8 + 24 = 32 m.',
  },
  {
    ...base('SIM-FIS-8-MOV-003', 8, 'movimiento', 'movimiento', 2),
    enunciado: 'En el simulador dejas la aceleración en 0 con una velocidad inicial fija (MRU). ¿Qué forma tiene la gráfica posición-tiempo que se dibuja?',
    opciones: ['Una línea recta inclinada', 'Una parábola', 'Una línea horizontal', 'Una curva exponencial'],
    correcta: 0,
    explicacion: 'En MRU la posición crece proporcionalmente al tiempo (x=v₀t), por eso la gráfica x-t es una recta con pendiente igual a v₀.',
  },

  // ── Grado 8 — Leyes de Newton ─────────────────────────────────────────────
  {
    ...base('SIM-FIS-8-NEW-001', 8, 'leyes-newton', 'leyes de Newton', 2),
    enunciado: 'En la pestaña "2ª — F=m·a" del simulador aplicas F=20N a un bloque de masa 4kg, sin fricción. ¿Cuál es la aceleración resultante?',
    opciones: ['5 m/s²', '80 m/s²', '4 m/s²', '0.2 m/s²'],
    correcta: 0,
    explicacion: 'a = F/m = 20/4 = 5 m/s² (Segunda Ley de Newton).',
  },
  {
    ...base('SIM-FIS-8-NEW-002', 8, 'leyes-newton', 'leyes de Newton', 2),
    enunciado: 'En la pestaña "1ª — Inercia", el bloque se desliza sin fricción después de empujarlo. ¿Por qué sigue moviéndose a velocidad constante si nadie lo empuja más?',
    opciones: [
      'Porque ningún objeto cambia su estado de movimiento sin que actúe sobre él una fuerza neta',
      'Porque el movimiento se mantiene por sí solo sin ninguna ley física',
      'Porque la masa del bloque genera su propio impulso constante',
      'Porque la velocidad inicial se duplica con el tiempo',
    ],
    correcta: 0,
    explicacion: 'Primera Ley de Newton (inercia): un cuerpo mantiene su velocidad (incluido el reposo) mientras no actúe sobre él una fuerza neta.',
  },
  {
    ...base('SIM-FIS-8-NEW-003', 8, 'leyes-newton', 'leyes de Newton', 3),
    enunciado: 'En la pestaña "3ª — Acción-Reacción", el patinador A (40 kg) sale con 3 m/s al empujar al patinador B (60 kg), inicialmente en reposo. Usando conservación del momentum (mA·vA = mB·vB), ¿con qué velocidad sale B?',
    opciones: ['2 m/s', '3 m/s', '4.5 m/s', '1 m/s'],
    correcta: 0,
    explicacion: 'mA·vA = mB·vB → 40×3 = 60×vB → vB = 120/60 = 2 m/s. La fuerza que A ejerce sobre B es igual y opuesta a la que B ejerce sobre A (3ª Ley), por eso el momentum total se conserva.',
  },

  // ── Grado 8 — Energía potencial ↔ cinética ───────────────────────────────
  {
    ...base('SIM-FIS-8-EP-001', 8, 'energia-potencial', 'energía', 2),
    enunciado: 'En el simulador sueltas un objeto de masa 2 kg desde una altura de 5 m (g=10 m/s²). ¿Cuál es su energía potencial inicial?',
    opciones: ['100 J', '50 J', '20 J', '200 J'],
    correcta: 0,
    explicacion: 'Ep = m·g·h = 2×10×5 = 100 J.',
  },
  {
    ...base('SIM-FIS-8-EP-002', 8, 'energia-potencial', 'energía', 2),
    enunciado: 'El mismo objeto (m=2kg, h=5m), justo antes de tocar el suelo (toda la Ep ya se convirtió en Ec). ¿Qué velocidad lleva?',
    opciones: ['10 m/s', '5 m/s', '20 m/s', '100 m/s'],
    correcta: 0,
    explicacion: 'Ec = Ep = 100 J = ½mv² → v² = 100 → v = 10 m/s.',
  },
  {
    ...base('SIM-FIS-8-EP-003', 8, 'energia-potencial', 'energía', 2),
    enunciado: 'Mientras el objeto cae en el simulador, ¿qué le ocurre a la energía mecánica total (Ep + Ec)?',
    opciones: [
      'Se mantiene constante — solo se transforma de potencial a cinética',
      'Aumenta constantemente',
      'Disminuye a medida que cae',
      'Se vuelve cero a la mitad de la caída',
    ],
    correcta: 0,
    explicacion: 'Sin fricción ni resistencia del aire, la energía mecánica se conserva: lo que pierde de Ep lo gana exactamente en Ec.',
  },

  // ── Grado 9 — Ondas en una cuerda ─────────────────────────────────────────
  {
    ...base('SIM-FIS-9-OND-001', 9, 'ondas-cuerda', 'ondas', 2),
    enunciado: 'La cuerda del simulador tiene una velocidad de propagación fija de 4 m/s. Si ajustas la frecuencia a 2 Hz, ¿cuál es la longitud de onda?',
    opciones: ['2 m', '8 m', '0.5 m', '4 m'],
    correcta: 0,
    explicacion: 'λ = v/f = 4/2 = 2 m.',
  },
  {
    ...base('SIM-FIS-9-OND-002', 9, 'ondas-cuerda', 'ondas', 2),
    enunciado: 'Si en el simulador subes la amplitud al máximo sin cambiar la frecuencia, ¿qué le pasa a la longitud de onda?',
    opciones: ['No cambia — la amplitud y la longitud de onda son independientes', 'Aumenta proporcionalmente', 'Disminuye a la mitad', 'Se vuelve cero'],
    correcta: 0,
    explicacion: 'La amplitud describe la altura de la onda (energía transportada); la longitud de onda depende solo de v y f, no de la amplitud.',
  },
  {
    ...base('SIM-FIS-9-OND-003', 9, 'ondas-cuerda', 'ondas', 3),
    enunciado: 'Quieres DUPLICAR la longitud de onda en el simulador sin cambiar la velocidad de la cuerda. ¿Qué debes hacer con la frecuencia?',
    opciones: ['Reducirla a la mitad', 'Duplicarla', 'Dejarla igual', 'Cuadruplicarla'],
    correcta: 0,
    explicacion: 'Como v=λf es constante, si λ se duplica, f debe reducirse a la mitad para mantener el mismo producto.',
  },

  // ── Grado 9 — Transferencia de calor ─────────────────────────────────────
  {
    ...base('SIM-FIS-9-CAL-001', 9, 'transferencia-calor', 'calor', 2),
    enunciado: 'En el simulador, el objeto A está a 80°C y el B a 20°C, con la misma masa y material. Los pones en contacto hasta el equilibrio térmico (sin pérdidas al ambiente). ¿Qué temperatura final alcanzan ambos?',
    opciones: ['50°C', '60°C', '40°C', '100°C'],
    correcta: 0,
    explicacion: 'Con masas y materiales iguales, la temperatura de equilibrio es el promedio: (80+20)/2 = 50°C.',
  },
  {
    ...base('SIM-FIS-9-CAL-002', 9, 'transferencia-calor', 'calor', 2),
    enunciado: '¿En qué dirección fluye el calor en el simulador cuando pones los dos objetos en contacto?',
    opciones: ['Siempre del objeto más caliente al más frío, nunca al revés', 'Del más frío al más caliente', 'En ambas direcciones por igual', 'No fluye si los objetos tienen la misma masa'],
    correcta: 0,
    explicacion: 'El calor siempre fluye espontáneamente de mayor a menor temperatura, hasta alcanzar el equilibrio térmico.',
  },
  {
    ...base('SIM-FIS-9-CAL-003', 9, 'transferencia-calor', 'calor', 2),
    enunciado: 'Si subes la conductividad del material a "Alta" en el simulador, ¿qué cambia respecto a dejarla en "Baja"?',
    opciones: [
      'Se alcanza el equilibrio térmico más rápido, pero la temperatura final de equilibrio es la misma',
      'La temperatura final de equilibrio es más alta',
      'El calor deja de fluir',
      'Los objetos nunca llegan al equilibrio',
    ],
    correcta: 0,
    explicacion: 'La conductividad afecta la RAPIDEZ con la que se transfiere el calor, no el punto de equilibrio final, que depende solo de las temperaturas y masas iniciales.',
  },

  // ── Grado 9 — Ley de Coulomb ──────────────────────────────────────────────
  {
    ...base('SIM-FIS-9-COU-001', 9, 'ley-coulomb', 'electromagnetismo', 3),
    enunciado: 'En el simulador colocas q₁ = +2 μC y q₂ = +3 μC separadas 3 m. Usando F = k·q₁·q₂/r² con k = 9×10⁹ N·m²/C², ¿cuál es la fuerza aproximada entre ellas?',
    opciones: ['≈ 0.006 N', '≈ 6 N', '≈ 0.6 N', '≈ 60 N'],
    correcta: 0,
    explicacion: 'F = 9×10⁹ × (2×10⁻⁶)(3×10⁻⁶) / 3² = 9×10⁹ × 6×10⁻¹² / 9 = 6×10⁻³ N = 0.006 N.',
  },
  {
    ...base('SIM-FIS-9-COU-002', 9, 'ley-coulomb', 'electromagnetismo', 2),
    enunciado: 'En el simulador colocas ambas cargas como positivas (mismo signo). ¿Qué observas?',
    opciones: ['Se repelen', 'Se atraen', 'No hay fuerza entre ellas', 'Se neutralizan'],
    correcta: 0,
    explicacion: 'Cargas del mismo signo se repelen; cargas de signo opuesto se atraen.',
  },
  {
    ...base('SIM-FIS-9-COU-003', 9, 'ley-coulomb', 'electromagnetismo', 3),
    enunciado: 'Si en el simulador duplicas la distancia entre las cargas sin cambiar su magnitud, ¿qué le pasa a la fuerza?',
    opciones: ['Se reduce a la cuarta parte', 'Se reduce a la mitad', 'No cambia', 'Se duplica'],
    correcta: 0,
    explicacion: 'Como F es inversamente proporcional a r², al duplicar r la fuerza se divide entre 2²=4.',
  },

  // ── Grado 10 — Sonido y vacío ─────────────────────────────────────────────
  {
    ...base('SIM-FIS-10-SON-001', 10, 'sonido-vacio', 'ondas', 2),
    enunciado: 'En el simulador seleccionas el medio "Vacío" y emites sonido. ¿Qué observas y por qué?',
    opciones: [
      'No se propaga ninguna onda — el sonido es una onda mecánica y necesita un medio material para viajar',
      'Se propaga igual de rápido que en el aire',
      'Se propaga más rápido que en el aire',
      'Se propaga pero en silencio total',
    ],
    correcta: 0,
    explicacion: 'El sonido es una onda mecánica: necesita partículas de un medio (sólido, líquido o gaseoso) que vibren para transmitirse. En el vacío no hay partículas, por lo tanto no hay sonido.',
  },
  {
    ...base('SIM-FIS-10-SON-002', 10, 'sonido-vacio', 'ondas', 2),
    enunciado: 'La velocidad del sonido en el aire es ≈343 m/s. Si una fuente de sonido está a 686 m de distancia, ¿cuánto tarda en llegar el sonido?',
    opciones: ['2 s', '0.5 s', '4 s', '343 s'],
    correcta: 0,
    explicacion: 't = d/v = 686/343 = 2 s.',
  },
  {
    ...base('SIM-FIS-10-SON-003', 10, 'sonido-vacio', 'ondas', 3),
    enunciado: 'En el simulador, el sonido viaja más rápido en el agua (≈1480 m/s) que en el aire (≈343 m/s). ¿Por qué?',
    opciones: [
      'Porque las partículas del agua están más juntas y transmiten la vibración más rápido entre ellas',
      'Porque el agua tiene menos densidad que el aire',
      'Porque el sonido no puede viajar en líquidos',
      'Porque el agua amplifica la frecuencia del sonido',
    ],
    correcta: 0,
    explicacion: 'En un medio más denso, con las partículas más próximas entre sí, la vibración se transmite de una partícula a la siguiente más rápidamente.',
  },

  // ── Grado 10 — Energía eléctrica, Ley de Ohm ─────────────────────────────
  {
    ...base('SIM-FIS-10-OHM-001', 10, 'ley-ohm', 'electromagnetismo', 2),
    enunciado: 'En el simulador ajustas el circuito a V=12V y R=4Ω. ¿Cuál es la corriente que circula?',
    opciones: ['3 A', '48 A', '0.33 A', '16 A'],
    correcta: 0,
    explicacion: 'I = V/R = 12/4 = 3 A (Ley de Ohm).',
  },
  {
    ...base('SIM-FIS-10-OHM-002', 10, 'ley-ohm', 'electromagnetismo', 2),
    enunciado: 'Con el mismo circuito (V=12V, R=4Ω, I=3A), ¿cuál es la potencia eléctrica disipada?',
    opciones: ['36 W', '4 W', '48 W', '3 W'],
    correcta: 0,
    explicacion: 'P = V×I = 12×3 = 36 W.',
  },
  {
    ...base('SIM-FIS-10-OHM-003', 10, 'ley-ohm', 'electromagnetismo', 3),
    enunciado: 'Si en el simulador duplicas la resistencia sin cambiar el voltaje, ¿qué le pasa a la corriente?',
    opciones: ['Se reduce a la mitad', 'Se duplica', 'No cambia', 'Se cuadruplica'],
    correcta: 0,
    explicacion: 'Por I=V/R, si R se duplica y V se mantiene constante, la corriente se reduce a la mitad.',
  },
];

async function main() {
  const snap = await get(ref(db, 'banco-preguntas'));
  const banco = snap.exists() ? snap.val() : [];

  const idsExistentes = new Set(banco.map(p => p.id));
  const porAgregar = NUEVAS.filter(p => !idsExistentes.has(p.id));

  if (porAgregar.length === 0) {
    console.log('✓ Todas las preguntas ya existen en Firebase.');
    process.exit(0);
  }

  const bancoNuevo = [...banco, ...porAgregar];
  await set(ref(db, 'banco-preguntas'), bancoNuevo);
  console.log(`✓ Agregadas ${porAgregar.length} preguntas al banco:`);
  porAgregar.forEach(p => console.log(`  · ${p.id} — ${p.enunciado.slice(0, 60)}…`));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
