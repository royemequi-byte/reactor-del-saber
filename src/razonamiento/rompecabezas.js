// rompecabezas.js — ordena pasos de un proceso científico
import { elegirUno, barajar } from '../azar.js';

const PROCESOS = [
  {
    tema: 'Célula',
    nombre: 'Mitosis (división celular)',
    pasos: ['1. La célula duplica su ADN', '2. Los cromosomas se condensan', '3. La membrana nuclear se disuelve', '4. Los cromosomas se separan hacia los polos', '5. Se forman dos células hijas idénticas'],
  },
  {
    tema: 'Reacciones químicas',
    nombre: 'Fotosíntesis',
    pasos: ['1. La planta absorbe luz solar con la clorofila', '2. Capta CO₂ del ambiente por los estomas', '3. Absorbe agua por las raíces', '4. Convierte CO₂ + H₂O + luz en glucosa', '5. Libera O₂ como subproducto'],
  },
  {
    tema: 'Ecosistema',
    nombre: 'Ciclo del agua',
    pasos: ['1. El sol calienta el agua de océanos y ríos', '2. El agua se evapora y sube como vapor', '3. El vapor se condensa formando nubes', '4. Las nubes producen lluvia o nieve', '5. El agua regresa a ríos, lagos y suelo'],
  },
  {
    tema: 'Propiedades de la materia',
    nombre: 'Separación por destilación',
    pasos: ['1. Se calienta la mezcla líquida', '2. El componente de menor punto de ebullición se vaporiza primero', '3. El vapor viaja por el condensador', '4. El vapor se enfría y vuelve a ser líquido', '5. El destilado se recolecta en otro recipiente'],
  },
  {
    tema: 'Organismo',
    nombre: 'Digestión humana',
    pasos: ['1. La boca tritura y mezcla el alimento con saliva', '2. El esófago transporta el bolo hacia el estómago', '3. El estómago mezcla con jugos gástricos ácidos', '4. El intestino delgado absorbe nutrientes', '5. El intestino grueso absorbe agua y elimina desechos'],
  },
  {
    tema: 'Tabla periódica',
    nombre: 'Formación de una sal (NaCl)',
    pasos: ['1. El sodio (Na) tiene 1 electrón de valencia', '2. El cloro (Cl) necesita 1 electrón para completar su capa', '3. El Na cede su electrón al Cl', '4. Se forman los iones Na⁺ y Cl⁻', '5. La atracción iónica forma el cristal de NaCl'],
  },
];

export function generarRompecabezas() {
  const proceso = elegirUno(PROCESOS);
  const n = proceso.pasos.length;

  // Elegir aleatoriamente un paso a identificar
  const posicion = Math.floor(Math.random() * n);
  const pasoCorr = proceso.pasos[posicion];

  // Mostrar todos los pasos MENOS el elegido (reemplazado por ❓)
  const pasosVisibles = proceso.pasos.map((p, i) => i === posicion ? `  ❓  ` : p);

  // Distractores: pasos de OTRO proceso
  const otrosProcesos = PROCESOS.filter(p => p.nombre !== proceso.nombre);
  const distract = barajar(otrosProcesos.flatMap(p => p.pasos)).slice(0, 3);

  const opciones = barajar([pasoCorr, ...distract]);

  return {
    id: `RAZ-ROM-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'rompecabezas',
    tema: proceso.tema, dificultad: 2,
    enunciado: `🧩 Proceso: "${proceso.nombre}"\n\nElige el paso que falta (❓) para completar la secuencia:\n\n${pasosVisibles.join('\n')}`,
    opciones,
    correcta: opciones.indexOf(pasoCorr),
    explicacion: `El paso faltante es: "${pasoCorr}". Así se completa correctamente el proceso de ${proceso.nombre}.`,
    tipo: 'razonamiento'
  };
}
