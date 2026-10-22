// agregar-sims.mjs — sube las preguntas de simulador a Firebase
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
  // ── Física Grado 8 — Estados de la Materia ──────────────────────────────
  {
    id:         'SIM-FIS-8-001',
    materia:    'fisica',
    tipo:       'simulador',
    simulador:  'estados-materia',
    tema:       'estados de la materia',
    grado:      8,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Observa el simulador y mueve el slider de temperatura.\n¿En qué estado de la materia las partículas tienen MAYOR energía cinética y mayor separación entre sí?',
    opciones:   ['Sólido', 'Líquido', 'Gaseoso', 'Plasma'],
    correcta:   2,
    explicacion: 'En el estado GASEOSO las partículas tienen mayor energía cinética (se mueven muy rápido) y están muy separadas entre sí. En el sólido vibran en posición fija; en el líquido fluyen pero se mantienen próximas.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-FIS-8-002',
    materia:    'fisica',
    tipo:       'simulador',
    simulador:  'estados-materia',
    tema:       'estados de la materia',
    grado:      8,
    dificultad: 1,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Coloca el slider de temperatura al mínimo. ¿Qué estado de la materia observas?\n¿Cuál es la característica principal de ese estado?',
    opciones:   [
      'Gaseoso — las partículas se mueven libremente',
      'Líquido — las partículas fluyen sin forma fija',
      'Sólido — las partículas vibran en posiciones fijas',
      'Plasma — las partículas están ionizadas',
    ],
    correcta:   2,
    explicacion: 'A temperatura baja las partículas forman el estado SÓLIDO: están ordenadas en una estructura rígida y solo vibran en torno a su posición fija, por eso mantienen forma y volumen definidos.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-FIS-8-003',
    materia:    'fisica',
    tipo:       'simulador',
    simulador:  'estados-materia',
    tema:       'estados de la materia',
    grado:      8,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Mueve el slider de temperatura de frío a caliente y observa las transiciones.\n¿En qué orden correcto ocurren los cambios de estado al AUMENTAR la temperatura?',
    opciones:   [
      'Gas → Líquido → Sólido',
      'Sólido → Gas → Líquido',
      'Sólido → Líquido → Gas',
      'Líquido → Sólido → Gas',
    ],
    correcta:   2,
    explicacion: 'Al aumentar la temperatura: Sólido → (fusión) → Líquido → (vaporización) → Gas. La energía cinética aumenta hasta romper las fuerzas de atracción entre partículas.',
    imagen:  null,
    imagen2: null,
  },

  // ── Química Grado 10 — Gases Ideales ────────────────────────────────────
  {
    id:         'SIM-QUI-10-001',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'gases-ideales',
    tema:       'gases ideales',
    grado:      10,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Mantén la temperatura constante (300 K) y comprime el pistón hasta la mitad del volumen inicial.\nSegún la Ley de Boyle, ¿qué le ocurre a la presión del gas?',
    opciones:   ['Se mantiene igual', 'Se duplica', 'Se divide a la mitad', 'Aumenta 4 veces'],
    correcta:   1,
    explicacion: 'Ley de Boyle: P₁V₁ = P₂V₂ (T constante). Si V₂ = V₁/2, entonces P₂ = 2·P₁. La presión se DUPLICA porque las partículas chocan el doble de seguido contra las paredes del recipiente.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-QUI-10-002',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'gases-ideales',
    tema:       'gases ideales',
    grado:      10,
    dificultad: 2,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Fija el pistón (volumen constante) y aumenta la temperatura de 300 K a 600 K.\n¿Qué le ocurre a la presión? (Ley de Gay-Lussac)',
    opciones:   ['Disminuye a la mitad', 'No cambia', 'Se duplica', 'Se cuadruplica'],
    correcta:   2,
    explicacion: 'Ley de Gay-Lussac: P/T = constante (V fijo). Si T₂ = 2·T₁, entonces P₂ = 2·P₁. Al duplicar la temperatura (en Kelvin), las partículas tienen más energía y golpean las paredes con mayor fuerza y frecuencia.',
    imagen:  null,
    imagen2: null,
  },
  {
    id:         'SIM-QUI-10-003',
    materia:    'quimica',
    tipo:       'simulador',
    simulador:  'gases-ideales',
    tema:       'gases ideales',
    grado:      10,
    dificultad: 3,
    origen:     'normal',
    activa:     true,
    autor:      'iti-docente',
    enunciado:  'Un gas a 300 K y 1 atm ocupa 1 L. Si aumentas la temperatura a 600 K y comprimes el volumen a 0.5 L, ¿cuántas veces aumenta la presión?\n(Usa la ley combinada: P₁V₁/T₁ = P₂V₂/T₂)',
    opciones:   ['2 veces', '3 veces', '4 veces', 'No cambia'],
    correcta:   2,
    explicacion: 'Ley combinada: P₂ = P₁·(V₁/V₂)·(T₂/T₁) = 1 atm × (1/0.5) × (600/300) = 1 × 2 × 2 = 4 atm. La presión se CUADRUPLICA porque tanto la reducción del volumen como el aumento de temperatura la incrementan simultáneamente.',
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

  const bancoBanco = [...banco, ...porAgregar];
  await set(ref(db, 'banco-preguntas'), bancoBanco);
  console.log(`✓ Agregadas ${porAgregar.length} preguntas al banco:`);
  porAgregar.forEach(p => console.log(`  · ${p.id} — ${p.enunciado.slice(0, 60)}…`));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
