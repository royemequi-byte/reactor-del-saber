// azar.js — funciones de aleatoriedad usando Fisher-Yates (sin sesgos)

// Baraja un array SIN modificar el original, devuelve uno nuevo
export function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Elige N elementos al azar de un array (sin repetición)
export function elegirN(arr, n) {
  return barajar(arr).slice(0, n);
}

// Genera un número entero aleatorio entre min y max (inclusive)
export function enteroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Elige un elemento al azar de un array
export function elegirUno(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
