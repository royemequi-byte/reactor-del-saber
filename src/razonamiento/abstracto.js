// abstracto.js — genera preguntas de razonamiento abstracto (analogías y patrones)
import { elegirUno, barajar, enteroAleatorio } from '../azar.js';

export function generarAbstracto() {
  const tipo = enteroAleatorio(1, 3);
  if (tipo === 1) return analogiaCiencias();
  if (tipo === 2) return cualNoPertenece();
  return patronSimbolos();
}

// Analogías: A es a B como C es a ?
function analogiaCiencias() {
  const analogias = [
    { enunciado: '🔬 El NÚCLEO es a la CÉLULA como el CEREBRO es a...', correcta: 'Cuerpo humano', distractores: ['Corazón', 'Neurona', 'Tejido'], explicacion: 'El núcleo controla la célula, así como el cerebro controla el cuerpo humano.' },
    { enunciado: '⚗️ El PROTÓN es al ÁTOMO como la CÉLULA es al...', correcta: 'Organismo', distractores: ['Núcleo', 'Tejido', 'Molécula'], explicacion: 'El protón es parte fundamental del átomo, como la célula lo es del organismo.' },
    { enunciado: '🌿 El SOL es a la FOTOSÍNTESIS como el OXÍGENO es a la...', correcta: 'Respiración celular', distractores: ['Fotosíntesis', 'Digestión', 'Excreción'], explicacion: 'El sol impulsa la fotosíntesis; el oxígeno impulsa la respiración celular.' },
    { enunciado: '⚡ La MASA es al KILOGRAMO como la FUERZA es al...', correcta: 'Newton', distractores: ['Joule', 'Pascal', 'Watt'], explicacion: 'Kg es la unidad de masa; Newton (N) es la unidad de fuerza en el SI.' },
    { enunciado: '🧬 El ADN es al NÚCLEO como el RIBOSOMA es al...', correcta: 'Citoplasma', distractores: ['Núcleo', 'Membrana', 'Mitocondria'], explicacion: 'El ADN reside en el núcleo; los ribosomas están en el citoplasma (o en el retículo endoplasmático rugoso).' },
    { enunciado: '⚗️ El REACTIVO es al PRODUCTO como la CAUSA es al...', correcta: 'Efecto', distractores: ['Reactivo', 'Catalizador', 'Síntesis'], explicacion: 'En química, los reactivos (causa) generan los productos (efecto) en una reacción.' },
    { enunciado: '🌱 El PRODUCTOR es al ECOSISTEMA como la PLANTA es al...', correcta: 'Jardín', distractores: ['Animal', 'Hongo', 'Bacteria'], explicacion: 'Los productores (plantas) realizan fotosíntesis; son la base del ecosistema, como una planta lo es de un jardín.' },
    { enunciado: '⚗️ El ÁCIDO es a pH < 7 como la BASE es a...', correcta: 'pH > 7', distractores: ['pH = 7', 'pH = 0', 'pH < 7'], explicacion: 'Ácidos tienen pH menor a 7; bases (álcalis) tienen pH mayor a 7. El neutro es exactamente 7.' },
    { enunciado: '🔋 La ENERGÍA POTENCIAL es a la ALTURA como la ENERGÍA CINÉTICA es a la...', correcta: 'Velocidad', distractores: ['Masa', 'Temperatura', 'Presión'], explicacion: 'La energía potencial gravitacional depende de la altura (Ep=mgh); la cinética depende de la velocidad (Ec=½mv²).' },
    { enunciado: '🌿 La MITOCONDRIA es a la ENERGÍA como el CLOROPLASTO es a la...', correcta: 'Fotosíntesis', distractores: ['Respiración', 'Digestión', 'Excreción'], explicacion: 'La mitocondria produce energía (ATP); el cloroplasto realiza la fotosíntesis.' },
  ];

  const a = elegirUno(analogias);
  const opciones = barajar([a.correcta, ...a.distractores]);
  return {
    id: `RAZ-ABS-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'abstracto',
    tema: 'Propiedades de la materia', dificultad: 2,
    enunciado: a.enunciado,
    opciones,
    correcta: opciones.indexOf(a.correcta),
    explicacion: a.explicacion,
    tipo: 'razonamiento'
  };
}

// ¿Cuál NO pertenece al grupo?
function cualNoPertenece() {
  const grupos = [
    { enunciado: '🔬 ¿Cuál de estos NO es un orgánulo celular?', correcta: 'Neurona', opciones: ['Mitocondria', 'Ribosoma', 'Neurona', 'Núcleo'], explicacion: 'La neurona es un tipo de célula, no un orgánulo. Los demás (mitocondria, ribosoma, núcleo) son partes internas de la célula.' },
    { enunciado: '⚗️ ¿Cuál de estos NO es un gas noble?', correcta: 'Cloro (Cl)', opciones: ['Helio (He)', 'Neón (Ne)', 'Cloro (Cl)', 'Argón (Ar)'], explicacion: 'El cloro (Cl) es un halógeno (grupo 17). He, Ne y Ar son gases nobles (grupo 18).' },
    { enunciado: '🌿 ¿Cuál de estos NO es un productor en un ecosistema?', correcta: 'León', opciones: ['Pasto', 'Alga', 'León', 'Árbol'], explicacion: 'El león es un consumidor (carnívoro). Pasto, algas y árboles son productores (realizan fotosíntesis).' },
    { enunciado: '⚡ ¿Cuál NO es una forma de transferencia de calor?', correcta: 'Condensación', opciones: ['Conducción', 'Convección', 'Condensación', 'Radiación'], explicacion: 'La condensación es un cambio de estado (gas → líquido), no un mecanismo de transferencia de calor.' },
    { enunciado: '🧬 ¿Cuál de estos NO es un ácido nucleico?', correcta: 'ATP', opciones: ['ADN', 'ARNm', 'ATP', 'ARNt'], explicacion: 'El ATP es un nucleótido que almacena energía, no un ácido nucleico como el ADN o ARN.' },
    { enunciado: '⚗️ ¿Cuál de estos NO es una mezcla homogénea?', correcta: 'Ensalada', opciones: ['Agua con sal', 'Aire', 'Ensalada', 'Limonada'], explicacion: 'La ensalada es una mezcla heterogénea (puedes ver sus partes). Las otras son homogéneas (uniformes).' },
    { enunciado: '🔬 ¿Cuál NO es un nivel de organización biológica?', correcta: 'Molécula de agua', opciones: ['Célula', 'Tejido', 'Molécula de agua', 'Órgano'], explicacion: 'La molécula de agua es química, no biológica. Los niveles de organización biológica inician en la célula.' },
  ];

  const g = elegirUno(grupos);
  const opcionesBarajadas = barajar([...g.opciones]);
  return {
    id: `RAZ-ABS-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'abstracto',
    tema: 'Propiedades de la materia', dificultad: 2,
    enunciado: g.enunciado,
    opciones: opcionesBarajadas,
    correcta: opcionesBarajadas.indexOf(g.correcta),
    explicacion: g.explicacion,
    tipo: 'razonamiento'
  };
}

