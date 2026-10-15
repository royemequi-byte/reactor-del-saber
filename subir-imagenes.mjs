import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';

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
const storage = getStorage(app);

// Test con un archivo pequeño
const testBuf = Buffer.from('test');
const sRef = ref(storage, 'preguntas/test.txt');
try {
  const snap = await uploadBytes(sRef, testBuf, { contentType: 'text/plain' });
  const url = await getDownloadURL(snap.ref);
  console.log('✅ Storage funciona:', url);
} catch (err) {
  console.error('❌ Error completo:', JSON.stringify(err, null, 2));
  console.error('Mensaje:', err.message);
  console.error('Código:', err.code);
  console.error('ServerResponse:', err.serverResponse);
}
