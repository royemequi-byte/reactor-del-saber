// config.js — configuración global sincronizada con Firebase
import { ref, get, onValue } from 'firebase/database';
import { db } from './firebase.js';

const CUOTAS_DEFAULT = {
  grado8:  { biologia: 27, fisica: 4, quimica: 4, cts: 0, razonamiento: 4 },
  grado9:  { biologia: 27, fisica: 4, quimica: 4, cts: 0, razonamiento: 4 },
  grado10: { quimica: 19, fisica: 7, biologia: 8, cts: 0, razonamiento: 5 },
};

let cache = {
  habilitado:        false,
  mostrarRespuestas: true,
  ayudasActivas:     true,
  mostrarPuntaje:    false,
  cuotas:            CUOTAS_DEFAULT,
};

export async function initConfig() {
  const snap = await get(ref(db, 'config'));
  if (snap.exists()) {
    const val = snap.val();
    cache = {
      habilitado:        val.habilitado        ?? false,
      mostrarRespuestas: val.mostrarRespuestas  ?? true,
      ayudasActivas:     val.ayudasActivas      ?? true,
      mostrarPuntaje:    val.mostrarPuntaje     ?? false,
      cuotas:            val.cuotas             ?? CUOTAS_DEFAULT,
    };
  }
  onValue(ref(db, 'config'), snap => {
    if (snap.exists()) {
      const val = snap.val();
      cache = {
        habilitado:        val.habilitado        ?? false,
        mostrarRespuestas: val.mostrarRespuestas  ?? true,
        ayudasActivas:     val.ayudasActivas      ?? true,
        mostrarPuntaje:    val.mostrarPuntaje     ?? false,
        cuotas:            val.cuotas             ?? CUOTAS_DEFAULT,
      };
    }
  });
}

export function getConfig() { return cache; }

export function getTotalCuotas(grado) {
  const g = cache.cuotas?.[`grado${grado}`] || {};
  return Object.values(g).reduce((s, n) => s + (Number(n) || 0), 0) || 39;
}
