import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBNE8g0il0ISljpCgmk__AtF_AQHMbVfAg",
  authDomain: "iti-olimpiadas.firebaseapp.com",
  databaseURL: "https://iti-olimpiadas-default-rtdb.firebaseio.com",
  projectId: "iti-olimpiadas",
  storageBucket: "iti-olimpiadas.firebasestorage.app",
  messagingSenderId: "762225015291",
  appId: "1:762225015291:web:dd4bf9faf01f46823fb35e",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const PREGUNTAS = [
  // Q001 — Dilución: sim arranca saturada (6 mol/L), presiona Agregar agua ×2
  {
    id:'SIM-QUI2-10-001', materia:'quimica', tipo:'simulador', simulador:'soluciones',
    tema:'soluciones y concentración — dilución', grado:10, dificultad:2,
    origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`En el laboratorio, la solución de NaCl ya registra 6 mol/L (estado ● SATURADA). El asistente presiona "💧 Agregar agua ×2" para diluirla y lee el nuevo valor en el medidor de CONCENTRACIÓN.

¿Cuál es la nueva concentración y por qué cambió de esa manera?`,
    opciones:[
      'Sube a 12 mol/L porque hay más líquido para disolver',
      'Se mantiene en 6 mol/L porque la cantidad de NaCl no varía',
      'Baja a 3 mol/L porque los mismos moles quedan distribuidos en el doble de volumen',
      'Baja a 0 mol/L porque el NaCl se diluye completamente',
    ], correcta:2,
    explicacion:'Molaridad = moles / litros. Al doblar el volumen (de 1 L a 2 L) manteniendo los mismos 6 mol, la concentración baja a 6/2 = 3 mol/L. El simulador lo confirma: la barra cae a la mitad y el estado cambia de SATURADA a NO SATURADA.',
    imagen:null, imagen2:null,
  },

  // Q002 — Saturación: sim arranca saturada, presiona Agregar NaCl → cristal
  {
    id:'SIM-QUI2-10-002', materia:'quimica', tipo:'simulador', simulador:'soluciones',
    tema:'soluciones y concentración — saturación', grado:10, dificultad:2,
    origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`La solución ya se encuentra en estado ● SATURADA (6 mol/L a 25 °C). Presiona "＋ Agregar NaCl" una vez y observa el cristal que aparece en el simulador y el indicador de estado.

¿Por qué aparece un cristal sin disolver al intentar añadir más sal a una solución ya saturada?`,
    opciones:[
      'Porque el NaCl se descompone en gas cuando la solución está llena',
      'Porque el solvente ya no puede rodear más iones de soluto a esa temperatura; el exceso queda como sólido',
      'Porque el agua se evapora con el exceso de sal',
      'Porque la sal reacciona con el agua y forma un nuevo compuesto',
    ], correcta:1,
    explicacion:'Una solución saturada ha alcanzado el máximo de soluto que el solvente puede mantener disuelto a esa temperatura. Cualquier cantidad adicional no puede ser rodeada por moléculas de agua y precipita como cristal sólido. El simulador muestra ese cristal descendiendo cuando se supera la saturación.',
    imagen:null, imagen2:null,
  },

  // Q003 — Temperatura: sim arranca saturada, presiona Calentar → CASI SATURADA
  {
    id:'SIM-QUI2-10-003', materia:'quimica', tipo:'simulador', simulador:'soluciones',
    tema:'soluciones y concentración — efecto de temperatura', grado:10, dificultad:3,
    origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`Dos compañeros debaten: Laura afirma que calentar una solución saturada de NaCl permite disolver más sal; Sebastián dice que la temperatura no afecta la solubilidad.

La solución ya está en estado ● SATURADA. Presiona "🔥 Calentar +20°C" y observa cómo cambia el indicador de estado.

¿Cuál conclusión respalda lo observado y qué la explica?`,
    opciones:[
      'Laura tiene razón; al aumentar la temperatura, las moléculas de agua tienen mayor energía cinética y pueden disolver más soluto',
      'Sebastián tiene razón; el cambio en el indicador es un error del simulador',
      'Laura tiene razón, pero porque el calor descompone el NaCl en Na y Cl gaseosos',
      'Ambos tienen razón porque la solubilidad cambia en ambas direcciones simultáneamente',
    ], correcta:0,
    explicacion:'Al calentar, las moléculas de agua ganan energía cinética e interactúan con más iones de NaCl, aumentando la solubilidad máxima de 6 a 6.8 mol/L. Por eso el indicador pasa de SATURADA a CASI SATURADA con un solo clic: la misma cantidad de sal ya no supera la nueva capacidad del disolvente. Laura tiene razón.',
    imagen:null, imagen2:null,
  },
];

for (const p of PREGUNTAS) {
  await set(ref(db, `banco-preguntas/${p.id}`), p);
  console.log(`✅ ${p.id} — "${p.tema}"`);
  console.log(`   Correcta: "${p.opciones[p.correcta]}"`);
}

process.exit(0);
