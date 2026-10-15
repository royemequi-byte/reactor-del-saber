// storage.js — subida de imágenes a Firebase Storage
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase.js';

const storage = getStorage(app);

export async function subirImagenPregunta(file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `preguntas/${Date.now()}.${ext}`;
  const snap = await uploadBytes(sRef(storage, path), file);
  return getDownloadURL(snap.ref);
}
