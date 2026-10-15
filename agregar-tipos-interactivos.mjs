import fs from 'fs';

const BANCO_PATH = './data/banco-preguntas.json';
const banco = JSON.parse(fs.readFileSync(BANCO_PATH, 'utf8'));

const nuevas = [

  // ════════════════════════════════════════════════════════════
  // RELACIONAR — Grado 10
  // ════════════════════════════════════════════════════════════
  {
    "id": "REL-10-001", "tipo": "relacionar",
    "materia": "quimica", "tema": "enlaces químicos",
    "grado": 10, "dificultad": 3, "tiempo": 50,
    "enunciado": "Relaciona cada tipo de enlace con la propiedad que lo describe mejor:",
    "pares": [
      { "izq": "Enlace iónico",           "der": "Transferencia de e⁻; cristal sólido, conductor en solución acuosa" },
      { "izq": "Enlace covalente polar",  "der": "Compartición desigual de e⁻; genera dipolo permanente (ej. H₂O)" },
      { "izq": "Enlace metálico",         "der": "Mar de e⁻ deslocalizados; conductor eléctrico sin fundir" },
      { "izq": "Enlace covalente apolar", "der": "Compartición igual de e⁻; sin momento dipolar neto (ej. O₂)" }
    ],
    "explicacion": "Iónico: transferencia Na→Cl. Covalente polar: O y H tienen ΔEN ≈ 1.4 → dipolo. Metálico: los e⁻ de valencia se comparten en toda la red cristalina. Covalente apolar: igual electronegatividad → carga nula.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "REL-10-002", "tipo": "relacionar",
    "materia": "fisica", "tema": "leyes de Newton",
    "grado": 10, "dificultad": 2, "tiempo": 45,
    "enunciado": "Relaciona cada Ley de Newton con su enunciado correcto:",
    "pares": [
      { "izq": "1ª Ley — Inercia",          "der": "Un cuerpo en reposo o en MRU permanece así si la fuerza neta = 0" },
      { "izq": "2ª Ley — Dinámica (F=ma)",   "der": "La aceleración es proporcional a la ΣF e inversamente a la masa" },
      { "izq": "3ª Ley — Acción-Reacción",   "der": "Toda fuerza ejercida sobre A genera en B una fuerza igual y opuesta" }
    ],
    "explicacion": "1ª: principio de inercia (Galileo-Newton). 2ª: ΣF = ma, define la dinámica del movimiento. 3ª: las fuerzas siempre aparecen en pares acción-reacción sobre cuerpos distintos.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "REL-10-003", "tipo": "relacionar",
    "materia": "fisica", "tema": "tipos de ondas",
    "grado": 10, "dificultad": 2, "tiempo": 45,
    "enunciado": "Relaciona cada tipo de onda con su característica principal:",
    "pares": [
      { "izq": "Onda longitudinal",       "der": "Oscilación paralela a la propagación — compresión y rarefacción (sonido)" },
      { "izq": "Onda transversal",        "der": "Oscilación perpendicular a la propagación (onda en cuerda, luz)" },
      { "izq": "Onda mecánica",           "der": "Requiere medio material para propagarse (agua, aire, sólido)" },
      { "izq": "Onda electromagnética",   "der": "Se propaga en el vacío a 3×10⁸ m/s; campos E y B perpendiculares" }
    ],
    "explicacion": "Sonido: longitudinal mecánica. Luz: transversal electromagnética que puede viajar en vacío. La clasificación longitudinal/transversal se refiere a la dirección de oscilación vs propagación.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "REL-10-004", "tipo": "relacionar",
    "materia": "biologia", "tema": "organelas celulares",
    "grado": 10, "dificultad": 2, "tiempo": 50,
    "enunciado": "Relaciona cada organela con su función principal en la célula eucariota:",
    "pares": [
      { "izq": "Mitocondria",        "der": "Produce ATP mediante respiración aeróbica (ciclo de Krebs + cadena de transporte)" },
      { "izq": "Ribosoma",           "der": "Síntesis de proteínas por traducción del ARNm" },
      { "izq": "Aparato de Golgi",   "der": "Empaqueta y distribuye proteínas y lípidos hacia el exterior o lisosomas" },
      { "izq": "Cloroplasto",        "der": "Convierte energía lumínica en química (fotosíntesis: CO₂ + H₂O → glucosa)" }
    ],
    "explicacion": "Mitocondria: 'central energética'. Ribosoma: puede estar libre o en RER. Golgi: sistema de distribución internal. Cloroplasto: solo en células vegetales y algas.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },

  // ════════════════════════════════════════════════════════════
  // ORDENAR — Grado 10
  // ════════════════════════════════════════════════════════════
  {
    "id": "ORD-10-001", "tipo": "ordenar",
    "materia": "razonamiento", "tema": "método científico",
    "grado": 10, "dificultad": 2, "tiempo": 50,
    "enunciado": "Ordena las etapas del método científico de inicio a fin:",
    "items": [
      "Observación del fenómeno y formulación del problema",
      "Revisión de antecedentes (estado del arte)",
      "Formulación de hipótesis",
      "Diseño y ejecución del experimento controlado",
      "Análisis de datos y estadística",
      "Conclusiones y comunicación de resultados"
    ],
    "orden": [0, 1, 2, 3, 4, 5],
    "explicacion": "El método científico sigue este orden canónico: primero observar para identificar el problema, luego revisar bibliografía, plantear hipótesis verificable, experimentar controlando variables, analizar datos y finalmente concluir y publicar.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "ORD-10-002", "tipo": "ordenar",
    "materia": "biologia", "tema": "mitosis",
    "grado": 10, "dificultad": 3, "tiempo": 50,
    "enunciado": "Ordena las fases de la mitosis en secuencia correcta:",
    "items": [
      "Profase: condensación de cromosomas y formación del huso mitótico",
      "Metafase: alineación de cromosomas en la placa ecuatorial",
      "Anafase: separación de cromátidas hermanas hacia polos opuestos",
      "Telofase: formación de dos núcleos hijos y citocinesis"
    ],
    "orden": [0, 1, 2, 3],
    "explicacion": "Profase → Metafase → Anafase → Telofase. Mnemotecnia: PMAT. La mitosis garantiza que ambas células hijas reciban el mismo número de cromosomas que la célula madre.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "ORD-10-003", "tipo": "ordenar",
    "materia": "quimica", "tema": "formación de enlace iónico",
    "grado": 10, "dificultad": 3, "tiempo": 55,
    "enunciado": "Ordena los pasos que describen la formación del NaCl (cloruro de sodio):",
    "items": [
      "Na (metal alcalino) y Cl (halógeno) tienen alta diferencia de electronegatividad (ΔEN ≈ 2.1)",
      "El Na cede su electrón de valencia → Na⁺ (catión, configuración de gas noble Ne)",
      "El Cl acepta ese electrón → Cl⁻ (anión, configuración de gas noble Ar)",
      "La atracción electrostática entre Na⁺ y Cl⁻ forma el par iónico",
      "Millones de pares forman la red cristalina cúbica de NaCl sólido"
    ],
    "orden": [0, 1, 2, 3, 4],
    "explicacion": "La formación del NaCl ocurre por transferencia de e⁻ del Na al Cl. La gran diferencia de electronegatividad (Na = 0.93, Cl = 3.16) explica por qué el Na cede y el Cl acepta el electrón para estabilizarse.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "ORD-10-004", "tipo": "ordenar",
    "materia": "quimica", "tema": "electrólisis del agua",
    "grado": 10, "dificultad": 3, "tiempo": 55,
    "enunciado": "Ordena los pasos del proceso de electrólisis del agua:",
    "items": [
      "Disolver electrolito (H₂SO₄ o NaOH) para aumentar la conductividad del agua",
      "Aplicar voltaje de corriente directa (≥ 1.23 V) entre los electrodos",
      "Cátodo (−): 2H⁺ + 2e⁻ → H₂↑  (reducción)",
      "Ánodo (+): 2H₂O → O₂↑ + 4H⁺ + 4e⁻  (oxidación)",
      "Recoger los gases: relación de volúmenes H₂ : O₂ = 2 : 1"
    ],
    "orden": [0, 1, 2, 3, 4],
    "explicacion": "La electrólisis descompone el agua en H₂ y O₂. La reacción global es: 2H₂O → 2H₂ + O₂. Se produce el doble de hidrógeno que de oxígeno (2:1 en volumen, según la ley de los gases ideales).",
    "imagen": null, "autor": "iti-docente", "activa": true
  },

  // ════════════════════════════════════════════════════════════
  // CRUCIGRAMA — Grado 10
  // ════════════════════════════════════════════════════════════
  {
    "id": "CRU-10-001", "tipo": "crucigrama",
    "materia": "quimica", "tema": "estructura atómica",
    "grado": 10, "dificultad": 3, "tiempo": 90,
    "enunciado": "Completa el crucigrama de estructura atómica. Usa las pistas de horizontal y vertical:",
    "palabras": [
      { "texto": "PROTON",  "pista": "Partícula con carga +1 ubicada en el núcleo del átomo",                              "fila": 0, "col": 0, "dir": "H" },
      { "texto": "ORBITA",  "pista": "Trayectoria circular del electrón alrededor del núcleo (modelo de Bohr)",             "fila": 0, "col": 2, "dir": "V" },
      { "texto": "BORON",   "pista": "Semimetal del grupo 13, símbolo B, número atómico 5, clave en semiconductores",      "fila": 2, "col": 2, "dir": "H" },
      { "texto": "TITANIO", "pista": "Metal de transición biocompatible, símbolo Ti, número atómico 22, implantes médicos", "fila": 4, "col": 2, "dir": "H" }
    ],
    "explicacion": "PROTON: carga +1 en el núcleo. ORBITA: en el modelo de Bohr los electrones recorren órbitas circulares de energía fija. BORON: Z=5, semimetal utilizado en dopaje de semiconductores. TITANIO: Z=22, resistente y biocompatible.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "CRU-10-002", "tipo": "crucigrama",
    "materia": "fisica", "tema": "ondas y trabajo",
    "grado": 10, "dificultad": 3, "tiempo": 90,
    "enunciado": "Completa el crucigrama de física. Usa las pistas:",
    "palabras": [
      { "texto": "ONDA",    "pista": "Perturbación que transfiere energía sin transferir materia",                   "fila": 0, "col": 0, "dir": "H" },
      { "texto": "NEUTRON", "pista": "Partícula nuclear de carga cero con masa ≈ 1.675 × 10⁻²⁷ kg",                "fila": 0, "col": 1, "dir": "V" },
      { "texto": "TRABAJO", "pista": "W = F · d · cos(θ), medida en Joules; energía transferida por una fuerza",   "fila": 3, "col": 1, "dir": "H" },
      { "texto": "OPTICA",  "pista": "Rama de la física que estudia la luz, reflexión, refracción y difracción",   "fila": 5, "col": 1, "dir": "H" }
    ],
    "explicacion": "ONDA: v = λ·f. NEUTRON: sin carga, mantiene cohesión del núcleo. TRABAJO: escalar; W>0 si F y d en el mismo sentido. OPTICA: incluye el estudio de lentes, espejos y fenómenos luminosos.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },

  // ════════════════════════════════════════════════════════════
  // CLASIFICA — Grado 10
  // ════════════════════════════════════════════════════════════
  {
    "id": "CLA-10-001", "tipo": "clasifica",
    "materia": "quimica", "tema": "reacciones exotérmicas y endotérmicas",
    "grado": 10, "dificultad": 3, "tiempo": 60,
    "enunciado": "Clasifica cada proceso en la categoría correcta según si libera o absorbe energía:",
    "categorias": ["⚡ Exotérmica (libera calor)", "🔋 Endotérmica (absorbe calor)"],
    "items": [
      { "texto": "Combustión del metano: CH₄ + 2O₂ → CO₂ + 2H₂O + 890 kJ", "cat": 0 },
      { "texto": "Fotosíntesis: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂",       "cat": 1 },
      { "texto": "Termita: 2Al + Fe₂O₃ → Al₂O₃ + 2Fe  (llama intensa)",    "cat": 0 },
      { "texto": "Electrólisis: 2H₂O + energía → 2H₂ + O₂",                "cat": 1 },
      { "texto": "Neutralización: HCl + NaOH → NaCl + H₂O  (ΔH = −57 kJ)", "cat": 0 },
      { "texto": "Descomposición CaCO₃ → CaO + CO₂  (requiere > 840°C)",    "cat": 1 }
    ],
    "explicacion": "Exotérmicas: ΔH < 0 (liberan calor al entorno): combustión, termita, neutralización. Endotérmicas: ΔH > 0 (absorben calor): fotosíntesis, electrólisis, descomposición del CaCO₃.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "CLA-10-002", "tipo": "clasifica",
    "materia": "quimica", "tema": "compuestos orgánicos e inorgánicos",
    "grado": 10, "dificultad": 2, "tiempo": 55,
    "enunciado": "Clasifica cada compuesto según si es orgánico (contiene C−H) o inorgánico:",
    "categorias": ["🌿 Compuesto orgánico (C−H)", "🪨 Compuesto inorgánico"],
    "items": [
      { "texto": "Glucosa — C₆H₁₂O₆",       "cat": 0 },
      { "texto": "Cloruro de sodio — NaCl",  "cat": 1 },
      { "texto": "Etanol — C₂H₅OH",          "cat": 0 },
      { "texto": "Agua — H₂O",               "cat": 1 },
      { "texto": "Ácido acético — CH₃COOH",  "cat": 0 },
      { "texto": "Dióxido de carbono — CO₂", "cat": 1 }
    ],
    "explicacion": "Orgánicos: moléculas con cadena carbono-hidrógeno (C−H). Glucosa, etanol y ácido acético son orgánicos. Inorgánicos: NaCl (iónico), H₂O (polar), CO₂ (sin enlace C−H, sin cadena carbonada) son inorgánicos.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "CLA-10-003", "tipo": "clasifica",
    "materia": "fisica", "tema": "ondas mecánicas y electromagnéticas",
    "grado": 10, "dificultad": 2, "tiempo": 50,
    "enunciado": "Clasifica cada ejemplo según el tipo de onda:",
    "categorias": ["🔊 Onda mecánica (necesita medio)", "💡 Onda electromagnética (viaja en vacío)"],
    "items": [
      { "texto": "Sonido que viaja por el aire",             "cat": 0 },
      { "texto": "Luz visible del sol",                     "cat": 1 },
      { "texto": "Onda sísmica en la corteza terrestre",    "cat": 0 },
      { "texto": "Rayos X usados en diagnóstico médico",    "cat": 1 },
      { "texto": "Ola en el océano (ola de agua)",          "cat": 0 },
      { "texto": "Señal de radio FM / microondas",          "cat": 1 }
    ],
    "explicacion": "Mecánicas: necesitan medio material (sólido, líquido o gas). Electromagnéticas: son perturbaciones del campo electromagnético y se propagan en el vacío a c = 3×10⁸ m/s. El sonido NO puede viajar en el vacío; la luz sí.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "CLA-10-004", "tipo": "clasifica",
    "materia": "quimica", "tema": "pH — ácidos y bases",
    "grado": 10, "dificultad": 2, "tiempo": 50,
    "enunciado": "Clasifica cada sustancia como ácida (pH < 7) o básica (pH > 7):",
    "categorias": ["🔴 Ácido — pH < 7", "🔵 Base — pH > 7"],
    "items": [
      { "texto": "Jugo gástrico (HCl diluido) — pH ≈ 1.5",         "cat": 0 },
      { "texto": "Agua de mar (NaHCO₃ + sales) — pH ≈ 8.3",        "cat": 1 },
      { "texto": "Vinagre (ácido acético) — pH ≈ 3",               "cat": 0 },
      { "texto": "Bicarbonato de sodio NaHCO₃ — pH ≈ 8.4",         "cat": 1 },
      { "texto": "Jugo de limón (ácido cítrico) — pH ≈ 2.3",       "cat": 0 },
      { "texto": "Lejía / NaOH muy diluido — pH ≈ 12",             "cat": 1 }
    ],
    "explicacion": "Ácidos: [H⁺] > [OH⁻], pH < 7. Bases: [OH⁻] > [H⁺], pH > 7. A pH = 7 es neutro (agua pura). Recordar: estómago (pH ≈ 1.5) es muy ácido para activar la pepsina; bicarbonato lo neutraliza.",
    "imagen": null, "autor": "iti-docente", "activa": true
  }
];

const idsExistentes = new Set(banco.map(p => p.id));
const nuevasFiltradas = nuevas.filter(p => {
  if (idsExistentes.has(p.id)) { console.log(`⚠️  Duplicado omitido: ${p.id}`); return false; }
  return true;
});

const bancoActualizado = [...banco, ...nuevasFiltradas];
fs.writeFileSync(BANCO_PATH, JSON.stringify(bancoActualizado, null, 2), 'utf8');

const g10 = bancoActualizado.filter(p => p.grado === 10);
const tipoCount = {};
g10.forEach(p => { const t = p.tipo || 'seleccion'; tipoCount[t] = (tipoCount[t] || 0) + 1; });

console.log(`✅ Agregadas ${nuevasFiltradas.length} preguntas interactivas.`);
console.log(`📊 Total banco: ${bancoActualizado.length} | Grado 10: ${g10.length}`);
console.log('   Tipos grado 10:', JSON.stringify(tipoCount));
