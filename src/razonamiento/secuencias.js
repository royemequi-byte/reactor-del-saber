// secuencias.js — genera preguntas de secuencias lógicas
import { elegirUno, enteroAleatorio, barajar } from '../azar.js';

const CONTENIDOS = [
  'Tabla periódica', 'Propiedades de la materia', 'Célula',
  'Ecosistema', 'Reacciones químicas', 'Organismo', 'Nomenclatura básica'
];

export function generarSecuencia() {
  const tipo = enteroAleatorio(1, 4);
  if (tipo === 1) return secuenciaAritmetica();
  if (tipo === 2) return secuenciaGeometrica();
  if (tipo === 3) return secuenciaElementos();
  return secuenciaCiencias();
}

// Secuencia aritmética: a, a+d, a+2d, a+3d, ?
function secuenciaAritmetica() {
  const a = enteroAleatorio(1, 20);
  const d = enteroAleatorio(2, 8);
  const seq = [a, a+d, a+2*d, a+3*d];
  const correcta = a + 4*d;
  const distractores = barajar([correcta + 1, correcta - 1, correcta + d - 1, correcta - d + 2])
    .filter(x => x !== correcta).slice(0, 3);
  const opciones = barajar([correcta, ...distractores]);

  return {
    id: `RAZ-SEC-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'secuencias',
    tema: elegirUno(CONTENIDOS), dificultad: 2,
    enunciado: `🔢 Encuentra el número que sigue en la secuencia:\n\n${seq.join('  →  ')}  →  ❓`,
    opciones: opciones.map(String),
    correcta: opciones.indexOf(correcta),
    explicacion: `La diferencia entre cada término es ${d}. Entonces: ${seq[seq.length-1]} + ${d} = ${correcta}.`,
    tipo: 'razonamiento'
  };
}

// Secuencia geométrica: a, a*r, a*r², a*r³, ?
function secuenciaGeometrica() {
  const a = enteroAleatorio(1, 5);
  const r = enteroAleatorio(2, 3);
  const seq = [a, a*r, a*r*r, a*r*r*r];
  const correcta = a * r*r*r*r;
  const distractores = [correcta + r, correcta - r, correcta + a, correcta * 2]
    .filter(x => x !== correcta && x > 0).slice(0, 3);
  const opciones = barajar([correcta, ...distractores]);

  return {
    id: `RAZ-SEC-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'secuencias',
    tema: 'Tabla periódica', dificultad: 2,
    enunciado: `✖️ Cada término se multiplica por el mismo número. ¿Cuál continúa?\n\n${seq.join('  →  ')}  →  ❓`,
    opciones: opciones.map(String),
    correcta: opciones.indexOf(correcta),
    explicacion: `Se multiplica por ${r} cada vez. Entonces: ${seq[seq.length-1]} × ${r} = ${correcta}.`,
    tipo: 'razonamiento'
  };
}

// Secuencia de números atómicos de elementos
function secuenciaElementos() {
  const grupos = [
    { nombre: 'Gases nobles', elementos: [{s:'He',z:2},{s:'Ne',z:10},{s:'Ar',z:18},{s:'Kr',z:36},{s:'Xe',z:54}] },
    { nombre: 'Metales alcalinos', elementos: [{s:'Li',z:3},{s:'Na',z:11},{s:'K',z:19},{s:'Rb',z:37},{s:'Cs',z:55}] },
    { nombre: 'Halógenos', elementos: [{s:'F',z:9},{s:'Cl',z:17},{s:'Br',z:35},{s:'I',z:53},{s:'At',z:85}] },
  ];
  const grupo = elegirUno(grupos);
  const inicio = enteroAleatorio(0, 1);
  const cuatro = grupo.elementos.slice(inicio, inicio + 4);
  const quinto = grupo.elementos[inicio + 4];

  if (!quinto) return secuenciaAritmetica(); // fallback

  const correcta = quinto.s;
  const distractores = ['Ca','Mg','Fe','Cu','Zn','Al','Si','P'].filter(x => x !== correcta).slice(0,3);
  const opciones = barajar([correcta, ...distractores]);

  return {
    id: `RAZ-SEC-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'secuencias',
    tema: 'Tabla periódica', dificultad: 3,
    enunciado: `⚗️ Esta secuencia pertenece al grupo "${grupo.nombre}" de la tabla periódica. ¿Qué símbolo sigue?\n\n${cuatro.map(e => e.s).join('  →  ')}  →  ❓`,
    opciones,
    correcta: opciones.indexOf(correcta),
    explicacion: `Los ${grupo.nombre} están en el grupo ${grupo.elementos[0].s === 'He' ? 18 : (grupo.elementos[0].s === 'Li' ? 1 : 17)} de la tabla. El siguiente es ${correcta}.`,
    tipo: 'razonamiento'
  };
}

// Secuencia de conceptos científicos
function secuenciaCiencias() {
  const series = [
    {
      tema: 'Organismo',
      enunciado: '🔬 Organización biológica de menor a mayor. ¿Qué sigue después de TEJIDO?',
      secuencia: ['Célula', 'Tejido', '❓'],
      correcta: 'Órgano',
      distractores: ['Sistema', 'Organismo', 'Molécula'],
      explicacion: 'El orden es: Célula → Tejido → Órgano → Sistema → Organismo.'
    },
    {
      tema: 'Reacciones químicas',
      enunciado: '⚗️ Ordena estos estados de la materia de MENOR a MAYOR energía. ¿Qué va después de Líquido?',
      secuencia: ['Sólido', 'Líquido', '❓'],
      correcta: 'Gas',
      distractores: ['Plasma', 'Cristal', 'Polvo'],
      explicacion: 'A mayor energía: Sólido → Líquido → Gas → Plasma.'
    },
    {
      tema: 'Ecosistema',
      enunciado: '🌿 Cadena trófica: Pasto → Conejo → Zorro → ❓',
      correcta: 'Descomponedor',
      distractores: ['Productor', 'Consumidor primario', 'Sol'],
      secuencia: ['Pasto', 'Conejo', 'Zorro', '❓'],
      explicacion: 'Al final de la cadena trófica siempre están los descomponedores que reciclan la materia.'
    },
    {
      tema: 'Propiedades de la materia',
      enunciado: '🌡️ Escala de pH: ácido fuerte → ácido → neutro → ❓',
      correcta: 'Básico (alcalino)',
      distractores: ['Más ácido', 'Neutro', 'Radiactivo'],
      secuencia: ['pH 1-3', 'pH 4-6', 'pH 7', '❓'],
      explicacion: 'La escala va de 0 (ácido fuerte) a 14 (base fuerte). Después del neutro (7) viene lo básico o alcalino.'
    },
  ];

  const s = elegirUno(series);
  const opciones = barajar([s.correcta, ...s.distractores]);
  return {
    id: `RAZ-SEC-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'secuencias',
    tema: s.tema, dificultad: 2,
    enunciado: s.enunciado + (s.secuencia ? `\n\n${s.secuencia.join('  →  ')}` : ''),
    opciones,
    correcta: opciones.indexOf(s.correcta),
    explicacion: s.explicacion,
    tipo: 'razonamiento'
  };
}
