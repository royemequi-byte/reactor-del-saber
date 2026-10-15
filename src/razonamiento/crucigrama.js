// crucigrama.js — completa la palabra científica a partir de una pista y letras dadas
import { elegirUno, barajar } from '../azar.js';

const PALABRAS = [
  // Célula
  { palabra: 'MITOCONDRIA', pista: '🔋 Orgánulo que produce la energía (ATP) de la célula', tema: 'Célula',
    letras: 'M_T_C_NDR_A', distractores: ['CLOROPLASTO', 'LISOSOMA', 'RIBOSOMA'] },
  { palabra: 'CLOROPLASTO', pista: '🌿 Orgánulo vegetal donde se realiza la fotosíntesis', tema: 'Célula',
    letras: 'CL_R_PL_STO', distractores: ['MITOCONDRIA', 'VACUOLA', 'NUCLEO'] },
  { palabra: 'MEMBRANA', pista: '🛡️ Barrera que rodea y protege la célula controlando el paso de sustancias', tema: 'Célula',
    letras: 'M_MB_AN_', distractores: ['CITOPLASMA', 'RIBOSOMA', 'LISOSOMA'] },

  // Ecosistema
  { palabra: 'ECOSISTEMA', pista: '🌍 Conjunto de seres vivos y su ambiente físico en interacción', tema: 'Ecosistema',
    letras: '_CO_IST_MA', distractores: ['BIOMA', 'BIOSFERA', 'HABITAT'] },
  { palabra: 'FOTOSINTESIS', pista: '☀️ Proceso por el cual las plantas producen glucosa usando luz solar', tema: 'Reacciones químicas',
    letras: 'F_TO_INT_SIS', distractores: ['RESPIRACION', 'DIGESTION', 'FERMENTACION'] },
  { palabra: 'MUTUALISMO', pista: '🤝 Relación entre dos especies donde ambas se benefician', tema: 'Ecosistema',
    letras: 'M_TU_L_SMO', distractores: ['PARASITISMO', 'COMENSALISMO', 'DEPREDACION'] },

  // Tabla periódica / Química
  { palabra: 'ISOTOPO', pista: '⚛️ Átomos del mismo elemento con diferente número de neutrones', tema: 'Tabla periódica',
    letras: '_S_TOP_', distractores: ['ELECTRON', 'NEUTRON', 'PROTON'] },
  { palabra: 'CATALIZADOR', pista: '⚡ Sustancia que acelera una reacción química sin consumirse', tema: 'Reacciones químicas',
    letras: 'CAT_L_Z_DOR', distractores: ['REACTIVO', 'PRODUCTO', 'OXIDANTE'] },
  { palabra: 'ELECTRONEGATIVIDAD', pista: '🔌 Capacidad de un átomo de atraer electrones hacia sí en un enlace', tema: 'Tabla periódica',
    letras: '_L_CTR_N_G_TIV_D_D', distractores: ['ELECTROAFINIDAD', 'IONIZACION', 'VALENCIA'] },
  { palabra: 'NOMENCLATURA', pista: '📚 Sistema de reglas para nombrar compuestos químicos', tema: 'Nomenclatura básica',
    letras: 'N_M_NCL_T_R_', distractores: ['ESTEQUIOMETRIA', 'FORMULACION', 'CLASIFICACION'] },

  // Propiedades de la materia
  { palabra: 'DENSIDAD', pista: '📐 Propiedad intensiva = masa ÷ volumen de una sustancia', tema: 'Propiedades de la materia',
    letras: 'D_NS_D_D', distractores: ['VISCOSIDAD', 'SOLUBILIDAD', 'MOLARIDAD'] },
  { palabra: 'SUBLIMACION', pista: '❄️→💨 Cambio de estado directo de sólido a gas (ej: hielo seco)', tema: 'Propiedades de la materia',
    letras: 'S_BL_M_C_ÓN', distractores: ['CONDENSACION', 'EVAPORACION', 'SOLIDIFICACION'] },

  // Organismo / Genética
  { palabra: 'CROMOSOMA', pista: '🧬 Estructura en el núcleo que contiene los genes de un organismo', tema: 'Organismo',
    letras: 'CR_M_S_M_', distractores: ['RIBOSOMA', 'LISOSOMA', 'CENTROSOMA'] },
  { palabra: 'GENOTIPO', pista: '🔬 Información genética total de un organismo (su "receta" en el ADN)', tema: 'Organismo',
    letras: 'G_N_T_P_', distractores: ['FENOTIPO', 'HAPLOTIPO', 'ALELO'] },
];

export function generarCrucigrama() {
  const p = elegirUno(PALABRAS);
  const opciones = barajar([p.palabra, ...p.distractores]);

  return {
    id: `RAZ-CRU-${Date.now()}`,
    materia: 'razonamiento', subtipo: 'crucigrama',
    tema: p.tema, dificultad: 2,
    enunciado: `📝 COMPLETA LA PALABRA\n\nPista: ${p.pista}\n\nLetras visibles:  ${p.letras}\n\n¿Cuál es la palabra completa?`,
    opciones,
    correcta: opciones.indexOf(p.palabra),
    explicacion: `La palabra es "${p.palabra}". ${p.pista.replace(/^[^a-zA-ZÀ-ú]+/, '')}`,
    tipo: 'razonamiento'
  };
}
