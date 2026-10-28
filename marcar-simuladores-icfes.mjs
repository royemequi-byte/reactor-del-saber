// marcar-simuladores-icfes.mjs — pone origen:'icfes' a TODAS las preguntas tipo 'simulador'
// (90s de tiempo en vez de 60s, y prioridad de seleccion en el examen)
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

async function main() {
  const snap = await get(ref(db, 'banco-preguntas'));
  if (!snap.exists()) { console.log('Banco vacío.'); process.exit(0); }
  const banco = snap.val();

  let cambiadas = 0;
  const nuevo = banco.map(p => {
    if (p.tipo === 'simulador' && p.origen !== 'icfes') {
      cambiadas++;
      return { ...p, origen: 'icfes' };
    }
    return p;
  });

  if (cambiadas === 0) {
    console.log('✓ Todas las preguntas de simulador ya eran origen:icfes.');
    process.exit(0);
  }

  await set(ref(db, 'banco-preguntas'), nuevo);
  console.log(`✓ Marcadas ${cambiadas} preguntas de simulador como origen:icfes.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
