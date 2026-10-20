// subir-banco.mjs — sincroniza banco-preguntas.json con Firebase (NUNCA borra)
// Agrega las preguntas del JSON que no existan en Firebase; preserva todo lo demás.
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Leer JSON local
const rutaBanco = path.join(__dirname, 'data', 'banco-preguntas.json');
const bancoJSON = JSON.parse(readFileSync(rutaBanco, 'utf8'));
console.log(`JSON local: ${bancoJSON.length} preguntas`);

// Leer Firebase
const snap = await get(ref(db, 'banco-preguntas'));
const bancoFirebase = snap.exists() ? snap.val() : [];
console.log(`Firebase actual: ${bancoFirebase.length} preguntas`);

// Mergear: Firebase tiene prioridad; agregar del JSON solo lo que no exista
const idsFirebase = new Set(bancoFirebase.map(q => q.id));
const nuevas = bancoJSON.filter(q => !idsFirebase.has(q.id));
const merged = [...bancoFirebase, ...nuevas];

console.log(`Preguntas nuevas desde JSON: ${nuevas.length}`);
console.log(`Total a subir: ${merged.length}`);

await set(ref(db, 'banco-preguntas'), merged);
console.log('✓ Banco sincronizado en Firebase Realtime Database');

const porMateria = {};
merged.forEach(q => { porMateria[q.materia] = (porMateria[q.materia] || 0) + 1; });
Object.entries(porMateria).sort().forEach(([m, n]) => console.log(`  ${m}: ${n}`));

process.exit(0);
