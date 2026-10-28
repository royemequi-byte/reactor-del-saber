// agregar-sims-nuclear-osmosis.mjs — sube las preguntas nuevas de simulador a Firebase:
// reacción nuclear, presión osmótica, y volumen-temperatura (reutiliza gases-ideales)
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

const NUEVAS = [
  // ── Física Grado 10 — Reacción Nuclear y Producción de Energía ──────────
  {
    id:         'SIM-FIS-10-NUC-001',
    materia:    'fisica',
    tipo:       'simulador',
    simulador:  'reaccion-nuclear',
    tema:       'reacciones nucleares',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Por cada fisión se liberan 3 neutrones nuevos. Si las barras de control absorben 2 de cada 3 neutrones liberados (dejando que solo 1 continúe la reacción en cadena), ¿cuál es el factor de multiplicación k y qué estado representa?',
    opciones:   ['k = 1 → CRÍTICA', 'k = 3 → SUPERCRÍTICA', 'k = 0.33 → SUBCRÍTICA', 'k = 2 → fuera de control'],
    correcta:   0,
    explicacion: 'k = neutrones que continúan la cadena / neutrón que la inició = 1/1 = 1. Un reactor en operación normal se mantiene en k=1 (crítico): por cada neutrón que causa una fisión, exactamente un neutrón nuevo continúa la cadena a ritmo constante y controlado — la base de la producción sostenida de energía eléctrica. k>1 (supercrítico) dispara la reacción sin control; k<1 (subcrítico) la apaga.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-FIS-10-NUC-002',
    materia:    'fisica',
    tipo:       'simulador',
    simulador:  'reaccion-nuclear',
    tema:       'reacciones nucleares',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'En la fisión de un núcleo de ²³⁵U, el defecto de masa es aproximadamente Δm = 3.2×10⁻²⁸ kg. Usando E = mc² (c = 3×10⁸ m/s), ¿cuál es el orden de magnitud de la energía liberada por ESA fisión?',
    opciones:   ['≈ 10⁻¹¹ J', '≈ 10⁻²⁸ J', '≈ 10⁵ J', '≈ 10⁻³ J'],
    correcta:   0,
    explicacion: 'E = Δm·c² = 3.2×10⁻²⁸ kg × (3×10⁸ m/s)² = 2.88×10⁻¹¹ J ≈ 10⁻¹¹ J. Es una cantidad minúscula por átomo, pero al multiplicarla por los ~10²⁴ átomos que se fisionan por segundo en un reactor, se explica la enorme potencia que entrega una central nuclear con apenas unos kilogramos de combustible.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-FIS-10-NUC-003',
    materia:    'fisica',
    tipo:       'simulador',
    simulador:  'reaccion-nuclear',
    tema:       'reacciones nucleares',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Observa el reactor del simulador (fisión de núcleos pesados). ¿Por qué tanto la FISIÓN de núcleos pesados (como ²³⁵U) como la FUSIÓN de núcleos livianos (como el hidrógeno) liberan energía, si son procesos opuestos?',
    opciones:   [
      'Porque ambos procesos acercan los núcleos resultantes al hierro-56, el núcleo más estable',
      'Porque ambos procesos aumentan la masa total del sistema',
      'Porque la fisión siempre libera más energía que la fusión en cualquier caso',
      'Porque ambos requieren temperaturas de millones de grados para iniciarse',
    ],
    correcta:   0,
    explicacion: 'La curva de energía de enlace por nucleón tiene su máximo en el hierro-56 (el núcleo más estable). Tanto partir núcleos pesados (fisión) como unir núcleos livianos (fusión) acerca el resultado a ese pico de estabilidad, liberando como energía la diferencia de energía de enlace entre el estado inicial y el final.',
    imagen:  null,
    imagen2: null,
  },

  // ── Química Grado 10 — Presión Osmótica ──────────────────────────────────
  {
    id:         'SIM-QUI-10-OSM-001',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'presion-osmotica',
    tema:       'propiedades coligativas',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Ajusta el simulador a una concentración de 0.3 M de NaCl y una temperatura de 300 K. Usando π = iMRT (i = 2 para NaCl porque se disocia en 2 iones, R = 0.082 atm·L/mol·K), ¿cuál es la presión osmótica aproximada?',
    opciones:   ['≈ 14.8 atm', '≈ 7.4 atm', '≈ 0.6 atm', '≈ 1.48 atm'],
    correcta:   0,
    explicacion: 'π = iMRT = 2 × 0.3 mol/L × 0.082 atm·L/(mol·K) × 300 K ≈ 14.8 atm. El factor de van\'t Hoff i=2 es clave: como el NaCl se disocia en Na⁺ y Cl⁻, cada fórmula unidad aporta 2 partículas disueltas — la presión osmótica depende del NÚMERO de partículas de soluto, no de "cuánta sal" hay en términos de fórmulas.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-QUI-10-OSM-002',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'presion-osmotica',
    tema:       'propiedades coligativas',
    grado:      10,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'En la vista biológica del simulador, sube la concentración hasta colocar la célula en una solución HIPERTÓNICA (más concentrada que su citoplasma). ¿Qué le ocurre a la célula y por qué, en términos del flujo neto de agua?',
    opciones:   [
      'Se encoge (crenación), porque el agua sale de la célula hacia la solución más concentrada',
      'Se hincha y puede estallar, porque el agua entra a la célula',
      'No cambia, porque la membrana es impermeable al agua',
      'Se encoge porque el soluto entra a la célula',
    ],
    correcta:   0,
    explicacion: 'El agua se mueve por ósmosis desde donde hay MENOS soluto hacia donde hay MÁS soluto, buscando igualar concentraciones a ambos lados de la membrana. En un ambiente hipertónico el agua sale de la célula, que se encoge — ese es el fenómeno de crenación que ves en el simulador.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-QUI-10-OSM-003',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'presion-osmotica',
    tema:       'propiedades coligativas',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'En la vista física del simulador, aumenta la presión externa aplicada hasta superar la presión osmótica natural (π). ¿Qué ocurre con el flujo de agua, y en qué aplicación real de la vida cotidiana se usa este principio?',
    opciones:   [
      'El agua fluye en reversa, desde la solución concentrada hacia el agua pura — es el principio de las plantas desalinizadoras',
      'El flujo se detiene por completo y nunca puede revertirse',
      'El soluto empieza a cruzar la membrana junto con el agua',
      'La presión externa no afecta el sistema, solo la temperatura lo hace',
    ],
    correcta:   0,
    explicacion: 'Cuando la presión aplicada supera π, se fuerza al agua a moverse en contra de su gradiente natural de concentración. Esto es ósmosis inversa, el principio detrás de las plantas desalinizadoras de agua de mar y de muchos filtros de purificación domésticos.',
    imagen:  null,
    imagen2: null,
  },

  // ── Química Grado 10 — Leyes de los Gases: Volumen y Temperatura (reutiliza gases-ideales) ──
  {
    id:         'SIM-QUI-10-VT-001',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'gases-ideales',
    tema:       'leyes de los gases',
    grado:      10,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Fija el pistón en un valor y mantenlo FIJO mientras subes la temperatura de 200 K a 500 K en el simulador. Si en un sistema real quisieras mantener la presión aproximadamente constante mientras la temperatura sube, ¿qué tendrías que hacer con el volumen (pistón)?',
    opciones:   [
      'Aumentarlo, porque a presión constante el volumen y la temperatura son directamente proporcionales',
      'Disminuirlo',
      'Mantenerlo igual',
      'Es imposible mantener la presión constante si la temperatura cambia',
    ],
    correcta:   0,
    explicacion: 'Ley de Charles: V₁/T₁ = V₂/T₂ a presión constante. Si la temperatura sube, el volumen debe aumentar en la misma proporción para que la presión no cambie — son directamente proporcionales.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-QUI-10-VT-002',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'gases-ideales',
    tema:       'leyes de los gases',
    grado:      10,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Un gas ocupa 2 L a 250 K. Si se calienta hasta 500 K manteniendo la presión constante, ¿cuál sería el nuevo volumen según la Ley de Charles?',
    opciones:   ['4 L', '1 L', '2 L', '8 L'],
    correcta:   0,
    explicacion: 'V₂ = V₁ × (T₂/T₁) = 2 L × (500 K / 250 K) = 2 L × 2 = 4 L.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-QUI-10-VT-003',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'gases-ideales',
    tema:       'leyes de los gases',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  '¿Por qué la Ley de Charles (relación volumen-temperatura) es un caso particular de la Ley general de los gases ideales PV = nRT, y qué variable debe mantenerse constante para que se cumpla?',
    opciones:   [
      'La presión se mantiene constante',
      'El volumen se mantiene constante',
      'La temperatura se mantiene constante',
      'El número de moles varía',
    ],
    correcta:   0,
    explicacion: 'Si P y n son constantes en PV=nRT, entonces V/T = nR/P = constante, que es exactamente la Ley de Charles. Es el mismo principio general, solo que aislando qué variable se deja fija.',
    imagen:  null,
    imagen2: null,
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
