import fs from 'fs';

const BANCO_PATH = './data/banco-preguntas.json';
const banco = JSON.parse(fs.readFileSync(BANCO_PATH, 'utf8'));

const nuevas = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FÍSICA 10° — Ondas (Preguntas 6-10)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    "id": "FIS-10-P06", "materia": "fisica", "tema": "propagación de ondas", "grado": 10, "dificultad": 2,
    "enunciado": "Durante una actividad en el laboratorio, una estudiante deja caer una pequeña piedra en un recipiente con agua en reposo. Desde el punto donde cae la piedra se forman ondas circulares que se desplazan hacia los bordes del recipiente. Un pequeño trozo de corcho que flota en el agua sube y baja cuando las ondas pasan por él, pero no se desplaza junto con ellas hasta el borde.\n\n¿Cuál explicación describe mejor lo que ocurre?",
    "opciones": [
      "La onda transporta energía a través del agua, mientras que las partículas del medio oscilan alrededor de su posición de equilibrio.",
      "La onda transporta toda el agua desde el centro del recipiente hasta los bordes.",
      "El corcho viaja hasta el borde porque las partículas de agua se desplazan permanentemente en la dirección de la onda.",
      "La onda transporta únicamente materia, pero no energía."
    ],
    "correcta": 0,
    "explicacion": "Una onda transfiere energía sin producir un transporte neto de materia. El corcho oscila pero no avanza, lo que confirma que la onda no arrastra las partículas del medio.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "FIS-10-P07", "materia": "fisica", "tema": "ondas transversales", "grado": 10, "dificultad": 2,
    "enunciado": "En una práctica de Física, un estudiante mueve periódicamente el extremo de una cuerda hacia arriba y hacia abajo. La perturbación avanza horizontalmente por la cuerda, mientras que cada segmento de ella oscila verticalmente.\n\n¿Cómo se clasifica la onda producida, según la relación entre la vibración del medio y la dirección de propagación?",
    "opciones": [
      "Longitudinal, porque las partículas vibran en la misma dirección en que avanza la onda.",
      "Sonora, porque todas las ondas producidas por una cuerda se propagan como sonido.",
      "Transversal, porque las partículas vibran perpendicularmente a la dirección de propagación.",
      "Electromagnética, porque no necesita un medio material para propagarse."
    ],
    "correcta": 2,
    "explicacion": "En una onda transversal, la dirección de vibración del medio es perpendicular a la dirección en que se propaga la perturbación. La mano mueve la cuerda verticalmente, pero la onda avanza horizontalmente.",
    "imagen": "img/preguntas/fis10_p7.jpeg", "autor": "iti-docente", "activa": true
  },
  {
    "id": "FIS-10-P08", "materia": "fisica", "tema": "longitud de onda", "grado": 10, "dificultad": 2,
    "enunciado": "Durante una actividad experimental, los estudiantes observan una onda periódica en una cuerda y elaboran el siguiente esquema.\n\nUn estudiante debe medir la distancia horizontal entre dos crestas consecutivas para comparar la onda con otras producidas en el mismo laboratorio.\n\n¿Cómo se denomina esa distancia?",
    "opciones": [
      "Frecuencia, porque indica cuántas oscilaciones ocurren en un segundo.",
      "Amplitud, porque representa la máxima separación respecto a la posición de equilibrio.",
      "Longitud de onda, porque corresponde a la distancia entre dos puntos consecutivos que están en la misma fase, como dos crestas.",
      "Período, porque indica el tiempo necesario para completar una oscilación."
    ],
    "correcta": 2,
    "explicacion": "La longitud de onda (λ) es la distancia entre dos puntos consecutivos de la onda que se encuentran en la misma fase, como dos crestas o dos valles.",
    "imagen": "img/preguntas/fis10_p8.jpeg", "autor": "iti-docente", "activa": true
  },
  {
    "id": "FIS-10-P09", "materia": "fisica", "tema": "frecuencia y longitud de onda", "grado": 10, "dificultad": 3,
    "enunciado": "En el laboratorio, un estudiante produce ondas en una cuerda manteniendo constante la tensión y utilizando la misma cuerda. Primero mueve su mano a una frecuencia de 2 Hz y luego aumenta la frecuencia a 4 Hz.\n\nSuponiendo que la rapidez de propagación de la onda permanece constante, ¿qué sucede con la longitud de onda?",
    "opciones": [
      "Se duplica, porque la longitud de onda aumenta en la misma proporción que la frecuencia.",
      "Se reduce a la mitad, porque al duplicarse la frecuencia debe disminuir la longitud de onda para conservar la rapidez de propagación.",
      "Permanece igual, porque la tensión de la cuerda no cambia.",
      "Se vuelve cero, porque las ondas de mayor frecuencia dejan de propagarse."
    ],
    "correcta": 1,
    "explicacion": "La rapidez de una onda se relaciona con su frecuencia y longitud de onda mediante v = f·λ. Si la rapidez permanece constante y la frecuencia se duplica (2→4 Hz), la longitud de onda se reduce a la mitad (3→1,5 m).",
    "imagen": "img/preguntas/fis10_p9.png", "autor": "iti-docente", "activa": true
  },
  {
    "id": "FIS-10-P10", "materia": "fisica", "tema": "sonido y vacío", "grado": 10, "dificultad": 2,
    "enunciado": "En una película de ciencia ficción, un astronauta observa una explosión cercana en el espacio exterior. La luz de la explosión llega hasta sus ojos, pero el astronauta no escucha el estruendo.\n\n¿Cuál explicación científica permite comprender esta situación?",
    "opciones": [
      "La luz solar impide que el sonido llegue hasta el astronauta.",
      "En el espacio exterior hay regiones de vacío en las que no existe suficiente materia para transmitir las ondas sonoras.",
      "Las ondas sonoras se convierten en ondas transversales al salir de la atmósfera.",
      "La gravedad detiene instantáneamente todas las ondas sonoras, pero permite el paso de la luz."
    ],
    "correcta": 1,
    "explicacion": "El sonido es una onda mecánica que requiere un medio material para propagarse. La luz, en cambio, es una onda electromagnética y puede viajar por el vacío. En el espacio no hay aire, por eso no se escucha.",
    "imagen": "img/preguntas/fis10_p10.jpeg", "autor": "iti-docente", "activa": true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // QUÍMICA 10° — Prueba 1 (Preguntas 1-6, 12, 13, 15, 17, 18, 21, 22, 24, 25, 27, 29)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    "id": "QUI-10-P01", "materia": "quimica", "tema": "propiedades de materiales", "grado": 10, "dificultad": 2,
    "enunciado": "En un laboratorio escolar se reciben cuatro muestras de materiales desconocidos con las siguientes propiedades:\n\nMuestra | Estado  | Conductividad | Solubilidad\n  A     | Sólido  | Alta          | Insoluble\n  B     | Sólido  | Muy baja      | Soluble\n  C     | Líquido | Muy baja      | Miscible\n  D     | Sólido  | Alta          | Soluble\n\nUn estudiante necesita identificar un material que permita fabricar un cable eléctrico y que NO se disuelva al entrar en contacto con el agua.\n\n¿Cuál muestra resulta más adecuada?",
    "opciones": [
      "La muestra A, porque combina alta conductividad eléctrica e insolubilidad en agua.",
      "La muestra B, porque su solubilidad facilita el transporte de la corriente eléctrica.",
      "La muestra C, porque los líquidos miscibles conducen mejor la electricidad.",
      "La muestra D, porque la solubilidad en agua aumenta necesariamente su conductividad."
    ],
    "correcta": 0,
    "explicacion": "La muestra A reúne las dos propiedades requeridas: alta conductividad eléctrica (necesaria para un cable) e insolubilidad en agua (resistente a la humedad).",
    "imagen": "img/preguntas/qui10_q1.jpeg", "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P02", "materia": "quimica", "tema": "densidad y flotabilidad", "grado": 10, "dificultad": 2,
    "enunciado": "Durante una práctica, un estudiante mide la masa y el volumen de tres cuerpos sólidos:\n\nCuerpo | Masa   | Volumen\n  X    | 120 g  | 40 cm³\n  Y    | 180 g  | 100 cm³\n  Z    | 90 g   | 30 cm³\n\nLos tres cuerpos se introducen en un líquido con densidad de 2,5 g/cm³. No reaccionan con el líquido.\n\n¿Cuál afirmación permite predecir correctamente el comportamiento de los cuerpos?",
    "opciones": [
      "X y Z se hunden, mientras que Y flota.",
      "X flota, mientras que Y y Z se hunden.",
      "Los tres flotan porque sus masas son inferiores a 200 g.",
      "Los tres se hunden porque son materiales sólidos."
    ],
    "correcta": 0,
    "explicacion": "Densidades: X = 120/40 = 3 g/cm³ (> 2,5 → se hunde), Y = 180/100 = 1,8 g/cm³ (< 2,5 → flota), Z = 90/30 = 3 g/cm³ (> 2,5 → se hunde). Un cuerpo flota si su densidad es menor que la del fluido.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P03", "materia": "quimica", "tema": "estados de la materia", "grado": 10, "dificultad": 2,
    "enunciado": "En una práctica de identificación de sustancias puras se obtienen los siguientes datos a presión atmosférica normal:\n\nSustancia | Punto de fusión | Punto de ebullición\n    P     |      0 °C       |      100 °C\n    Q     |     80 °C       |      218 °C\n    R     |    −39 °C       |      357 °C\n\nUn estudiante necesita seleccionar una sustancia que permanezca líquida a 25 °C y que pueda evaporarse mediante calentamiento moderado, sin alcanzar temperaturas superiores a 100 °C.\n\n¿Cuál sustancia cumple las condiciones?",
    "opciones": [
      "La sustancia P, porque su punto de ebullición es de 100 °C.",
      "La sustancia Q, porque su punto de fusión es superior a 25 °C.",
      "La sustancia R, porque a 25 °C es líquida, pero su punto de ebullición es demasiado alto.",
      "Las sustancias P y R, porque ambas permanecen líquidas a 25 °C y hierven a menos de 100 °C."
    ],
    "correcta": 0,
    "explicacion": "P es líquida a 25 °C (entre su punto de fusión 0 °C y ebullición 100 °C) y se evapora sin superar los 100 °C. Q es sólida a 25 °C. R es líquida a 25 °C pero hierve a 357 °C, lo que supera el límite establecido.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P04", "materia": "quimica", "tema": "solubilidad", "grado": 10, "dificultad": 2,
    "enunciado": "En una actividad sobre preparación de bebidas, un grupo de estudiantes agrega diferentes cantidades de azúcar a 100 mL de agua a 20 °C. Los resultados indican que, bajo esas condiciones, se disuelven como máximo 200 g de azúcar.\n\n¿Qué sucederá si se agregan 250 g de azúcar y se agita durante suficiente tiempo, manteniendo la temperatura en 20 °C?",
    "opciones": [
      "Todo el azúcar se disolverá porque la agitación aumenta la solubilidad máxima.",
      "Se disolverán 200 g y quedarán aproximadamente 50 g sin disolver.",
      "Se disolverán 250 g, pero la solución tendrá menor concentración.",
      "No se disolverá azúcar porque se ha superado el límite de solubilidad."
    ],
    "correcta": 1,
    "explicacion": "La solubilidad máxima es 200 g bajo las condiciones dadas. La agitación acelera la disolución pero no cambia el máximo. Por tanto, se disuelven 200 g y quedan 250 - 200 = 50 g sin disolver.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P05", "materia": "quimica", "tema": "conductividad eléctrica", "grado": 10, "dificultad": 2,
    "enunciado": "Una empresa necesita elegir un material para fabricar los contactos eléctricos de un dispositivo electrónico. El equipo compara tres materiales en estado sólido:\n\nMaterial | Conductividad eléctrica\n    M    | Alta\n    N    | Muy baja\n    O    | Intermedia\n\nPara la aplicación propuesta se requiere minimizar la resistencia eléctrica del contacto.\n\n¿Cuál decisión está mejor sustentada por los resultados?",
    "opciones": [
      "Elegir M, porque su alta conductividad indica menor oposición al paso de la corriente.",
      "Elegir N, porque una baja conductividad evita las pérdidas de energía eléctrica.",
      "Elegir O, porque una conductividad intermedia siempre garantiza mayor eficiencia.",
      "Elegir cualquiera, porque la conductividad eléctrica no depende del material."
    ],
    "correcta": 0,
    "explicacion": "Para minimizar la resistencia eléctrica se necesita la mayor conductividad posible. El material M tiene la conductividad más alta, por lo tanto presenta la menor resistencia al paso de la corriente.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P06", "materia": "quimica", "tema": "reacciones químicas", "grado": 10, "dificultad": 2,
    "enunciado": "En una planta de tratamiento de aguas residuales se usa cloro (Cl₂) para eliminar amoníaco (NH₃) contaminante, según la siguiente reacción:\n\n  2 NH₃  +  3 Cl₂  →  N₂  +  6 HCl\n\nCon base en la información anterior, ¿cuál de las siguientes afirmaciones explica correctamente lo que ocurre durante el proceso?",
    "opciones": [
      "Se produce una reacción química, porque el amoníaco y el cloro se transforman en nuevas sustancias con propiedades diferentes, como el nitrógeno y el cloruro de hidrógeno.",
      "Es un cambio físico, porque el amoníaco solo se mezcla con el cloro y no se forman nuevas sustancias.",
      "Se forma una mezcla de sustancias, pero no ocurre una reacción química, ya que no se observa un cambio de color.",
      "El proceso es una reacción química porque el cloro y los contaminantes desaparecen del agua."
    ],
    "correcta": 0,
    "explicacion": "En una reacción química, las sustancias iniciales se transforman en otras diferentes. La ecuación representa la formación de N₂ y HCl a partir de NH₃ y Cl₂. Las nuevas sustancias tienen propiedades distintas a los reactivos.",
    "imagen": "img/preguntas/qui10_q6.jpeg", "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P12", "materia": "quimica", "tema": "iones y átomos", "grado": 10, "dificultad": 2,
    "enunciado": "En una planta de tratamiento de agua se utilizan sales que contienen iones para favorecer determinados procesos químicos. Un ion sodio, representado como Na⁺, se forma cuando un átomo de sodio pierde un electrón.\n\n¿Qué cambio ocurre en el átomo de sodio cuando se convierte en ion sodio?",
    "opciones": [
      "Disminuye su número de protones y por eso adquiere carga positiva.",
      "Aumenta su número de neutrones y por eso adquiere carga positiva.",
      "Pierde un electrón y queda con una carga positiva neta, mientras su número de protones permanece igual.",
      "Gana un electrón y queda con una carga positiva neta."
    ],
    "correcta": 2,
    "explicacion": "El sodio neutro tiene igual número de protones (11) y electrones (11). Al perder un electrón queda con 11 protones y 10 electrones, dando una carga neta de +1. El número de protones no cambia.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P13", "materia": "quimica", "tema": "isótopos", "grado": 10, "dificultad": 2,
    "enunciado": "En medicina nuclear se emplean isótopos radiactivos, como el tecnecio-99m, para obtener imágenes que permiten estudiar el funcionamiento de algunos órganos. Los isótopos de un mismo elemento tienen igual número atómico, pero diferente número de neutrones.\n\n¿Cuál característica explica que dos isótopos del mismo elemento tengan diferente masa atómica, aunque pertenezcan al mismo elemento químico?",
    "opciones": [
      "Poseen diferente número de protones y el mismo número de electrones.",
      "Poseen igual número de protones, pero diferente número de neutrones.",
      "Poseen igual número de neutrones, pero diferente número de protones.",
      "Poseen diferente número de protones y diferente identidad química, aunque tengan el mismo símbolo."
    ],
    "correcta": 1,
    "explicacion": "Los isótopos comparten el número atómico (número de protones) y se diferencian en el número de neutrones. Como la masa atómica = protones + neutrones, al variar los neutrones varía la masa, pero la identidad química (determinada por los protones) permanece igual.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P15", "materia": "quimica", "tema": "presión y temperatura de gases", "grado": 10, "dificultad": 2,
    "enunciado": "Un conductor deja una llanta inflada al sol durante varias horas. La temperatura del aire en su interior aumenta. Si se supone que el volumen de la llanta cambia muy poco, se puede afirmar que...",
    "opciones": [
      "La presión aumenta porque las partículas del gas se mueven más rápido y sus choques contra las paredes de la llanta se vuelven más frecuentes e intensos.",
      "La presión aumenta porque las partículas del gas se vuelven más grandes y ocupan todo el espacio disponible.",
      "La presión disminuye porque el aire se transforma en líquido y ejerce mayor presión sobre las paredes.",
      "La presión disminuye porque las partículas pierden energía cinética y se agrupan en el centro de la llanta."
    ],
    "correcta": 0,
    "explicacion": "A volumen aproximadamente constante, el aumento de temperatura eleva la energía cinética promedio de las partículas. Al moverse más rápido, los choques contra las paredes son más frecuentes e intensos, lo que incrementa la presión.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P17", "materia": "quimica", "tema": "enlace iónico y metálico", "grado": 10, "dificultad": 3,
    "enunciado": "En una práctica, los estudiantes comparan cloruro de sodio sólido (NaCl) y cobre metálico (Cu). Observan que el cobre conduce electricidad en estado sólido, mientras que el NaCl sólido no conduce de manera apreciable. Sin embargo, el NaCl fundido sí puede conducir electricidad.\n\n¿Cuál explicación relaciona correctamente estas observaciones con el tipo de enlace?",
    "opciones": [
      "El cloruro de sodio sólido no conduce porque no contiene partículas con carga eléctrica.",
      "En el cobre existen electrones móviles que transportan carga; en el NaCl sólido, los iones están sujetos a posiciones de la red cristalina, pero al fundirse pueden desplazarse.",
      "El cobre conduce porque sus átomos se convierten espontáneamente en iones libres, mientras que el NaCl nunca contiene iones.",
      "El NaCl fundido conduce porque sus moléculas se vuelven electrones y dejan de tener carga eléctrica."
    ],
    "correcta": 1,
    "explicacion": "Los metales tienen electrones de conducción libres que permiten la corriente eléctrica en cualquier estado. En el NaCl sólido, los iones Na⁺ y Cl⁻ están fijos en la red cristalina; solo al fundirse quedan libres para moverse y conducir.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P18", "materia": "quimica", "tema": "propiedades coligativas", "grado": 10, "dificultad": 2,
    "enunciado": "En una región de clima frío, se esparce sal sobre el hielo de algunas vías para facilitar su derretimiento. Al disolverse la sal en el agua superficial, se forma una solución cuyo punto de congelación es menor que el del agua pura.\n\n¿Cuál explicación describe correctamente este fenómeno?",
    "opciones": [
      "La sal eleva la temperatura del hielo mediante una reacción química que produce calor en todos los casos.",
      "La sal convierte el agua en una sustancia pura diferente, cuyo punto de congelación es necesariamente mayor.",
      "La sal elimina las moléculas de agua y por eso el hielo desaparece sin que ocurra ningún cambio de fase.",
      "Las partículas disueltas modifican el equilibrio entre el agua líquida y el hielo, haciendo que la solución se congele a una temperatura menor que el agua pura."
    ],
    "correcta": 3,
    "explicacion": "La disminución del punto de congelación es una propiedad coligativa: las partículas disueltas (iones Na⁺ y Cl⁻) interfieren con la formación de la red cristalina del hielo, por lo que la solución necesita una temperatura más baja para congelarse.",
    "imagen": "img/preguntas/qui10_q18.jpeg", "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P21", "materia": "quimica", "tema": "diseño experimental", "grado": 10, "dificultad": 2,
    "enunciado": "Un grupo de estudiantes desea investigar cómo influye la cantidad de sal disuelta en agua sobre la conductividad eléctrica. Preparan cuatro muestras con 100 mL de agua del mismo recipiente, a la misma temperatura:\n\nSolución | Masa de sal disuelta\n    A    | 1 g\n    B    | 3 g\n    C    | 5 g\n    D    | 7 g\n\nUtilizan el mismo conductímetro en todas las muestras.\n\n¿Cuál es la principal ventaja del procedimiento utilizado?",
    "opciones": [
      "Permite estudiar la relación entre la cantidad de sal disuelta y la conductividad, manteniendo constantes el volumen, el tipo de agua y la temperatura.",
      "Permite demostrar que cualquier sustancia disuelta en agua aumenta siempre la conductividad eléctrica.",
      "Permite comprobar que la temperatura es la única variable que determina la conductividad de una solución.",
      "Permite determinar la solubilidad máxima de la sal sin necesidad de verificar si queda sólido sin disolver."
    ],
    "correcta": 0,
    "explicacion": "El diseño es correcto porque modifica solo la cantidad de sal (variable independiente) y mantiene constantes el volumen, el tipo de agua y la temperatura. Esto permite atribuir los cambios en la conductividad exclusivamente a la cantidad de sal.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P22", "materia": "quimica", "tema": "diseño experimental", "grado": 10, "dificultad": 2,
    "enunciado": "Una estudiante quiere comprobar si la temperatura del agua influye en la cantidad de azúcar que puede disolverse. Prepara tres recipientes con 100 mL de agua a 20 °C, 40 °C y 60 °C. Agrega azúcar en porciones y registra la masa máxima disuelta antes de que quede azúcar sin disolver.\n\n¿Cuál procedimiento adicional mejoraría la confiabilidad de los resultados?",
    "opciones": [
      "Utilizar recipientes de diferentes tamaños para observar más fácilmente las diferencias.",
      "Agregar cantidades iniciales diferentes de agua para que cada ensayo tenga condiciones particulares.",
      "Repetir los ensayos a cada temperatura, utilizando el mismo tipo de azúcar, el mismo volumen de agua y un procedimiento de agitación comparable.",
      "Aumentar la temperatura y cambiar simultáneamente el tipo de azúcar para obtener resultados más variados."
    ],
    "correcta": 2,
    "explicacion": "La repetición de los ensayos bajo condiciones equivalentes reduce la influencia de variaciones experimentales accidentales, aumentando la reproducibilidad y confiabilidad de los resultados.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P24", "materia": "quimica", "tema": "densidad experimental", "grado": 10, "dificultad": 2,
    "enunciado": "En un laboratorio escolar se recibe un bloque metálico desconocido. Un estudiante plantea la hipótesis de que el bloque podría ser aluminio y mide:\n\n• Masa: 54 g\n• Volumen (por desplazamiento de agua): 20 cm³\n• Densidad de referencia del aluminio: 2,7 g/cm³\n\n¿Cuál es la mejor conclusión basada en los datos?",
    "opciones": [
      "El bloque es necesariamente aluminio porque tiene apariencia metálica.",
      "El bloque no puede ser aluminio porque todos los metales tienen la misma densidad.",
      "El bloque es aluminio porque su masa es mayor que su volumen.",
      "La densidad experimental es 2,7 g/cm³, por lo que el resultado es compatible con la hipótesis, aunque conviene considerar la incertidumbre de las mediciones y otras posibles sustancias."
    ],
    "correcta": 3,
    "explicacion": "54 g ÷ 20 cm³ = 2,7 g/cm³. El valor concuerda con la densidad de referencia del aluminio, pero no lo identifica de forma exclusiva: otras sustancias podrían tener densidades similares. La conclusión correcta reconoce la compatibilidad con la hipótesis y la necesidad de pruebas adicionales.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P25", "materia": "quimica", "tema": "investigación científica", "grado": 10, "dificultad": 2,
    "enunciado": "Un grupo de estudiantes quiere investigar cómo varía la reactividad de los metales alcalinos al descender en el grupo 1 de la tabla periódica. Para evitar accidentes, no manipularán los metales directamente; analizarán datos experimentales de fuentes científicas confiables.\n\n¿Cuál estrategia de investigación permitiría responder mejor la pregunta?",
    "opciones": [
      "Comparar datos de reactividad de litio, sodio y potasio obtenidos bajo condiciones equivalentes y analizar la tendencia observada.",
      "Comparar el color de muestras de metales diferentes y concluir que el más brillante es el más reactivo.",
      "Analizar únicamente el precio comercial de cada metal y utilizarlo como medida directa de reactividad.",
      "Consultar datos de un solo metal y extrapolar la conclusión a todos los elementos de la tabla periódica."
    ],
    "correcta": 0,
    "explicacion": "Comparar datos de reactividad obtenidos bajo condiciones equivalentes para litio, sodio y potasio permite identificar una tendencia con evidencia científica. Extrapolaciones de un solo elemento o medidas indirectas (color, precio) no son métodos válidos.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P27", "materia": "quimica", "tema": "separación de mezclas", "grado": 10, "dificultad": 2,
    "enunciado": "En una práctica se entrega a los estudiantes una mezcla de arena, sal y limaduras de hierro. El propósito es recuperar los tres componentes utilizando procedimientos físicos.\n\n¿Cuál secuencia experimental es la más adecuada?",
    "opciones": [
      "Agregar agua, evaporar inmediatamente toda la mezcla y separar los residuos por color.",
      "Separar primero las limaduras con un imán, agregar agua a la mezcla restante, filtrar para recuperar la arena y evaporar el agua del filtrado para recuperar la sal.",
      "Filtrar la mezcla seca, agregar un imán al filtrado y calentar la arena hasta convertirla en sal.",
      "Calentar toda la mezcla hasta fundir los componentes y después separarlos con un filtro de papel."
    ],
    "correcta": 1,
    "explicacion": "La secuencia correcta aprovecha las propiedades diferentes de cada componente: 1) imantación para separar el hierro, 2) disolución en agua + filtración para separar la arena (insoluble), y 3) evaporación para recuperar la sal disuelta.",
    "imagen": null, "autor": "iti-docente", "activa": true
  },
  {
    "id": "QUI-10-P29", "materia": "quimica", "tema": "solubilidad", "grado": 10, "dificultad": 2,
    "enunciado": "Un estudiante investiga la solubilidad de una sustancia sólida en 100 mL de agua a temperatura constante y registra:\n\nMasa agregada | Observación\n    10 g      | Se disuelve completamente\n    20 g      | Se disuelve completamente\n    30 g      | Se disuelve completamente\n    40 g      | Queda una pequeña cantidad de sólido sin disolver\n\n¿Cuál conclusión está mejor respaldada por los resultados?",
    "opciones": [
      "La sustancia es insoluble en agua porque una parte no se disuelve en el último ensayo.",
      "La solubilidad es exactamente 40 g por cada 100 mL de agua, porque esa fue la cantidad agregada.",
      "La cantidad máxima disuelta está entre 30 g y 40 g por cada 100 mL de agua, bajo las condiciones del experimento, y se requieren mediciones adicionales para precisarla.",
      "La solubilidad aumenta indefinidamente al agregar más soluto, sin importar la temperatura."
    ],
    "correcta": 2,
    "explicacion": "Los datos muestran que 30 g se disuelven completamente pero 40 g no. Por tanto, la solubilidad máxima está en el intervalo (30, 40) g/100 mL. No se puede afirmar que sea exactamente 40 g, ya que no se sabe cuánto del cuarto ensayo quedó sin disolver.",
    "imagen": null, "autor": "iti-docente", "activa": true
  }
];

// Verificar que no haya IDs duplicados
const idsExistentes = new Set(banco.map(p => p.id));
const nuevasFiltradas = nuevas.filter(p => {
  if (idsExistentes.has(p.id)) {
    console.log(`⚠️  ID duplicado, omitiendo: ${p.id}`);
    return false;
  }
  return true;
});

const bancoActualizado = [...banco, ...nuevasFiltradas];
fs.writeFileSync(BANCO_PATH, JSON.stringify(bancoActualizado, null, 2), 'utf8');
console.log(`✅ Agregadas ${nuevasFiltradas.length} preguntas. Total: ${bancoActualizado.length}`);
