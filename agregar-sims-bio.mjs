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
  // ── Biología Grado 8/9 — Mitosis ────────────────────────────────────────
  {
    id:'SIM-BIO-8-001', materia:'biologia', tipo:'simulador', simulador:'mitosis',
    tema:'división celular', grado:8, dificultad:2, origen:'normal', activa:true, autor:'iti-docente',
    enunciado:'Observa el simulador de mitosis y estudia cada fase.\n¿En qué fase los cromosomas se ALINEAN en el ecuador de la célula formando la placa metafásica?',
    opciones:['Profase','Metafase','Anafase','Telofase'], correcta:1,
    explicacion:'En la METAFASE los cromosomas se alinean en el plano ecuatorial de la célula (placa metafásica). Los husos se conectan a los centrómeros listos para separar las cromátidas.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-BIO-8-002', materia:'biologia', tipo:'simulador', simulador:'mitosis',
    tema:'división celular', grado:8, dificultad:2, origen:'normal', activa:true, autor:'iti-docente',
    enunciado:'Observa la fase donde las cromátidas hermanas se separan y migran a polos opuestos.\n¿Cómo se llama esa fase y qué ocurre con el número de cromosomas en cada polo?',
    opciones:[
      'Metafase — los cromosomas se duplican',
      'Anafase — cada polo recibe el mismo número que la célula original',
      'Telofase — los cromosomas desaparecen',
      'Profase — los cromosomas se condensan',
    ], correcta:1,
    explicacion:'En la ANAFASE las cromátidas hermanas se separan. Cada polo recibe una copia idéntica, por lo que temporalmente hay el doble de cromosomas en la célula. Al final de la mitosis cada célula hija tendrá el mismo número que la madre.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-BIO-9-001', materia:'biologia', tipo:'simulador', simulador:'mitosis',
    tema:'división celular', grado:9, dificultad:3, origen:'normal', activa:true, autor:'iti-docente',
    enunciado:'Una célula humana tiene 46 cromosomas. Observa el simulador y analiza el proceso completo.\n¿Cuántos cromosomas tendrá cada célula hija al finalizar la mitosis?',
    opciones:['23 cromosomas','46 cromosomas','92 cromosomas','Depende de la fase'],
    correcta:1,
    explicacion:'La mitosis produce dos células hijas IDÉNTICAS a la célula madre. Una célula humana con 46 cromosomas produce dos células hijas con 46 cromosomas cada una. Esto la diferencia de la meiosis, que produce células con 23.',
    imagen:null, imagen2:null,
  },
  // ── Biología Grado 8 — Cadena Trófica ───────────────────────────────────
  {
    id:'SIM-BIO-8-003', materia:'biologia', tipo:'simulador', simulador:'cadena-trofica',
    tema:'ecosistema', grado:8, dificultad:2, origen:'normal', activa:true, autor:'iti-docente',
    enunciado:'Usa el simulador. Elimina los DESCOMPONEDORES y observa qué le pasa a cada nivel.\n¿Cuál sería la consecuencia principal si los descomponedores desaparecen del ecosistema?',
    opciones:[
      'Los productores desaparecen primero',
      'Los carnívoros se multiplican sin control',
      'Los nutrientes no regresan al suelo y los productores se agotan',
      'El ecosistema no cambia porque otros organismos los reemplazan',
    ], correcta:2,
    explicacion:'Los descomponedores reciclan la materia orgánica y devuelven nutrientes al suelo. Sin ellos, los productores (plantas) no obtienen minerales → colapsan → herbívoros y carnívoros también colapsan.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-BIO-8-004', materia:'biologia', tipo:'simulador', simulador:'cadena-trofica',
    tema:'ecosistema', grado:8, dificultad:2, origen:'normal', activa:true, autor:'iti-docente',
    enunciado:'Elimina los CARNÍVOROS del ecosistema en el simulador. ¿Qué efecto cascada se produce?',
    opciones:[
      'Los herbívoros colapsan inmediatamente',
      'Los productores aumentan porque hay más luz solar',
      'Los herbívoros se disparan y devoran la vegetación hasta agotarla',
      'No hay efecto porque los carnívoros son los menos importantes',
    ], correcta:2,
    explicacion:'Sin carnívoros que los controlen, los herbívoros se reproducen sin límite y consumen toda la vegetación disponible → los productores colapsan → todo el ecosistema se desequilibra. Esto se llama efecto cascada trófica.',
    imagen:null, imagen2:null,
  },
  {
    id:'SIM-BIO-8-005', materia:'biologia', tipo:'simulador', simulador:'cadena-trofica',
    tema:'ecosistema', grado:8, dificultad:3, origen:'normal', activa:true, autor:'iti-docente',
    enunciado:'Elimina los PRODUCTORES del ecosistema. ¿Qué nivel se ve más afectado en primer lugar y por qué?',
    opciones:[
      'Los carnívoros, porque son los más grandes',
      'Los herbívoros, porque dependen directamente de las plantas para alimentarse',
      'Los descomponedores, porque no tienen qué descomponer',
      'Todos los niveles colapsan al mismo tiempo',
    ], correcta:1,
    explicacion:'Los herbívoros dependen DIRECTAMENTE de los productores (plantas) para obtener energía. Son el primer nivel en colapsar. Luego los carnívoros pierden su presa y también colapsan. Es el efecto cascada descendente.',
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
  nuevas.forEach(p => console.log('  ·', p.id, '—', p.enunciado.slice(0,55) + '…'));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
