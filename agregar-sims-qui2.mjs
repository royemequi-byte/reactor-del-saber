import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBNE8g0il0ISljpCgmk__AtF_AQHMbVfAg",
  authDomain: "iti-olimpiadas.firebaseapp.com",
  databaseURL: "https://iti-olimpiadas-default-rtdb.firebaseio.com",
  projectId: "iti-olimpiadas",
  storageBucket: "iti-olimpiadas.firebasestorage.app",
  messagingSenderId: "762225015291",
  appId: "1:762225015291:web:dd4bf9faf01f46823fb35e",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const NUEVAS = [
  // ── Soluciones — Grado 10 ────────────────────────────────────────────────
  {
    id:'SIM-QUI2-10-001', materia:'quimica', tipo:'simulador', simulador:'soluciones',
    tema:'soluciones y concentración', grado:10, dificultad:2, origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`En clase, la docente pide preparar una solución de NaCl en el simulador. Un estudiante agrega NaCl hasta registrar 1 mol disuelto en 1 litro de agua (1 mol/L). Luego presiona "💧 Agregar agua (×2)" y lee el nuevo valor en el medidor de CONCENTRACIÓN.

¿Cuál es la concentración resultante y por qué cambia de esa manera?`,
    opciones:[
      'Aumenta a 2 mol/L, porque al haber más agua hay más espacio para los iones',
      'Se mantiene en 1 mol/L, porque la cantidad de NaCl no varía',
      'Disminuye a 0.5 mol/L, porque los mismos moles quedan distribuidos en el doble de volumen',
      'Baja a cero, porque el NaCl precipita al diluirse demasiado',
    ], correcta:2,
    explicacion:'Molaridad = moles / litros. Si se conservan los moles de NaCl (1 mol) y el volumen se duplica (de 1 L a 2 L), entonces C = 1/2 = 0.5 mol/L. El simulador muestra exactamente esa disminución en el medidor al agregar agua.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-QUI2-10-002', materia:'quimica', tipo:'simulador', simulador:'soluciones',
    tema:'soluciones y concentración', grado:10, dificultad:2, origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`En una práctica de laboratorio se estudia la solubilidad del NaCl a temperatura ambiente. Un estudiante usa el simulador para agregar sal repetidamente y observa que el indicador pasa de "NO SATURADA" a "CASI SATURADA". La leyenda indica que la saturación del NaCl es aproximadamente 6 mol/L a 25 °C.

Cuando el estudiante continúa agregando NaCl después de alcanzar los 6 mol/L, ¿qué observa en el simulador y cómo se explica?`,
    opciones:[
      'La concentración sigue subiendo porque el agua puede disolver cualquier cantidad de sal',
      'Los iones Na⁺ y Cl⁻ desaparecen porque la solución se vuelve inestable',
      'El exceso de NaCl permanece como cristal sin ionizarse, porque se alcanzó el límite de saturación',
      'La solución hierve automáticamente porque la sal eleva el punto de ebullición al saturarse',
    ], correcta:2,
    explicacion:'Al alcanzar la saturación, el solvente ya no puede incorporar más soluto. El NaCl adicional permanece como sólido sin disolver (cristales visibles en el simulador). La agitación acelera la disolución, pero no aumenta la solubilidad máxima a temperatura constante.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-QUI2-10-003', materia:'quimica', tipo:'simulador', simulador:'soluciones',
    tema:'soluciones y concentración', grado:10, dificultad:3, origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`Dos compañeros de laboratorio debaten: Laura afirma que al calentar una solución saturada de NaCl se puede disolver más sal; Sebastián dice que la temperatura no afecta la solubilidad. Para resolverlo, preparan una solución saturada en el simulador y presionan "🔥 Calentar (+20 °C)". Observan que el indicador cambia de "SATURADA" a "CASI SATURADA".

¿Cuál conclusión está respaldada por el experimento y qué la explica?`,
    opciones:[
      'Sebastián tiene razón; el cambio en el indicador es un error de visualización del simulador',
      'Laura tiene razón; al aumentar la temperatura, las moléculas de agua tienen mayor energía cinética y pueden disolver más soluto',
      'Laura tiene razón, pero porque el calor descompone el NaCl en Na y Cl gaseosos, reduciendo la concentración',
      'Ambos tienen razón porque la solubilidad aumenta y disminuye simultáneamente con la temperatura',
    ], correcta:1,
    explicacion:'La solubilidad de la mayoría de las sales sólidas aumenta con la temperatura. Al calentar, las moléculas de agua adquieren mayor energía cinética y rompen más fácilmente las interacciones iónicas de la red cristalina, permitiendo disolver más soluto. El simulador lo refleja al bajar el porcentaje de saturación tras calentar.',
    imagen:null, imagen2:null,
  },

  // ── Reacciones Químicas — Grado 10 ───────────────────────────────────────
  {
    id:'SIM-QUI2-10-004', materia:'quimica', tipo:'simulador', simulador:'reacciones',
    tema:'reacciones químicas', grado:10, dificultad:2, origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`En una planta de generación de energía se usa gas natural (metano, CH₄) como combustible. Un operario estudia la combustión completa usando el simulador: CH₄ + __ O₂ → CO₂ + __ H₂O. Ajusta los coeficientes hasta que todos los contadores del panel de conservación muestran ✓ verde.

Según la ecuación balanceada que obtiene, ¿cuántas moléculas de O₂ se necesitan para quemar completamente 1 molécula de CH₄?`,
    opciones:[
      '1 molécula de O₂, porque la reacción intercambia los mismos elementos en igual proporción',
      '2 moléculas de O₂, porque se requieren 2 O para el CO₂ y 2 O más para los 2 H₂O producidos',
      '3 moléculas de O₂, porque hay 3 tipos de átomos distintos en la reacción',
      '4 moléculas de O₂, porque cada hidrógeno del metano necesita su propio átomo de oxígeno',
    ], correcta:1,
    explicacion:'La ecuación balanceada es CH₄ + 2O₂ → CO₂ + 2H₂O. El CO₂ requiere 2 átomos de O y los 2 H₂O requieren otros 2 átomos de O: total 4 átomos de O = 2 moléculas de O₂. El simulador muestra todos los contadores en verde solo con el coeficiente 2 para O₂.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-QUI2-10-005', materia:'quimica', tipo:'simulador', simulador:'reacciones',
    tema:'reacciones químicas', grado:10, dificultad:2, origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`En un laboratorio de energía limpia se estudia la síntesis de agua a partir de sus elementos. Una estudiante selecciona la reacción "Síntesis H₂O" en el simulador: __ H₂ + O₂ → __ H₂O, y ajusta los coeficientes hasta que el panel de conservación muestre todos los elementos balanceados.

¿Por qué la ecuación balanceada requiere 2 moléculas de H₂ y no 1 para producir 2 H₂O?`,
    opciones:[
      'Porque el hidrógeno es más liviano y necesita el doble para compensar el peso del oxígeno',
      'Porque la reacción libera más energía cuando se usan más moléculas de H₂',
      'Porque cada H₂O contiene 2 hidrógenos y el O₂ produce 2 moléculas de H₂O, requiriendo 4 H en total',
      'Porque el oxígeno siempre reacciona con el cuádruple de moléculas de hidrógeno',
    ], correcta:2,
    explicacion:'2H₂ + O₂ → 2H₂O. Cada molécula de H₂O tiene 2 átomos de H; al producir 2 H₂O se necesitan 4 átomos de H = 2 moléculas de H₂. Con 1 H₂ solo habría 2 H pero se producirían 2 H₂O con 4 H: los contadores mostrarían desequilibrio. El simulador confirma esto al mostrar ✓ solo con coeficiente 2.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-QUI2-10-006', materia:'quimica', tipo:'simulador', simulador:'reacciones',
    tema:'reacciones químicas', grado:10, dificultad:3, origen:'icfes', activa:true, autor:'iti-docente',
    enunciado:
`En una empresa metalúrgica se analiza la oxidación del hierro. Un ingeniero usa el simulador y selecciona "Oxidación Fe". Al balancear la ecuación __ Fe + __ O₂ → __ Fe₂O₃ obtiene: 4 Fe + 3 O₂ → 2 Fe₂O₃. Dispone de 112 g de hierro puro (masa molar Fe = 56 g/mol).

Usando la relación estequiométrica del simulador, ¿cuántos moles de O₂ se requieren para oxidar completamente esos 112 g de hierro?`,
    opciones:[
      '1.0 mol de O₂',
      '1.5 mol de O₂',
      '2.0 mol de O₂',
      '3.0 mol de O₂',
    ], correcta:1,
    explicacion:'Moles de Fe = 112 g ÷ 56 g/mol = 2 mol Fe. La proporción estequiométrica del simulador es 4 mol Fe : 3 mol O₂. Para 2 mol Fe: (2/4) × 3 = 1.5 mol O₂. El simulador muestra que por cada 4 átomos de Fe se consumen 3 moléculas de O₂, lo que permite calcular la proporción correctamente.',
    imagen:null, imagen2:null,
  },
];

async function main() {
  const snap = await get(ref(db, 'banco-preguntas'));
  const banco = snap.exists() ? snap.val() : [];
  const ids = new Set(banco.map(p => p.id));
  const nuevas = NUEVAS.filter(p => !ids.has(p.id));
  if (!nuevas.length) { console.log('✓ Ya existían todas.'); process.exit(0); }
  await set(ref(db, 'banco-preguntas'), [...banco, ...nuevas]);
  console.log(`✓ Agregadas ${nuevas.length} preguntas:`);
  nuevas.forEach(p => console.log('  ·', p.id, '—', p.enunciado.slice(0,60).replace(/\n/g,' ') + '…'));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
