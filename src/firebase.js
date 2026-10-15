// firebase.js — inicialización de Firebase
// ⚠️ Reemplaza los valores PEGA_AQUI con tu configuración de Firebase Console
import { initializeApp } from 'firebase/app';
import { getDatabase }   from 'firebase/database';

const firebaseConfig = {
  apiKey:            "PEGA_AQUI_TU_API_KEY",
  authDomain:        "PEGA_AQUI_TU_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://PEGA_AQUI_TU_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "PEGA_AQUI_TU_PROJECT_ID",
  storageBucket:     "PEGA_AQUI_TU_PROJECT_ID.appspot.com",
  messagingSenderId: "PEGA_AQUI_TU_SENDER_ID",
  appId:             "PEGA_AQUI_TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
