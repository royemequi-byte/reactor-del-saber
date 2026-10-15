// codigos.js — interpreta mensajes cifrados con símbolos científicos
import { elegirUno, barajar, enteroAleatorio } from '../azar.js';

export function generarCodigo() {
  const tipo = enteroAleatorio(1, 3);
  if (tipo === 1) return codigoElementos();
  if (tipo === 2) return codigoCesar();
  return codigoNumerico();
}

// Código con símbolos de elementos: descifra la palabra
function codigoElementos() {
  const claves = [
    {
      tema: 'Tabla periódica',
      enunciado: '🔐 Usando el NÚMERO ATÓMICO como código:\nH=1  C=6  N=7  O=8  Na=11  Mg=12  P=15\n\n¿Qué palabra oculta el código: 6 - 1 - 6 - 8 ?',
      correcta: 'C-H-C-O (compuesto orgánico con Carbono, Hidrógeno y Oxígeno)',
      distractores: ['N-H-N-O', 'Na-H-Na-P', 'Mg-C-Mg-N'],
      explicacion: 'Los números atómicos 6=C, 1=H, 6=C, 8=O corresponden a elementos que forman compuestos orgánicos como azúcares.'
    },
    {
      tema: 'Tabla periódica',
      enunciado: '🔐 Descifra el mensaje con símbolos de elementos:\n\n  Au + Ag + Cu = ?  (pista: premios en competencias)',
      correcta: 'Oro, Plata y Bronce (los tres podios)',
      distractores: ['Tres metales tóxicos', 'Tres gases nobles', 'Tres ácidos fuertes'],
      explicacion: 'Au = Oro (1er lugar), Ag = Plata (2do lugar), Cu = Cobre/Bronce (3er lugar). ¡Como en este podio!'
    },
    {
      tema: 'Nomenclatura básica',
      enunciado: '🔐 Cada símbolo representa una letra del nombre:\n\nH₂O → "AGUA"\nNaCl → ?\n\n¿Qué sustancia representa NaCl?',
      correcta: 'Sal (cloruro de sodio)',
      distractores: ['Azúcar (sacarosa)', 'Vinagre (ácido acético)', 'Agua oxigenada'],
      explicacion: 'NaCl = Cloruro de sodio = sal de cocina. Sodio (Na) + Cloro (Cl) forman este cristal blanco.'
    },
  ];

  const c = elegirUno(claves);
  const opciones = barajar([c.correcta, ...c.distractores]);
  return {
    id: `RAZ-COD-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'codigos',
    tema: c.tema, dificultad: 3,
    enunciado: c.enunciado,
    opciones,
    correcta: opciones.indexOf(c.correcta),
    explicacion: c.explicacion,
    tipo: 'razonamiento'
  };
}

// Código César aplicado a vocabulario científico
function codigoCesar() {
  // Desplazamiento fijo de +3 en el alfabeto (A→D, B→E, etc.)
  const palabras = [
    { original: 'CELULA', cifrada: 'FHOXOD', tema: 'Célula' },
    { original: 'ATOMO',  cifrada: 'DWRPR',  tema: 'Tabla periódica' },
    { original: 'ACIDO',  cifrada: 'DFLGR',  tema: 'Propiedades de la materia' },
    { original: 'GEN',    cifrada: 'JHQ',    tema: 'Organismo' },
    { original: 'AGUA',   cifrada: 'DJXD',   tema: 'Reacciones químicas' },
    { original: 'ADN',    cifrada: 'DGQ',    tema: 'Célula' },
  ];

  const p = elegirUno(palabras);
  const distractores = palabras
    .filter(x => x.original !== p.original)
    .slice(0, 3)
    .map(x => x.original);

  const opciones = barajar([p.original, ...distractores]);

  return {
    id: `RAZ-COD-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'codigos',
    tema: p.tema, dificultad: 2,
    enunciado: `🔐 Código César (cada letra avanza 3 posiciones en el alfabeto):\nEjemplo: A→D, B→E, C→F...\n\n¿Qué palabra científica oculta este código?\n\n  " ${p.cifrada} "`,
    opciones,
    correcta: opciones.indexOf(p.original),
    explicacion: `"${p.cifrada}" descifrado con César +3 es "${p.original}". Cada letra se retrocede 3 posiciones: ${p.cifrada} → ${p.original}.`,
    tipo: 'razonamiento'
  };
}

// Código numérico: posición en el abecedario
function codigoNumerico() {
  const mensajes = [
    {
      tema: 'Ecosistema',
      enunciado: '🔢 Cada número es la posición de una letra en el abecedario (A=1, B=2, C=3...):\n\n  2 - 9 - 15 - 13 - 1\n\n¿Qué palabra forman?',
      correcta: 'BIOMA',
      distractores: ['CLIMA', 'FAUNA', 'TIGRE'],
      explicacion: 'B=2, I=9, O=15, M=13, A=1 → BIOMA. Un bioma es una gran región del planeta con características climáticas y biológicas propias.'
    },
    {
      tema: 'Célula',
      enunciado: '🔢 Descifra usando A=1, B=2, C=3...\n\n  1 - 4 - 14\n\n¿Qué molécula de la biología forma este código?',
      correcta: 'ADN',
      distractores: ['ATP', 'ARN', 'ADP'],
      explicacion: 'A=1, D=4, N=14 → ADN (Ácido Desoxirribonucleico). Contiene la información genética de todos los seres vivos.'
    },
    {
      tema: 'Propiedades de la materia',
      enunciado: '🔢 Descifra (A=1, B=2, C=3...):\n\n  7 - 1 - 19\n\n¿Qué estado de la materia forman?',
      correcta: 'GAS',
      distractores: ['SOL', 'ION', 'LUZ'],
      explicacion: 'G=7, A=1, S=19 → GAS. Estado de la materia sin forma ni volumen propio; sus partículas se mueven libremente.'
    },
    {
      tema: 'Reacciones químicas',
      enunciado: '🔢 Cada número = posición en el abecedario (A=1...):\n\n  9 - 15 - 14\n\n¿Qué partícula subatómica forman?',
      correcta: 'ION',
      distractores: ['GEN', 'SOL', 'RED'],
      explicacion: 'I=9, O=15, N=14 → ION. Un ion es un átomo o molécula con carga eléctrica (perdió o ganó electrones).'
    },
  ];

  const m = elegirUno(mensajes);
  const opciones = barajar([m.correcta, ...m.distractores]);

  return {
    id: `RAZ-COD-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'codigos',
    tema: m.tema, dificultad: 2,
    enunciado: m.enunciado,
    opciones,
    correcta: opciones.indexOf(m.correcta),
    explicacion: m.explicacion,
    tipo: 'razonamiento'
  };
}
