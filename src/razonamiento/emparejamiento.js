// emparejamiento.js — genera preguntas de emparejamiento concepto ↔ definición
import { elegirUno, barajar } from '../azar.js';

const BANCOS = {
  celula: [
    { termino: 'Mitocondria',     def: '🔋 Orgánulo que produce ATP (energía) mediante la respiración celular' },
    { termino: 'Cloroplasto',     def: '🌿 Orgánulo vegetal que realiza la fotosíntesis gracias a la clorofila' },
    { termino: 'Núcleo',          def: '🧬 Centro de control celular que contiene el ADN' },
    { termino: 'Ribosoma',        def: '🔩 Orgánulo que sintetiza (fabrica) proteínas' },
    { termino: 'Vacuola',         def: '💧 Compartimento que almacena agua, nutrientes o desechos; muy grande en células vegetales' },
    { termino: 'Membrana celular',def: '🛡️ Barrera semipermeable que controla el paso de sustancias' },
    { termino: 'Lisosoma',        def: '♻️ Orgánulo que digiere y recicla materiales en desuso dentro de la célula' },
  ],
  ecosistema: [
    { termino: 'Productor',       def: '☀️ Organismo que fabrica su propio alimento mediante fotosíntesis (plantas, algas)' },
    { termino: 'Consumidor primario', def: '🐇 Animal que come directamente a los productores (herbívoro)' },
    { termino: 'Descomponedor',   def: '🍄 Organismo que desintegra materia orgánica muerta liberando nutrientes al suelo' },
    { termino: 'Mutualismo',      def: '🤝 Relación en que AMBAS especies se benefician (ej: abeja y flor)' },
    { termino: 'Parasitismo',     def: '🦟 Relación en que una especie se beneficia y la otra es perjudicada' },
    { termino: 'Bioma',           def: '🌍 Gran región del planeta con clima, flora y fauna característicos (ej: selva tropical)' },
    { termino: 'Cadena trófica',  def: '⛓️ Secuencia de organismos donde cada uno sirve de alimento al siguiente' },
  ],
  quimica: [
    { termino: 'Isótopo',         def: '⚛️ Átomos del mismo elemento con igual número de protones pero diferente número de neutrones' },
    { termino: 'Catalizador',     def: '⚡ Sustancia que acelera una reacción química sin consumirse en ella' },
    { termino: 'Enlace covalente',def: '🔗 Unión entre átomos que COMPARTEN pares de electrones' },
    { termino: 'Ácido',           def: '🍋 Sustancia que libera iones H⁺ en solución acuosa; pH menor a 7' },
    { termino: 'Reacción de síntesis', def: '➕ Tipo de reacción donde dos o más reactivos forman UN solo producto' },
    { termino: 'Densidad',        def: '📐 Propiedad intensiva = masa ÷ volumen de una sustancia' },
    { termino: 'Electrón de valencia', def: '🔌 Electrón de la capa más externa del átomo que participa en los enlaces' },
  ],
  fisica: [
    { termino: 'Inercia',         def: '😴 Tendencia de un objeto a mantener su estado de reposo o movimiento uniforme (1ª ley de Newton)' },
    { termino: 'Potencia',        def: '⚡ Cantidad de trabajo realizado por unidad de tiempo (W = J/s)' },
    { termino: 'Presión',         def: '🏋️ Fuerza aplicada sobre una superficie (P = F/A), medida en Pascales' },
    { termino: 'Inducción electromagnética', def: '🧲 Generación de corriente eléctrica por un campo magnético variable (principio de Faraday)' },
    { termino: 'Energía potencial', def: '⛰️ Energía almacenada por la posición de un objeto (Ep = mgh)' },
    { termino: 'Frecuencia',      def: '🎵 Número de ciclos completos de una onda por segundo, medida en Hertz (Hz)' },
    { termino: 'Rendimiento',     def: '🔧 Relación entre el trabajo útil y el trabajo total invertido en una máquina' },
  ],
};

export function generarEmparejamiento() {
  const categorias = Object.keys(BANCOS);
  const categoria = elegirUno(categorias);
  const banco = BANCOS[categoria];

  // Elegir el par correcto
  const par = elegirUno(banco);

  // 3 distractores: términos de otra categoría o de la misma
  const otrosBancos = Object.values(BANCOS).flat().filter(p => p.termino !== par.termino);
  const distract = barajar(otrosBancos).slice(0, 3).map(p => p.termino);

  const opciones = barajar([par.termino, ...distract]);

  const temasMap = {
    celula: 'Célula', ecosistema: 'Ecosistema',
    quimica: 'Nomenclatura básica', fisica: 'Propiedades de la materia'
  };

  return {
    id: `RAZ-EMP-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'emparejamiento',
    tema: temasMap[categoria], dificultad: 2,
    enunciado: `🔗 Lee la descripción y elige el concepto que corresponde:\n\n"${par.def}"`,
    opciones,
    correcta: opciones.indexOf(par.termino),
    explicacion: `"${par.termino}": ${par.def.replace(/^[^a-zA-ZÀ-ú]+/, '')}`,
    tipo: 'razonamiento'
  };
}