// Patrón de símbolos: completa la tabla
function patronSimbolos() {
  const patrones = [
    {
      enunciado: '🔢 Observa el patrón y encuentra el valor que falta:\n\n  Na=11   K=19   Rb=37\n  He=2    Ne=10  Ar=?',
      correcta: '18', distractores: ['16', '20', '22'],
      explicacion: 'El argón (Ar) tiene número atómico 18. Todos son gases nobles cuyos números atómicos siguen la tabla periódica.'
    },
    {
      enunciado: '🔢 Completa la tabla de estados:\n\n  Sólido → Líquido = Fusión\n  Líquido → Gas = Vaporización\n  Gas → Líquido = ?',
      correcta: 'Condensación', distractores: ['Solidificación', 'Sublimación', 'Fusión'],
      explicacion: 'Cuando un gas pasa a líquido se llama condensación (ej: el vapor de agua que forma gotas en un vaso frío).'
    },
    {
      enunciado: '🔢 Sigue el patrón del código de energía:\n\n  Sol → Planta = Fotosíntesis\n  Planta → Animal = Alimentación\n  Animal → Ambiente = ?',
      correcta: 'Respiración / Descomposición', distractores: ['Fotosíntesis', 'Reproducción', 'Digestión'],
      explicacion: 'La energía regresa al ambiente mediante la respiración celular y la descomposición de los organismos.'
    },
  ];

  const p = elegirUno(patrones);
  const opciones = barajar([p.correcta, ...p.distractores]);
  return {
    id: `RAZ-ABS-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'abstracto',
    tema: 'Tabla periódica', dificultad: 3,
    enunciado: p.enunciado,
    opciones,
    correcta: opciones.indexOf(p.correcta),
    explicacion: p.explicacion,
    tipo: 'razonamiento'
  };
}
