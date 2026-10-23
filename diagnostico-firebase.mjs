import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

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

const rutas = ['banco-preguntas', 'historial', 'config', 'actividad-actual'];

for (const ruta of rutas) {
  const snap = await get(ref(db, ruta));
  if (!snap.exists()) {
    console.log(`❌ /${ruta} — VACÍO`);
  } else {
    const val = snap.val();
    const count = typeof val === 'object' ? Object.keys(val).length : 1;
    console.log(`✅ /${ruta} — ${count} entradas`);
  }
}

process.exit(0);
