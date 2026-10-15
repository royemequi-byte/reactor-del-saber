import fs from 'fs';

const BANCO_PATH = './data/banco-preguntas.json';
const banco = JSON.parse(fs.readFileSync(BANCO_PATH, 'utf8'));

const nuevas = [
  {
    "id": "RAZ-10-001", "materia": "razonamiento", "tema": "interpretación de datos", "grado": 10, "dificultad": 2,
    "enunciado": "Un estudiante realiza un experimento y registra los siguientes datos:\n\nTiempo (s) | Temperatura (°C)\n     0     |       20\n    10     |       35\n    20     |       50\n    30     |       65\n    40     |       80\n\n¿Cuál es la conclusión más adecuada según los datos?",
    "opciones": [
      "La temperatura aumenta 15 °C cada 10 segundos de forma constante.",
      "La temperatura disminuye con el tiempo.",
      "No hay relación entre el tiempo y la temperatura.",
      "La temperatura se duplica cada 10 segundos."
    ],
    "correcta": 0,
    "explicacion": "Observando la tabla: 20→35→50→65→80, el incremento es siempre 15 °C cada 10 segundos. Eso indica una relación lineal constante entre tiempo y temperatura.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-002", "materia": "razonamiento", "tema": "variables experimentales", "grado": 10, "dificultad": 2,
    "enunciado": "Una estudiante quiere saber si el color de la luz afecta el crecimiento de una planta. Toma 4 plantas iguales y las coloca bajo luz roja, azul, verde y blanca respectivamente, durante 30 días. Riega todas con la misma cantidad de agua y las mantiene a la misma temperatura.\n\n¿Cuál es la variable independiente en este experimento?",
    "opciones": [
      "El crecimiento de la planta.",
      "El color de la luz.",
      "La cantidad de agua.",
      "La temperatura."
    ],
    "correcta": 1,
    "explicacion": "La variable independiente es la que el investigador manipula deliberadamente. En este caso, la estudiante cambia el color de la luz. El crecimiento es la variable dependiente (lo que se mide), y el agua y la temperatura son variables controladas.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-003", "materia": "razonamiento", "tema": "secuencias lógicas", "grado": 10, "dificultad": 2,
    "enunciado": "Observa la siguiente secuencia numérica:\n\n2 — 6 — 18 — 54 — ___\n\n¿Cuál es el número que continúa la serie?",
    "opciones": [
      "108",
      "162",
      "72",
      "216"
    ],
    "correcta": 1,
    "explicacion": "Cada número se multiplica por 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162. La razón de la progresión geométrica es 3.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-004", "materia": "razonamiento", "tema": "hipótesis científica", "grado": 10, "dificultad": 2,
    "enunciado": "Un científico observa que las plantas de su jardín crecen más altas del lado que da hacia el sol. Formula la siguiente afirmación: \"Las plantas crecen en dirección a la fuente de luz.\"\n\n¿Cómo se clasifica correctamente esta afirmación?",
    "opciones": [
      "Es una conclusión definitiva porque se observó directamente.",
      "Es una hipótesis porque es una explicación provisional que puede verificarse con más experimentos.",
      "Es una ley científica porque describe un patrón de comportamiento universal.",
      "Es una opinión personal sin valor científico."
    ],
    "correcta": 1,
    "explicacion": "Una hipótesis es una explicación tentativa y verificable de una observación. La afirmación puede ponerse a prueba con experimentos controlados. No es una ley ni una conclusión definitiva porque aún no se ha comprobado rigurosamente.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-005", "materia": "razonamiento", "tema": "analogías", "grado": 10, "dificultad": 2,
    "enunciado": "Completa la analogía:\n\nNúcleo es a célula como _______ es a sistema solar.",
    "opciones": [
      "Planeta",
      "Órbita",
      "Sol",
      "Satélite"
    ],
    "correcta": 2,
    "explicacion": "El núcleo es el centro de control y la parte más importante de la célula. El Sol es el centro del sistema solar y contiene la mayor masa. La relación es: elemento central → sistema que lo rodea.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-006", "materia": "razonamiento", "tema": "causa y efecto", "grado": 10, "dificultad": 2,
    "enunciado": "Un investigador nota que en los años en que se venden más helados, también aumentan los casos de ahogamiento en piscinas y ríos.\n\n¿Cuál es la interpretación científicamente correcta de esta relación?",
    "opciones": [
      "Comer helado causa ahogamiento.",
      "Los ahogados consumieron helado antes de entrar al agua.",
      "Ambos fenómenos aumentan en verano; el calor es la causa común, no existe relación directa entre ellos.",
      "Vender más helado previene el ahogamiento."
    ],
    "correcta": 2,
    "explicacion": "Correlación no implica causalidad. Tanto el consumo de helado como el baño en piscinas aumentan en temporadas de calor. La variable oculta es la temperatura alta. Este es un ejemplo clásico de correlación espuria.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-007", "materia": "razonamiento", "tema": "interpretación de gráficas", "grado": 10, "dificultad": 2,
    "enunciado": "Una gráfica muestra la velocidad de un automóvil durante un recorrido:\n\n• Del minuto 0 al 5: velocidad sube de 0 a 60 km/h\n• Del minuto 5 al 15: velocidad constante en 60 km/h\n• Del minuto 15 al 20: velocidad baja de 60 a 0 km/h\n\n¿En qué intervalo el automóvil tiene aceleración igual a cero?",
    "opciones": [
      "Del minuto 0 al 5.",
      "Del minuto 5 al 15.",
      "Del minuto 15 al 20.",
      "En todo el recorrido."
    ],
    "correcta": 1,
    "explicacion": "La aceleración es el cambio de velocidad en el tiempo. Del minuto 5 al 15 la velocidad permanece constante en 60 km/h, por lo tanto el cambio de velocidad es cero y la aceleración es cero.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-008", "materia": "razonamiento", "tema": "deducción lógica", "grado": 10, "dificultad": 3,
    "enunciado": "Lee las siguientes afirmaciones:\n\n1. Todos los metales conducen electricidad.\n2. El cobre es un metal.\n\n¿Qué conclusión se deduce lógicamente?",
    "opciones": [
      "El cobre no conduce electricidad.",
      "Algunos metales no conducen electricidad.",
      "El cobre conduce electricidad.",
      "Solo el cobre conduce electricidad."
    ],
    "correcta": 2,
    "explicacion": "Es un silogismo deductivo: si todos los metales conducen electricidad (premisa 1) y el cobre es un metal (premisa 2), entonces necesariamente el cobre conduce electricidad (conclusión). La deducción es válida.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-009", "materia": "razonamiento", "tema": "identificar errores en experimentos", "grado": 10, "dificultad": 2,
    "enunciado": "Un estudiante quiere demostrar que el fertilizante X mejora el crecimiento de las plantas. Toma una planta, le aplica el fertilizante, y después de 2 semanas concluye que la planta creció más que antes.\n\n¿Cuál es el principal error en su experimento?",
    "opciones": [
      "Usó fertilizante en lugar de agua.",
      "No tuvo un grupo de control (planta sin fertilizante) para comparar.",
      "Esperó solo 2 semanas.",
      "Usó una sola planta en lugar de dos."
    ],
    "correcta": 1,
    "explicacion": "Sin un grupo de control, no puede saberse si el crecimiento se debe al fertilizante o a otros factores como la luz, el tiempo o el ciclo natural de la planta. Todo experimento necesita un grupo control para comparar resultados.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-010", "materia": "razonamiento", "tema": "secuencias lógicas", "grado": 10, "dificultad": 2,
    "enunciado": "Observa el patrón:\n\n1, 4, 9, 16, 25, ___\n\n¿Qué número continúa la serie?",
    "opciones": [
      "30",
      "36",
      "35",
      "49"
    ],
    "correcta": 1,
    "explicacion": "Son los cuadrados perfectos: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36. El siguiente término es 6² = 36.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-011", "materia": "razonamiento", "tema": "evaluación de argumentos", "grado": 10, "dificultad": 3,
    "enunciado": "Un estudiante argumenta: \"No debemos preocuparnos por el calentamiento global porque el clima siempre ha cambiado naturalmente a lo largo de la historia de la Tierra.\"\n\n¿Cuál es la debilidad principal de este argumento?",
    "opciones": [
      "El clima nunca ha cambiado en la historia de la Tierra.",
      "Ignora que la velocidad actual del cambio climático es significativamente mayor que los cambios naturales históricos y está asociada a la actividad humana.",
      "El calentamiento global no existe según los científicos.",
      "Los cambios naturales del clima son más graves que los actuales."
    ],
    "correcta": 1,
    "explicacion": "Aunque el clima ha cambiado naturalmente, el argumento ignora la evidencia de que el ritmo actual de cambio es mucho más rápido que los ciclos naturales y está correlacionado con el aumento de CO₂ por actividad humana. Reconocer cambios naturales no descarta la influencia humana.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-012", "materia": "razonamiento", "tema": "interpretación de datos", "grado": 10, "dificultad": 2,
    "enunciado": "Cuatro estudiantes midieron la masa de un objeto con la misma balanza y obtuvieron:\n\nEstudiante | Resultado\n    A      | 25,1 g\n    B      | 25,3 g\n    C      | 25,0 g\n    D      | 25,2 g\n\nEl fabricante indica que la masa real es 25,2 g.\n\n¿Qué afirmación describe mejor las mediciones?",
    "opciones": [
      "Son precisas pero no exactas, porque están muy juntas entre sí pero alejadas del valor real.",
      "Son exactas y precisas, porque están cercanas entre sí y al valor real.",
      "Son exactas pero no precisas, porque solo D acertó el valor real.",
      "No son ni exactas ni precisas, porque ningún resultado es idéntico al real."
    ],
    "correcta": 1,
    "explicacion": "Precisión: los valores están muy cercanos entre sí (25,0-25,3 g). Exactitud: los valores están cercanos al valor real de 25,2 g. Cuando las mediciones son consistentes entre sí y con el valor real, son a la vez precisas y exactas.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-013", "materia": "razonamiento", "tema": "analogías científicas", "grado": 10, "dificultad": 2,
    "enunciado": "Completa la analogía:\n\nElectrón es a átomo como _______ es a sistema solar.",
    "opciones": [
      "Sol",
      "Asteroide",
      "Planeta",
      "Galaxia"
    ],
    "correcta": 2,
    "explicacion": "El electrón orbita alrededor del núcleo del átomo, así como los planetas orbitan alrededor del Sol en el sistema solar. La analogía compara las partes que orbitan al centro.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-014", "materia": "razonamiento", "tema": "pensamiento crítico", "grado": 10, "dificultad": 3,
    "enunciado": "Una empresa farmacéutica publica un estudio que afirma que su medicamento reduce el dolor en un 90% de los pacientes. El estudio fue financiado por la misma empresa y no fue revisado por científicos independientes.\n\n¿Cuál es la actitud científicamente correcta ante este resultado?",
    "opciones": [
      "Aceptar el resultado porque el porcentaje es muy alto.",
      "Rechazarlo completamente porque las empresas siempre mienten.",
      "Considerarlo como evidencia preliminar y esperar estudios independientes que lo confirmen o refuten.",
      "Ignorarlo porque solo los estudios universitarios son válidos."
    ],
    "correcta": 2,
    "explicacion": "En ciencia, los resultados deben ser reproducibles y verificados por terceros independientes. Un estudio financiado por quien se beneficia tiene posible sesgo de confirmación. La actitud correcta es considerarlo como evidencia inicial hasta que sea replicado por fuentes independientes.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "RAZ-10-015", "materia": "razonamiento", "tema": "deducción lógica", "grado": 10, "dificultad": 3,
    "enunciado": "En una clase hay 30 estudiantes. 18 practican fútbol, 12 practican baloncesto y 5 practican ambos deportes.\n\n¿Cuántos estudiantes no practican ninguno de los dos deportes?",
    "opciones": [
      "5",
      "3",
      "0",
      "10"
    ],
    "correcta": 0,
    "explicacion": "Usando la fórmula de conjuntos: |Fútbol ∪ Baloncesto| = 18 + 12 - 5 = 25 estudiantes practican al menos un deporte. Los que no practican ninguno: 30 - 25 = 5 estudiantes.",
    "imagen": null, "autor": "iti-docente", "activa": true
  }
];

const idsExistentes = new Set(banco.map(p => p.id));
const nuevasFiltradas = nuevas.filter(p => {
  if (idsExistentes.has(p.id)) { console.log(`⚠️ Duplicado: ${p.id}`); return false; }
  return true;
});

const bancoActualizado = [...banco, ...nuevasFiltradas];
fs.writeFileSync(BANCO_PATH, JSON.stringify(bancoActualizado, null, 2), 'utf8');
console.log(`✅ Agregadas ${nuevasFiltradas.length} preguntas de razonamiento. Total grado 10: ${bancoActualizado.filter(p=>p.grado===10).length}. Total banco: ${bancoActualizado.length}`);
