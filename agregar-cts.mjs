// agregar-cts.mjs — sube el cuestionario de Ciencia, Tecnología y Sociedad (C.T.S.)
// Aplica para los 3 grados (8°, 9°, 10°) — grado:'todos'
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  apiKey:            "AIzaSyBNE8g0il0ISljpCgmk__AtF_AQHMbVfAg",
  authDomain:        "iti-olimpiadas.firebaseapp.com",
  databaseURL:       "https://iti-olimpiadas-default-rtdb.firebaseio.com",
  projectId:         "iti-olimpiadas",
  storageBucket:     "iti-olimpiadas.firebasestorage.app",
  messagingSenderId: "762225015291",
  appId:             "1:762225015291:web:dd4bf9faf01f46823fb35e",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

function base(id, dificultad = 3) {
  return {
    id, materia: 'cts', grado: 'todos', dificultad,
    origen: 'normal', activa: true, autor: 'iti-docente', tema: 'ciencia, tecnología y sociedad',
    imagen: null, imagen2: null,
  };
}

const NUEVAS = [
  {
    ...base('CTS-001'),
    enunciado: 'Una comunidad utiliza bolsas plásticas de un solo uso para transportar sus compras. Después de varios años, se observa que algunos desagües se tapan con residuos plásticos y que se encuentran fragmentos de estos materiales en una quebrada cercana.\n\nLa alcaldía propone reemplazar las bolsas desechables por bolsas reutilizables y desarrollar campañas de educación ambiental.\n\n¿Cuál es la principal justificación científica de esta propuesta?',
    opciones: [
      'Las bolsas reutilizables se descomponen de inmediato al entrar en contacto con el agua.',
      'Reducir los plásticos desechables disminuye residuos y sus efectos sobre los ecosistemas.',
      'Los plásticos dejan de contaminar cuando llegan a una quebrada cercana.',
      'La contaminación plástica afecta solo a los organismos que viven en el agua.',
    ],
    correcta: 1,
    explicacion: 'Reducir el uso de plásticos de un solo uso disminuye la cantidad de residuos generados y, con ello, sus efectos negativos sobre los ecosistemas (obstrucción de desagües, acumulación en cuerpos de agua, fragmentación en microplásticos).',
  },
  {
    ...base('CTS-002'),
    enunciado: 'En una ciudad, las autoridades sanitarias realizan una campaña de vacunación para disminuir la propagación de una enfermedad infecciosa. Algunas personas deciden no participar porque consideran que la vacunación solo beneficia a quien recibe la dosis.\n\n¿Cuál argumento científico permite cuestionar esta afirmación?',
    opciones: [
      'Las vacunas impiden que todos los microorganismos entren al cuerpo humano.',
      'Las vacunas hacen innecesario mantener hábitos de higiene en la comunidad.',
      'Una alta vacunación puede reducir contagios y proteger a personas vulnerables.',
      'Las vacunas producen exactamente el mismo efecto en todas las personas.',
    ],
    correcta: 2,
    explicacion: 'Cuando una gran proporción de la población está vacunada, se reduce la circulación del agente infeccioso (inmunidad de rebaño), lo que protege indirectamente a quienes no pueden vacunarse o son más vulnerables — no es un beneficio exclusivo del vacunado.',
  },
  {
    ...base('CTS-003'),
    enunciado: 'Una institución educativa compara tres fuentes de energía para reducir su impacto ambiental.\n\nFuente de energía — Emisiones durante la operación — Dependencia de condiciones naturales\nSolar — Generalmente bajas — Depende de la radiación solar\nCarbón — Altas — Depende del suministro de combustible\nEólica — Generalmente bajas — Depende de la disponibilidad del viento\n\nSi la institución busca reducir las emisiones durante la operación y dispone de una zona con buena radiación solar, ¿cuál decisión está mejor sustentada?',
    opciones: [
      'Instalar paneles solares y evaluar su viabilidad técnica y económica local.',
      'Usar solo carbón porque genera energía continua sin depender del clima local.',
      'Descartar las renovables porque dependen de condiciones naturales variables.',
      'Elegir una fuente de energía sin estudiar las condiciones del lugar.',
    ],
    correcta: 0,
    explicacion: 'La decisión mejor sustentada combina el dato relevante (baja emisión de la energía solar) con una condición local favorable (buena radiación solar), sin omitir la evaluación de viabilidad técnica y económica antes de implementarla.',
  },
  {
    ...base('CTS-004'),
    enunciado: 'Un hospital utiliza un sistema de inteligencia artificial que analiza imágenes médicas para identificar posibles lesiones. El sistema señala una lesión en una imagen, pero el médico debe revisar el resultado antes de tomar una decisión.\n\n¿Por qué es importante que el profesional revise la recomendación del sistema?',
    opciones: [
      'Porque la inteligencia artificial siempre produce resultados incorrectos.',
      'Porque una máquina no puede procesar información científica de ningún tipo.',
      'Porque el resultado debe revisarse según sus límites y los datos clínicos.',
      'Porque la tecnología debe sustituir por completo el criterio profesional.',
    ],
    correcta: 2,
    explicacion: 'Todo sistema de IA tiene límites (falsos positivos/negativos, sesgos en los datos de entrenamiento); por eso su resultado es una ayuda que debe contrastarse con el criterio clínico y los datos del paciente, no una decisión automática.',
  },
  {
    ...base('CTS-005'),
    enunciado: 'Un agricultor utiliza un pesticida para controlar insectos que dañan sus cultivos. Después de varias aplicaciones, observa que disminuyen algunas poblaciones de insectos beneficiosos y que necesita aumentar la cantidad de producto para obtener resultados similares.\n\n¿Cuál explicación científica es la más adecuada?',
    opciones: [
      'Todos los insectos del cultivo son perjudiciales para la producción agrícola.',
      'El pesticida afecta organismos no objetivo y puede favorecer insectos resistentes.',
      'Aumentar la dosis garantiza que nunca aparecerán insectos resistentes.',
      'Los insectos beneficiosos no cumplen funciones importantes en los cultivos.',
    ],
    correcta: 1,
    explicacion: 'Los pesticidas de amplio espectro afectan también a organismos no objetivo (como polinizadores o depredadores naturales), y el uso repetido ejerce presión selectiva que favorece la supervivencia de individuos resistentes — por eso se necesita cada vez más producto.',
  },
  {
    ...base('CTS-006'),
    enunciado: 'Un grupo de estudiantes analiza muestras de agua de dos lugares: una zona cercana a una ciudad y otra ubicada en un área rural alejada. Encuentran fragmentos de plástico pequeños en ambas muestras, aunque en concentraciones diferentes.\n\n¿Cuál conclusión está mejor sustentada por estos resultados?',
    opciones: [
      'Todos los microplásticos encontrados se originaron necesariamente en la ciudad.',
      'Encontrar microplásticos demuestra que el agua no contiene otros contaminantes.',
      'Los microplásticos aparecen en distintos ambientes; hacen falta estudios sobre sus fuentes.',
      'Los microplásticos afectan solo a las personas y no a otros organismos.',
    ],
    correcta: 2,
    explicacion: 'Los datos solo muestran presencia de microplásticos en ambos ambientes, no su origen exacto — una conclusión rigurosa reconoce lo que los datos sí permiten afirmar (distribución amplia) y señala qué falta investigar (fuentes), sin generalizar de más.',
  },
  {
    ...base('CTS-007'),
    enunciado: 'Una empresa desarrolla un empaque que prolonga la conservación de un alimento y reduce su deterioro durante el transporte. Sin embargo, algunos consumidores consideran que el uso de tecnología en los alimentos siempre los hace menos saludables.\n\n¿Cuál afirmación es científicamente más adecuada?',
    opciones: [
      'Todo alimento conservado con tecnología es perjudicial para la salud humana.',
      'La conservación puede reducir deterioro; la calidad depende de ingredientes y procesamiento.',
      'Los alimentos sin empaque nunca se contaminan durante su almacenamiento.',
      'La conservación elimina la necesidad de revisar la fecha de vencimiento.',
    ],
    correcta: 1,
    explicacion: 'La tecnología de empaque y conservación es una herramienta: reduce el deterioro, pero la calidad nutricional y la seguridad del alimento dependen de sus ingredientes y de cómo fue procesado, no de la sola presencia de tecnología.',
  },
  {
    ...base('CTS-008'),
    enunciado: 'En un hospital se detecta que algunas bacterias ya no responden a un antibiótico que antes era eficaz. Los investigadores encuentran que las bacterias resistentes sobreviven al tratamiento y se multiplican.\n\n¿Cuál medida contribuiría a enfrentar esta problemática?',
    opciones: [
      'Usar antibióticos para tratar cualquier infección causada por virus.',
      'Suspender el tratamiento al mejorar, aunque contradiga las indicaciones médicas.',
      'Usar antibióticos solo si los indica un profesional y seguir todo el tratamiento.',
      'Aumentar por cuenta propia la dosis si no se observa mejoría.',
    ],
    correcta: 2,
    explicacion: 'El uso responsable de antibióticos (solo cuando están indicados y completando el tratamiento) reduce la presión selectiva que favorece la aparición y propagación de bacterias resistentes.',
  },
  {
    ...base('CTS-009'),
    enunciado: 'Un grupo de investigadores mide la concentración de partículas contaminantes en una avenida antes y después de implementar una estrategia de movilidad sostenible.\n\nMomento de medición — Concentración de partículas\nAntes de la estrategia — 80 µg/m³\nDespués de la estrategia — 55 µg/m³\n\nLos investigadores desean evaluar si la estrategia contribuyó a mejorar la calidad del aire.\n¿Cuál sería el siguiente paso más apropiado para fortalecer la conclusión?',
    opciones: [
      'Afirmar que la estrategia fue la única causa de la reducción observada.',
      'Comparar varios días y controlar factores como clima y volumen del tráfico.',
      'Eliminar los datos iniciales porque fueron tomados antes de la intervención.',
      'Concluir que todos los contaminantes disminuyeron en igual proporción.',
    ],
    correcta: 1,
    explicacion: 'Una sola comparación antes/después no descarta otras variables (clima, tráfico, día de la semana). Repetir mediciones y controlar esos factores fortalece la conclusión de que la estrategia, y no otra causa, produjo la mejora.',
  },
  {
    ...base('CTS-010'),
    enunciado: 'Un equipo científico modifica genéticamente una planta para que resista una plaga específica. La variedad obtenida podría disminuir algunas pérdidas agrícolas, pero se deben estudiar sus efectos ambientales antes de extender su cultivo.\n\n¿Cuál evaluación sería más apropiada antes de recomendar su uso a gran escala?',
    opciones: [
      'Analizar solo si la planta crece más rápido que la variedad original.',
      'Suponer que toda modificación genética es necesariamente peligrosa.',
      'Evaluar eficacia, efectos en organismos no objetivo, flujo génico y cultivo.',
      'Aprobar su uso sin pruebas porque fue desarrollada por científicos.',
    ],
    correcta: 2,
    explicacion: 'Una evaluación científica responsable de un cultivo modificado genéticamente debe considerar múltiples dimensiones: si realmente funciona, si afecta a otros organismos, si el gen puede transferirse a otras plantas, y el impacto agrícola general — no basta un solo criterio.',
  },
  {
    ...base('CTS-011'),
    enunciado: 'Una institución reemplaza computadores que todavía funcionan por equipos nuevos. Los aparatos antiguos se almacenan durante años y algunos terminan en un botadero informal, donde pueden liberar sustancias contaminantes.\n\n¿Cuál alternativa representa una gestión más responsable?',
    opciones: [
      'Quemar los computadores para reducir rápidamente su volumen de residuos.',
      'Mezclar los residuos electrónicos con los residuos orgánicos domésticos.',
      'Reparar o reutilizar equipos y entregar los inservibles a gestores autorizados.',
      'Enterrar los equipos para evitar que las personas los manipulen.',
    ],
    correcta: 2,
    explicacion: 'La gestión responsable de residuos electrónicos prioriza alargar la vida útil de los equipos (reparación, reutilización) y, cuando ya no sirven, entregarlos a gestores autorizados que puedan reciclarlos o disponerlos sin liberar sustancias tóxicas al ambiente.',
  },
  {
    ...base('CTS-012'),
    enunciado: 'Un grupo de estudiantes quiere investigar si el uso del celular antes de dormir se relaciona con la calidad del sueño. Encuestan a 100 compañeros y encuentran que quienes reportan mayor uso nocturno también suelen dormir menos horas.\n\n¿Cuál conclusión es científicamente más rigurosa?',
    opciones: [
      'El celular es la única causa posible de dormir menos horas cada noche.',
      'Hay asociación, pero deben estudiarse otros factores antes de afirmar causalidad.',
      'La encuesta demuestra que todo usuario de celular tiene trastornos del sueño.',
      'Los resultados no sirven porque las encuestas nunca aportan datos científicos.',
    ],
    correcta: 1,
    explicacion: 'Encontrar una asociación entre dos variables (uso del celular y horas de sueño) no prueba que una cause la otra — podría haber otros factores involucrados. Una conclusión rigurosa distingue correlación de causalidad.',
  },
  {
    ...base('CTS-013'),
    enunciado: 'Una región instala equipos médicos modernos en un hospital, pero una parte de la población rural no puede acceder a sus servicios debido a la distancia, el costo del transporte y la falta de personal especializado.\n\n¿Cuál decisión permitiría aprovechar mejor la tecnología y reducir las desigualdades?',
    opciones: [
      'Concentrar todos los servicios especializados en la ciudad principal.',
      'Reemplazar a todos los profesionales de salud por equipos automatizados.',
      'Complementar equipos con atención rural, telemedicina viable y capacitación.',
      'Limitar el acceso a los equipos a quienes puedan pagar más dinero.',
    ],
    correcta: 2,
    explicacion: 'El acceso a la tecnología depende de condiciones sociales, económicas y geográficas. Complementar el equipo médico con estrategias de acceso real (telemedicina, atención rural, personal capacitado localmente) reduce la brecha en vez de concentrar los beneficios en un solo lugar.',
  },
  {
    ...base('CTS-014'),
    enunciado: 'Una empresa anuncia un producto que supuestamente mejora la memoria en pocos días. Para respaldar su publicidad, presenta testimonios de cinco personas que aseguran haber obtenido buenos resultados, pero no muestra estudios controlados ni información sobre el tamaño de la muestra.\n\n¿Cuál sería la mejor decisión antes de aceptar la afirmación?',
    opciones: [
      'Comprar el producto porque los testimonios bastan para demostrar su eficacia.',
      'Rechazar automáticamente cualquier producto anunciado por una empresa.',
      'Consultar estudios confiables y comprobar si los resultados respaldan la afirmación.',
      'Creer que funciona si la publicidad utiliza términos científicos.',
    ],
    correcta: 2,
    explicacion: 'Cinco testimonios no constituyen evidencia científica (muestra muy pequeña, sin grupo control, sin medición objetiva). Antes de aceptar una afirmación hay que buscar estudios controlados y confiables que la respalden.',
  },
];

async function main() {
  const snap = await get(ref(db, 'banco-preguntas'));
  const banco = snap.exists() ? snap.val() : [];

  const idsExistentes = new Set(banco.map(p => p.id));
  const porAgregar = NUEVAS.filter(p => !idsExistentes.has(p.id));

  if (porAgregar.length === 0) {
    console.log('✓ Todas las preguntas de C.T.S. ya existen en Firebase.');
    process.exit(0);
  }

  const bancoNuevo = [...banco, ...porAgregar];
  await set(ref(db, 'banco-preguntas'), bancoNuevo);
  console.log(`✓ Agregadas ${porAgregar.length} preguntas de C.T.S. al banco:`);
  porAgregar.forEach(p => console.log(`  · ${p.id} — ${p.enunciado.slice(0, 60)}…`));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
