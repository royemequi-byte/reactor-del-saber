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

const PREGUNTA = {
  id:'SIM-QUI2-10-003', materia:'quimica', tipo:'simulador', simulador:'soluciones',
  tema:'soluciones y concentración — efecto de temperatura', grado:10, dificultad:3,
  origen:'icfes', activa:true, autor:'iti-docente',
  enunciado:
`Dos compañeros debaten: Laura afirma que calentar una solución saturada de NaCl permite disolver más sal; Sebastián dice que la temperatura no afecta la solubilidad.

Para comprobarlo, sigue estos pasos en el simulador:
1. Presiona "＋ Agregar NaCl" varias veces hasta que el indicador muestre "● SATURADA".
2. Luego presiona "🔥 Calentar +20°C" y observa cómo cambia el indicador.

¿Cuál conclusión respalda lo observado y qué la explica?`,
  opciones:[
    'Laura tiene razón; al aumentar la temperatura, las moléculas de agua tienen mayor energía cinética y pueden disolver más soluto',
    'Sebastián tiene razón; el cambio en el indicador es un error de visualización del simulador',
    'Laura tiene razón, pero porque el calor descompone el NaCl en Na y Cl gaseosos, reduciendo la concentración',
    'Ambos tienen razón porque la solubilidad aumenta y disminuye simultáneamente con la temperatura',
  ], correcta:0,
  explicacion:'Al calentar, las moléculas de agua ganan energía cinética y pueden rodear e interactuar con más iones de NaCl, aumentando la solubilidad máxima. Por eso el indicador pasa de SATURADA a CASI SATURADA: la misma cantidad de sal ya no alcanza la nueva capacidad máxima del disolvente a mayor temperatura. Laura tiene razón.',
  imagen:null, imagen2:null,
};

await set(ref(db, `banco-preguntas/${PREGUNTA.id}`), PREGUNTA);
console.log(`✅ Actualizada: ${PREGUNTA.id}`);
console.log(`   Correcta (índice ${PREGUNTA.correcta}): "${PREGUNTA.opciones[PREGUNTA.correcta]}"`);
process.exit(0);
