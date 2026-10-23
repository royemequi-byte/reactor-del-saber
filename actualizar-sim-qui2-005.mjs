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
  id:'SIM-QUI2-10-005', materia:'quimica', tipo:'simulador', simulador:'reacciones',
  tema:'reacciones de oxidación — balanceo', grado:10, dificultad:2, origen:'icfes',
  activa:true, autor:'iti-docente',
  enunciado:
`En una planta metalúrgica se analiza la oxidación del hierro expuesto al aire. Selecciona la reacción "🔴 Oxidación Fe" en el simulador y ajusta los coeficientes hasta que el panel de conservación muestre todos los elementos en equilibrio.

Según la ecuación balanceada que aparece en el panel, ¿cuántas moléculas de O₂ se necesitan para oxidar completamente 4 átomos de Fe y producir 2 unidades de Fe₂O₃?`,
  opciones:[
    '2 moléculas de O₂',
    '3 moléculas de O₂',
    '4 moléculas de O₂',
    '6 moléculas de O₂',
  ], correcta:1,
  explicacion:'La ecuación balanceada es 4Fe + 3O₂ → 2Fe₂O₃. Se necesitan exactamente 3 moléculas de O₂ por cada 4 átomos de Fe. El simulador lo confirma al marcar ✓ en el panel cuando se colocan los coeficientes 4, 3 y 2.',
  imagen:null, imagen2:null,
};

const ruta = `banco-preguntas/${PREGUNTA.id}`;
await set(ref(db, ruta), PREGUNTA);
console.log(`✅ Actualizada: ${PREGUNTA.id}`);
console.log(`   Tema: ${PREGUNTA.tema}`);
console.log(`   Correcta (índice ${PREGUNTA.correcta}): "${PREGUNTA.opciones[PREGUNTA.correcta]}"`);
process.exit(0);
