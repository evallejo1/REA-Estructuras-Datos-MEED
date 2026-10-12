/**
 * help_content.js
 * Sistema de ayuda contextual del REA.
 * Contenido pedagógico estructurado por panel/estructura.
 */

const HelpContent = {

  /* ============================================================ */
  /* ALGORITMOS                                                    */
  /* ============================================================ */

  sorting: {
    icono: '📊',
    titulo: 'Algoritmos de Ordenamiento',
    resumen: 'Los algoritmos de ordenamiento reorganizan los elementos de una colección según un criterio (aquí: ascendente). Se estudian porque son la base de muchísimas operaciones: búsquedas eficientes, agrupaciones, reportes y hasta renderizado visual.',
    conceptosClave: [
      { termino: 'Comparación', detalle: 'Operación elemental que pregunta "¿A es mayor que B?". Es la métrica más usada para medir el costo.' },
      { termino: 'Intercambio (swap)', detalle: 'Mover dos elementos de lugar. En Bubble/Selection/Quick sí son swaps reales; en Insertion/Merge son desplazamientos.' },
      { termino: 'Estabilidad', detalle: 'Un algoritmo es estable si conserva el orden relativo de elementos con la misma clave. Relevante cuando ordenás por un criterio secundario.' },
      { termino: 'In-place', detalle: 'Algoritmo que usa O(1) o O(log n) de memoria extra. Bubble, Selection, Insertion, Quick, Heap y Shell son in-place; Merge no.' }
    ],
    pasos: [
      'Elegí un algoritmo en el desplegable "Algoritmo".',
      'Observá el panel de Análisis de Complejidad: mejor, promedio, peor caso y estabilidad.',
      'Presioná "▶ Iniciar" para animar la ejecución, o "⏭ Paso Adelante" para ir paso a paso.',
      'Mirá el pseudocódigo en la esquina inferior derecha: se resalta la línea que está ejecutándose.',
      'En la consola didáctica (columna derecha) se registra cada operación con su índice y valores.',
      'Al terminar, todos los elementos quedan marcados como ordenados (verde).'
    ],
    ejercicios: [
      'Cargá datos_inversos.csv y compará Bubble vs Quick. ¿Cuántas comparaciones hace cada uno?',
      'Con el mismo dataset, probá Insertion. ¿Por qué se vuelve tan lento cuando el arreglo está al revés?',
      'Ordená un dataset casi ordenado con Insertion y con Quick. ¿Cuál gana? ¿Por qué?',
      'Ejecutá Merge y observá que los subarreglos se van "fusionando" a medida que avanza.'
    ],
    tips: [
      'Usá el slider de velocidad para acelerar el final de una animación larga.',
      'El botón "↺ Reiniciar" restaura el dataset original sin recargar la página.',
      'Podés cambiar el algoritmo a mitad de una animación: se reinicia automáticamente.'
    ],
    erroresComunes: [
      'Confundir "swaps" con "comparaciones". En Insertion hay muchas comparaciones y pocos swaps reales.',
      'Creer que Quick siempre es O(n log n). Su peor caso (pivote extremo en cada partición) es O(n²).',
      'Pensar que "ordenado" siempre significa ascendente. El criterio depende del algoritmo.'
    ]
  },

  searching: {
    icono: '🔍',
    titulo: 'Algoritmos de Búsqueda',
    resumen: 'Buscar es encontrar la posición de un elemento en una colección. La búsqueda lineal examina todo; la búsqueda binaria descarta la mitad del espacio en cada paso. Este REA incluye además 24 variantes pedagógicas que combinan distintas decisiones de diseño.',
    conceptosClave: [
      { termino: 'Búsqueda Lineal', detalle: 'Recorre desde el inicio hasta encontrar el objetivo o agotar el arreglo. O(n) en el peor caso. No requiere arreglo ordenado.' },
      { termino: 'Bisección (Binary Search)', detalle: 'Divide el espacio en 2, evalúa el punto medio, descarta una mitad. O(log n). Requiere arreglo ordenado.' },
      { termino: 'Trisección (Ternary Search)', detalle: 'Divide el espacio en 3, evalúa dos puntos, descarta 2/3 del rango. O(log₃ n).' },
      { termino: 'Punto medio (mid)', detalle: 'Posición que se evalúa. Puede calcularse con sesgo izquierdo, centro o derecho según cómo se redondee.' },
      { termino: 'Segmento mayor', detalle: 'Cuando el tamaño no es divisible, ¿a qué subintervalo va el residuo? A la izquierda, al centro o a la derecha.' },
      { termino: 'Manejo de límites', detalle: 'Cómo actualizar low y high tras descartar: estricto (mid±1), inclusivo inferior (low=mid), inclusivo superior (high=mid), o conducente (low=high=mid).' },
      { termino: 'Las 24 Permutaciones', detalle: '2 divisiones × 3 sesgos de segmento × 4 políticas de límites = 24 variantes. Todas son correctas si convergen, pero difieren en comportamiento.' }
    ],
    pasos: [
      'Elegí el modo: "Búsqueda Binaria / N-aria (24 Permutaciones)" o "Búsqueda Lineal".',
      'Si elegiste permutaciones, usá el selector grande para elegir una de las 24 (P-01 a P-24).',
      'Alternativamente, ajustá los 3 selects de la fila inferior (División / Segmento / Límite) y la permutación cambiará automáticamente.',
      'Ingresá el valor objetivo, o usá "🎲 Existe" / "🚫 No existe" para elegir al azar.',
      'Si el arreglo no está ordenado, presioná "⇅ Auto-ordenar array" (obligatorio para bisección/trisección).',
      'Presioná "▶ Buscar Todo" o avanzá con "⏭ Paso Adelante".',
      'Observá los punteros L (low), H (high), MID (bisección) o M1/M2 (trisección) sobre las celdas.',
      'El pseudocódigo a la derecha cambia entre bisección y trisección según la permutación activa.'
    ],
    ejercicios: [
      'Corré la permutación P-01 (Bisección | Izquierda | Estricta) sobre datos_numeros ordenado, buscando un valor existente. Contá las comparaciones.',
      'Corré P-13 (Trisección | Izquierda | Estricta). ¿Hace menos o más comparaciones que P-01?',
      'Probá P-12 (Bisección | Derecha | Bilateral). ¿Termina siempre? ¿Cuántas iteraciones necesita?',
      'Buscá un valor que NO existe. Observá cómo las permutaciones con límites inclusivos tardan más en converger.'
    ],
    tips: [
      'Para entender las diferencias entre permutaciones, compará el mismo valor objetivo en distintas variantes.',
      'El contador "Comparaciones" se reinicia en cada búsqueda.',
      'Las permutaciones con "Límites Conducentes" son pedagógicamente interesantes: muestran convergencia conservadora.'
    ],
    erroresComunes: [
      'Ejecutar bisección sobre un arreglo desordenado: los resultados serán incorrectos silenciosamente.',
      'Confundir O(log n) con "mucho más rápido siempre": para n chico, la lineal puede empatar o ganar.',
      'Pensar que "más particiones = más rápido". Trisección hace menos iteraciones pero más comparaciones por iteración.'
    ]
  },

  race: {
    icono: '🏁',
    titulo: 'Comparador en Paralelo (Race Mode)',
    resumen: 'Ejecuta dos algoritmos de ordenamiento simultáneamente sobre el MISMO dataset, avanzando un paso de cada uno por turno. Es la forma más directa de ver por qué O(n log n) aplasta a O(n²) cuando n crece.',
    conceptosClave: [
      { termino: 'Step-lock', detalle: 'Sincronización por paso: en cada iteración, ambos algoritmos avanzan un paso. Es justo pero no refleja el tiempo real.' },
      { termino: 'Ganador', detalle: 'El algoritmo que primero emite su paso "completado". En step-lock, gana quien necesite menos pasos totales.' },
      { termino: 'Métricas comparadas', detalle: 'Comparaciones, swaps y pasos totales. Se muestran lado a lado para cada competidor.' }
    ],
    pasos: [
      'Elegí los dos algoritmos en los desplegables (Algoritmo 1 vs Algoritmo 2).',
      'Presioná "▶ Iniciar Duelo" para animación automática.',
      'O usá "⏭ Paso a Paso" para avanzar de a un paso de cada algoritmo.',
      'Mirá los HUD de cada tarjeta: muestran en vivo sus contadores.',
      'La tarjeta del ganador se resalta al cruzar la meta.'
    ],
    ejercicios: [
      'Quick Sort vs Bubble Sort con datos_numeros. ¿Cuántas veces más pasos hace Bubble?',
      'Insertion vs Bubble sobre un dataset casi ordenado. ¿Cuál gana?',
      'Merge vs Quick sobre el mismo dataset aleatorio. ¿Empatan o hay diferencia?',
      'Insertion vs Selection sobre datos_inversos. ¿Por qué Insertion hace muchísimos más swaps?'
    ],
    tips: [
      'La velocidad del Race es automáticamente la mitad del slider principal, para que los duelos no duren una eternidad.',
      'Si un algoritmo termina antes, el otro sigue avanzando hasta completar (no se detiene el duelo).',
      'Los contadores finales quedan visibles para comparar.'
    ],
    erroresComunes: [
      'Creer que el ganador en step-lock es el "más rápido" en la realidad. Un paso de Quick puede involucrar más trabajo que un paso de Bubble.',
      'Comparar algoritmos sobre datasets distintos: el Race siempre usa el mismo dataset para los dos.'
    ]
  },

  benchmark: {
    icono: '📈',
    titulo: 'Benchmarking Empírico',
    resumen: 'Ejecuta los 7 algoritmos de ordenamiento sobre tamaños crecientes (N = 10, 25, 50, 100, 200, 400) y grafica las operaciones y tiempos medidos. Es la contraparte empírica de la teoría de complejidad.',
    conceptosClave: [
      { termino: 'Curva empírica', detalle: 'Representación gráfica de cómo crece el costo real de un algoritmo a medida que N aumenta. Permite confirmar visualmente O(n²) vs O(n log n).' },
      { termino: 'Operaciones', detalle: 'Suma de comparaciones + swaps. Es determinista para un mismo dataset.' },
      { termino: 'Tiempo (ms)', detalle: 'Medición con performance.now(), tomando el mínimo de 5 repeticiones. A N chico puede haber ruido.' },
      { termino: 'Divergencia asintótica', detalle: 'A N grande, las curvas O(n²) se disparan mientras las O(n log n) crecen suavemente.' }
    ],
    pasos: [
      'Presioná "⚡ Ejecutar Prueba Empírica". Se corren 42 pruebas (7 algos × 6 N × 5 reps).',
      'Observá el gráfico: cada color es un algoritmo (leyenda a la derecha).',
      'Identificá visualmente qué curvas crecen más rápido.',
      'Presioná "💾 Descargar Reporte CSV" para exportar los datos crudos.',
      'Abrí el CSV en Excel/Sheets para graficar por tu cuenta.'
    ],
    ejercicios: [
      'Compará visualmente Bubble vs Merge a N=400. ¿Cuántas veces más operaciones hace Bubble?',
      '¿Qué algoritmo tiene mejor desempeño empírico a N=10? ¿Coincide con la teoría?',
      'Exportá el CSV y graficá "operaciones vs N" en escala logarítmica. ¿Qué pendiente tiene cada curva?',
      '¿Por qué Heap Sort es más lento que Quick en la práctica, si ambos son O(n log n)?'
    ],
    tips: [
      'Si querés resultados más estables, cerrá otras pestañas del navegador antes de correr.',
      'Los tamaños se generan aleatoriamente en cada corrida: dos ejecuciones no dan el mismo resultado.',
      'El reporte CSV incluye el tiempo en milisegundos con 4 decimales.'
    ],
    erroresComunes: [
      'Esperar curvas perfectamente suaves: hay ruido por la aleatoriedad y el timer del sistema.',
      'Confundir "operaciones" con "tiempo": las operaciones son deterministas, el tiempo no.',
      'Asumir que el algoritmo con menos operaciones siempre es el más rápido en tiempo real.'
    ]
  },

  /* ============================================================ */
  /* ESTRUCTURAS LINEALES                                          */
  /* ============================================================ */

  stack: {
    icono: '🥞',
    titulo: 'Pila (Stack) — LIFO',
    resumen: 'Una pila es una colección con acceso restringido a un solo extremo, la cima. El último elemento en entrar es el primero en salir (Last In, First Out). Es la estructura detrás de la recursión, el deshacer (Ctrl+Z), la evaluación de expresiones y el recorrido DFS.',
    conceptosClave: [
      { termino: 'LIFO', detalle: 'Last In, First Out. El último en entrar es el primero en salir.' },
      { termino: 'Top (cima)', detalle: 'Único extremo accesible. Ahí se hacen todas las operaciones.' },
      { termino: 'PUSH', detalle: 'Insertar un elemento en la cima. O(1).' },
      { termino: 'POP', detalle: 'Extraer el elemento de la cima. O(1).' },
      { termino: 'PEEK', detalle: 'Consultar la cima sin extraerla. O(1).' },
      { termino: 'Stack Overflow', detalle: 'Intento de PUSH con la pila llena (capacidad máxima alcanzada).' },
      { termino: 'Stack Underflow', detalle: 'Intento de POP con la pila vacía.' }
    ],
    pasos: [
      'Ajustá la capacidad máxima (3 a 15) con el input "Capacidad Máx".',
      'Ingresá un valor o dejà vacío para usar uno aleatorio.',
      'Presioná "📥 PUSH" para apilar. El elemento nuevo aparece arriba.',
      'Presioná "📤 POP" para desapilar. Se extrae el elemento de la cima.',
      'Presioná "👁️ PEEK" para inspeccionar la cima sin modificarla.',
      'Presioná "📂 Cargar Dataset a la Pila" para llenarla con el dataset actual.'
    ],
    ejercicios: [
      'Apilá 5 valores y desapilá todos. ¿En qué orden salen respecto al ingreso?',
      'Intentá hacer PUSH hasta llenar la pila. ¿Qué mensaje aparece?',
      'Hacé POP hasta vaciar la pila. ¿Qué mensaje aparece?',
      'Aplicación: ¿cómo modelarías la navegación "atrás" del navegador con una pila?',
      'Aplicación: ¿por qué la recursión usa una pila? Pensá en factorial(5).'
    ],
    tips: [
      'La barra visual muestra la ocupación (n / capacidad) y el principio LIFO.',
      'El elemento de la cima está marcado con "◄ TOP".',
      'El pulso visual (borde naranja) indica overflow o underflow.'
    ],
    erroresComunes: [
      'Confundir el orden de salida: en una pila, el PRIMERO en salir es el ÚLTIMO en entrar.',
      'Creer que se puede acceder a elementos intermedios: NO se puede. Solo la cima.',
      'Pensar que PUSH al principio de una pila es más costoso que al final: es O(1) en ambos casos.'
    ]
  },

  queue: {
    icono: '🚶',
    titulo: 'Cola (Queue) — FIFO',
    resumen: 'Una cola es una colección con dos extremos: uno por donde se inserta (rear) y otro por donde se extrae (front). El primero en llegar es el primero en ser atendido (First In, First Out). Es la estructura detrás de las colas de impresión, los turnos, y el recorrido BFS.',
    conceptosClave: [
      { termino: 'FIFO', detalle: 'First In, First Out. El primero en entrar es el primero en salir.' },
      { termino: 'Front', detalle: 'Extremo por donde se extrae (dequeue).' },
      { termino: 'Rear', detalle: 'Extremo por donde se inserta (enqueue).' },
      { termino: 'ENQUEUE', detalle: 'Insertar al final (rear). O(1).' },
      { termino: 'DEQUEUE', detalle: 'Extraer del frente (front). O(1).' },
      { termino: 'Cola circular', detalle: 'Optimización que reutiliza posiciones liberadas del arreglo subyacente.' }
    ],
    pasos: [
      'Ajustá la capacidad máxima (3 a 15).',
      'Ingresá un valor o dejà vacío para uno aleatorio.',
      'Presioná "📥 ENQUEUE" para encolar. El elemento entra por el rear (derecha).',
      'Presioná "📤 DEQUEUE" para desencolar. Sale el del front (izquierda).',
      'Presioná "👁️ PEEK" para inspeccionar el frente sin modificarlo.',
      'Presioná "📂 Cargar Dataset a la Cola" para llenarla con el dataset actual.'
    ],
    ejercicios: [
      'Encolá 5 valores y desencolá todos. ¿El orden de salida es el mismo que el de entrada?',
      'Insertá 3, extraé 1, insertá 2 más. ¿Cómo queda la cola?',
      'Aplicación: modelá una fila de banco donde cada cliente tarda 2 minutos. ¿Cuánto espera el 5to cliente?',
      'Aplicación: ¿por qué BFS usa una cola y no una pila?'
    ],
    tips: [
      'El FRONT (0) y el REAR quedan etiquetados en cada elemento.',
      'Si la cola está vacía, DEQUEUE dispara underflow.',
      'Si está llena, ENQUEUE dispara overflow.'
    ],
    erroresComunes: [
      'Confundir front y rear: en una cola se inserta por atrás y se extrae por adelante.',
      'Pensar que DEQUEUE es O(n): no lo es, porque solo saca del frente.',
      'Asumir que la cola puede reordenar elementos: NO puede. El orden es estrictamente el de llegada.'
    ]
  },

  ll: {
    icono: '🔗',
    titulo: 'Listas Enlazadas',
    resumen: 'Una lista enlazada es una secuencia de nodos donde cada nodo tiene un valor y uno o más punteros al siguiente (y al anterior, si es doble). A diferencia del arreglo, no requiere memoria contigua y su tamaño puede crecer dinámicamente.',
    conceptosClave: [
      { termino: 'Nodo', detalle: 'Unidad básica. Contiene un valor y punteros (next, prev).' },
      { termino: 'Head (cabeza)', detalle: 'Primer nodo de la lista. Punto de entrada.' },
      { termino: 'Tail (cola)', detalle: 'Último nodo. Su next apunta a null (Ø).' },
      { termino: 'Lista Simple', detalle: 'Cada nodo apunta solo al siguiente (next). Recorrido unidireccional.' },
      { termino: 'Lista Doble', detalle: 'Cada nodo apunta al siguiente y al anterior (next + prev). Recorrido bidireccional y borrado O(1) del tail.' },
      { termino: 'Ventaja vs arreglo', detalle: 'Inserciones/borrados en O(1) si tenés el nodo; tamaño dinámico. Desventaja: acceso por índice O(n).' }
    ],
    pasos: [
      'Elegí la variante: "Simplemente Enlazada" o "Doblemente Enlazada".',
      'Ingresá un valor y presioná "➕ Head" para insertar al inicio, "➕ Tail" al final.',
      'Para insertar en posición: ingresá valor + índice y usá "➕ En Pos".',
      'Para eliminar: "➖ Del Head", "➖ Del Tail" o "🗑️ Del Val".',
      'Presioná "🔍 Buscar" para encontrar un valor: la lista recorre nodo por nodo.',
      'Cambiá de simple a doble en cualquier momento: los punteros prev se reconstruyen automáticamente.'
    ],
    ejercicios: [
      'Insertá 5 nodos por tail y buscá el último. ¿Cuántos saltos hizo?',
      'Insertá al head 3 veces. ¿Cómo queda el orden final?',
      'Cambiá de simple a doble. ¿Qué aparece en cada nodo que antes no estaba?',
      'Eliminá un valor del medio. Observá cómo se reconectan los punteros.',
      'Comparación: ¿por qué insertar al head es O(1) y al tail es O(n) en lista simple?'
    ],
    tips: [
      'Los nodos muestran HEAD y TAIL con etiquetas.',
      'Durante la búsqueda, el nodo activo se resalta.',
      'El conector entre nodos cambia según la variante: ➜ (simple) o ⇄ (doble).',
      'NULL (Ø) aparece al final para indicar el fin de la lista.'
    ],
    erroresComunes: [
      'Olvidar reconectar los punteros al borrar: si no se hace, se "pierde" el resto de la lista.',
      'Confundir índice con valor al usar "En Pos" o "Del Val".',
      'Creer que una lista doble es "mejor" en todo: ocupa el doble de memoria por nodo.'
    ]
  },

  /* ============================================================ */
  /* ÁRBOLES                                                       */
  /* ============================================================ */

  bst: {
    icono: '🌳',
    titulo: 'Árbol Binario de Búsqueda (BST)',
    resumen: 'Un BST es un árbol binario con una regla de orden: para todo nodo, los valores del subárbol izquierdo son MENORES y los del derecho son MAYORES. Esto permite búsquedas eficientes (O(log n) en promedio) siempre que el árbol esté razonablemente balanceado.',
    conceptosClave: [
      { termino: 'Invariante BST', detalle: 'Izquierda < Raíz ≤ Derecha (o < en ambos lados si no se permiten duplicados).' },
      { termino: 'Altura', detalle: 'Cantidad de niveles del árbol. Define el costo de búsqueda en el peor caso: O(altura).' },
      { termino: 'Árbol degenerado', detalle: 'Si insertás valores ordenados (1, 2, 3, ...), el BST se convierte en una lista: altura = n, búsqueda O(n).' },
      { termino: 'Recorridos', detalle: 'Inorden produce valores ordenados. Preorden sirve para clonar. Postorden para liberar memoria. Por niveles (BFS) para imprimir por capas.' },
      { termino: 'Sucesor inorden', detalle: 'El menor valor del subárbol derecho. Es el "reemplazo natural" al eliminar un nodo con dos hijos.' }
    ],
    pasos: [
      'Ingresá un valor y presioná "➕ Insertar (auto)" para insertarlo con animación paso a paso.',
      'Observá los logs: "Visitando nodo...", "Descendiendo por IZQUIERDA/DERECHA".',
      'Usá "⏸ Pausar" para congelar la animación y "⏭ Paso" para avanzar de a un paso.',
      'Presioná "🔍 Buscar" para encontrar un valor existente o no.',
      'Presioná "🗑️ Eliminar (auto)" para ver la eliminación: el sistema identifica el caso (hoja, un hijo, dos hijos).',
      'Probá los 4 recorridos con los botones de la derecha.',
      'Cargá un dataset grande con "📂 Cargar Dataset al Árbol" para ver cómo crece.'
    ],
    ejercicios: [
      'Insertá 50, 30, 70, 20, 40, 60, 80. ¿Cuál es la altura? ¿Está balanceado?',
      'Insertá 10, 20, 30, 40, 50. ¿Qué forma tiene el árbol? ¿Por qué?',
      'Eliminá un nodo hoja. Después, uno con un hijo. Después, uno con dos hijos.',
      'Ejecutá Inorden sobre cualquier BST. ¿Qué propiedad tienen los valores?',
      'Comparación: buscá el mismo valor en un BST balanceado y en uno degenerado. ¿Cuántos pasos hace cada uno?'
    ],
    tips: [
      'El panel de BST tiene botones "Paso a Paso": usalos para entender cada decisión.',
      'El canvas tiene scroll vertical: si el árbol es profundo, bajá para ver los niveles inferiores.',
      'Durante la inserción, el nodo se resalta en cada visita.',
      'Al eliminar, mirá los logs: te dicen qué caso se está aplicando (hoja / un hijo / dos hijos).'
    ],
    erroresComunes: [
      'Insertar valores ordenados y esperar un árbol balanceado: NO lo será.',
      'Confundir "altura" con "cantidad de nodos".',
      'Creer que el BST "sabe" balancearse: eso es trabajo de un AVL o Rojo-Negro.'
    ]
  },

  avl: {
    icono: '⚖️',
    titulo: 'Árbol AVL (Auto-Balanceado)',
    resumen: 'Un AVL es un BST que se mantiene balanceado automáticamente. Tras cada inserción o eliminación, revisa el Factor de Equilibrio (FE) de cada nodo y, si |FE| > 1, aplica rotaciones para restaurar el balance. Garantiza O(log n) en TODAS las operaciones.',
    conceptosClave: [
      { termino: 'Factor de Equilibrio (FE)', detalle: 'FE = altura(izq) - altura(der). Debe estar en {-1, 0, +1} en cada nodo.' },
      { termino: 'Rotación Simple Derecha (LL)', detalle: 'Se aplica cuando el subárbol izquierdo es demasiado alto y el desbalance viene por la izquierda. El hijo izquierdo sube como nueva raíz.' },
      { termino: 'Rotación Simple Izquierda (RR)', detalle: 'Simétrica a LL: subárbol derecho alto, desbalance por derecha.' },
      { termino: 'Rotación Doble (LR)', detalle: 'El hijo izquierdo está desbalanceado hacia su derecha. Se hace: rotación izquierda sobre el hijo, luego derecha sobre la raíz.' },
      { termino: 'Rotación Doble (RL)', detalle: 'Simétrica a LR: el hijo derecho está desbalanceado hacia su izquierda.' },
      { termino: 'Ventaja', detalle: 'Búsqueda garantizada O(log n), incluso en el peor caso.' },
      { termino: 'Costo', detalle: 'Las rotaciones añaden overhead en inserción/eliminación, pero el árbol siempre está balanceado.' }
    ],
    pasos: [
      'Ingresá un valor y presioná "➕ Insertar (auto)".',
      'Observá la consola: verás cada paso (visitar, actualizar FE, detectar desbalance, preparar rotación, aplicar rotación).',
      'Usá "⏸ Pausar" y "⏭ Paso" para detenerte justo antes de una rotación y entender por qué ocurre.',
      'Mirá el badge FE en cada nodo: verde (0), ámbar (±1), rojo (|FE|≥2).',
      'Probá "🔍 Buscar O(log n)" para verificar que la búsqueda es eficiente.',
      'Cargá un dataset con "📂 Cargar Dataset al AVL": el árbol se rebalancea continuamente.'
    ],
    ejercicios: [
      'Insertá 10, 20, 30. ¿Qué rotación se aplica? ¿Por qué?',
      'Insertá 30, 20, 10. ¿Qué rotación se aplica?',
      'Insertá 30, 10, 20. ¿Qué rotación doble se aplica?',
      'Insertá 10, 30, 20. Misma pregunta, otra rotación doble.',
      'Insertá 1, 2, 3, 4, 5, 6, 7. ¿Cuál es la altura final? ¿Cuál sería en un BST normal?',
      'Eliminá un nodo con dos hijos. ¿Se requiere rotación?'
    ],
    tips: [
      'El AVL es el "BST bien educado": siempre balanceado.',
      'Los logs te dicen explícitamente "Preparando rotación LR" o "Aplicada Rotación Simple Derecha (LL)".',
      'El badge FE cambia de color según el valor: es el "termómetro" del balance.',
      'Comparación pedagógica: insertá 1..7 en BST y luego en AVL. La diferencia de altura es enorme.'
    ],
    erroresComunes: [
      'Pensar que el AVL es siempre mejor: en inserciones muy frecuentes y búsquedas raras, un BST simple puede ser suficiente.',
      'Confundir LL con LR: LL es "izquierda-izquierda" (simple), LR es "izquierda-derecha" (doble).',
      'Creer que el FE es siempre 0: solo lo es en árboles perfectamente balanceados.'
    ]
  },

  /* ============================================================ */
  /* GRAFOS Y HASH                                                 */
  /* ============================================================ */

  graph: {
    icono: '🌐',
    titulo: 'Grafos Ponderados',
    resumen: 'Un grafo es un conjunto de nodos (vértices) conectados por aristas, que pueden tener peso. Modelan redes: rutas, amistades, dependencias, internet. Los algoritmos de recorrido (BFS, DFS) y de caminos mínimos (Dijkstra) son herramientas fundamentales.',
    conceptosClave: [
      { termino: 'Nodo / Vértice', detalle: 'Punto del grafo (ej: A, B, C).' },
      { termino: 'Arista', detalle: 'Conexión entre dos nodos. Puede tener peso (costo, distancia).' },
      { termino: 'Dirigido vs No Dirigido', detalle: 'En un grafo dirigido, la arista A→B no implica B→A. En uno no dirigido, sí.' },
      { termino: 'BFS (Anchura)', detalle: 'Recorre por niveles, usando una COLA. Encuentra el camino con menos aristas.' },
      { termino: 'DFS (Profundidad)', detalle: 'Recorre en profundidad, usando recursión o PILA. Útil para detección de ciclos y componentes conexas.' },
      { termino: 'Dijkstra', detalle: 'Encuentra el camino de menor peso desde un origen a todos los demás. Requiere pesos NO negativos.' },
      { termino: 'Matriz de Adyacencia', detalle: 'Tabla NxN donde entrada [i][j] = peso de arista i→j, o 0 si no hay.' },
      { termino: 'Lista de Adyacencia', detalle: 'Para cada nodo, la lista de sus vecinos con pesos. Más eficiente en grafos dispersos.' }
    ],
    pasos: [
      'Con "🔄 Red de Ejemplo" cargás un grafo predefinido de 6 nodos.',
      'Para agregar un nodo manual: escribí una etiqueta y presioná "➕ Nodo".',
      'Para agregar una arista: "De", "A", peso, y presioná "🔗 Arista".',
      'Modo interactivo: presioná "➕ Agregar nodo" y hacé clic en el lienzo para colocar un nodo en esa posición.',
      'Modo "🔗 Agregar arista": clic en nodo origen, clic en destino, ingresá peso.',
      'Modo "🗑️ Eliminar nodo/arista": clic sobre el elemento a borrar.',
      'Corré "🚶 BFS", "🧗 DFS" o "🗺️ Dijkstra" para ver los recorridos animados.',
      'Mirá la matriz y la lista de adyacencia actualizarse en tiempo real.'
    ],
    ejercicios: [
      'Corré BFS desde A. ¿Qué orden de visita obtenés?',
      'Corré DFS desde A. ¿En qué difiere del BFS?',
      'Corré Dijkstra de A a F. ¿Cuál es el camino óptimo y su costo?',
      'Cambiá el peso de una arista y volvé a correr Dijkstra. ¿Cambia el camino?',
      'Aplicación: modelá una red de ciudades con distancias. ¿Qué camino conviene de A a F?'
    ],
    tips: [
      'El peso de la arista se muestra en un badge circular sobre la línea.',
      'Durante BFS/DFS/Dijkstra, las aristas activas se resaltan.',
      'En Dijkstra, podés ver en la consola el proceso de "relajación" paso a paso.',
      'El modo interactivo permite construir grafos propios sin tocar código.'
    ],
    erroresComunes: [
      'Confundir BFS con DFS: BFS va por niveles (cola), DFS se hunde primero (pila/recursión).',
      'Usar Dijkstra con pesos negativos: NO funciona. Para eso existe Bellman-Ford.',
      'Pensar que la matriz y la lista dan información distinta: son dos representaciones del mismo grafo.'
    ]
  },

  hash: {
    icono: '🗄️',
    titulo: 'Tabla Hash con Colisiones',
    resumen: 'Una tabla hash almacena pares clave-valor y permite insertar, buscar y borrar en O(1) promedio. La función hash convierte la clave en un índice. Cuando dos claves apuntan al mismo índice, hay una colisión que debe resolverse.',
    conceptosClave: [
      { termino: 'Función hash', detalle: 'h(k) = k mod m. Convierte la clave en un índice dentro del rango [0, m-1].' },
      { termino: 'Colisión', detalle: 'Dos claves distintas producen el mismo índice. Es inevitable y debe manejarse.' },
      { termino: 'Chaining', detalle: 'Cada ranura mantiene una lista de elementos con la misma clave hash. Simple, robusto.' },
      { termino: 'Sondeo Lineal', detalle: 'Si la ranura está ocupada, se prueba la siguiente (i+1) % m hasta encontrar una libre. Requiere tombstones para el borrado.' },
      { termino: 'Tombstone', detalle: 'Marca de "borrado lógico". Sin él, borrar una ranura rompería la cadena de sondeo y otras búsquedas fallarían.' },
      { termino: 'Factor de carga (α)', detalle: 'α = n/m. Si α > 0.75, conviene redimensionar (rehashing) para mantener O(1).' }
    ],
    pasos: [
      'Ajustá la capacidad m (3 a 19). Los primos funcionan mejor.',
      'Elegí la estrategia de colisiones: Chaining o Sondeo Lineal.',
      'Ingresá clave + valor y presioná "📥 Insertar".',
      'Presioná "🔍 Buscar" para encontrar una clave. En sondeo lineal vas a ver las inspecciones.',
      'Presioná "🗑️ Borrar" para eliminar. En sondeo lineal la ranura queda marcada como tombstone.',
      'Presioná "📂 Cargar Dataset a la Tabla" para insertar muchos elementos de golpe.'
    ],
    ejercicios: [
      'Con capacidad 7, insertá las claves 1, 8, 15. ¿En qué ranuras caen? ¿Por qué?',
      'En sondeo lineal, borrá la clave del medio y buscá la tercera. ¿La encuentra? ¿Por qué?',
      'Cambiá de chaining a sondeo lineal con las mismas claves. ¿Qué cambia?',
      'Insertá hasta que α > 0.75. ¿Qué advertencia aparece?',
      '¿Por qué se prefieren capacidades primas en la función módulo?'
    ],
    tips: [
      'El factor de carga se muestra en la barra superior. Verde < 0.5, ámbar hasta 0.75, rojo arriba.',
      'En sondeo lineal, los tombstones se ven con "† Tombstone".',
      'Si insertás la misma clave dos veces, el valor se actualiza.',
      'En chaining, las colisiones se ven como múltiples chips en la misma fila.'
    ],
    erroresComunes: [
      'Pensar que hash garantiza O(1) siempre: es O(1) PROMEDIO. Con α alto o función mala, se degrada a O(n).',
      'Borrar una ranura sin tombstone en sondeo lineal: rompe búsquedas de otras claves.',
      'Usar una capacidad que no sea prima: aumenta la cantidad de colisiones.'
    ]
  },

  /* ============================================================ */
  /* MÓDULOS AUXILIARES                                            */
  /* ============================================================ */

  quiz: {
    icono: '🎯',
    titulo: 'Modo Desafío / Quiz Didáctico',
    resumen: 'Un cuestionario interactivo con preguntas de opción múltiple y retroalimentación inmediata. Cada respuesta viene con una explicación pedagógica para reforzar los conceptos.',
    conceptosClave: [
      { termino: 'Banco de preguntas', detalle: 'Se carga desde datos/quiz_preguntas.json. Podés reemplazarlo sin tocar código.' },
      { termino: 'Retroalimentación', detalle: 'Cada pregunta tiene una explicación que aparece tras responder.' },
      { termino: 'Puntaje', detalle: 'Se acumula a lo largo del desafío y se muestra al final con un porcentaje.' }
    ],
    pasos: [
      'Leé la pregunta y las 4 opciones.',
      'Hacé clic en la que consideres correcta.',
      'Leé la explicación que aparece debajo.',
      'Presioná "Siguiente Pregunta" para continuar.',
      'Al terminar, mirá tu puntaje final y presioná "↺ Reiniciar" o "🔀 Mezclar" para volver a intentar.'
    ],
    ejercicios: [
      'Intentá sacar 100% en la primera pasada.',
      'Si fallás una, no avances hasta entender la explicación.',
      'Cargá tu propio banco de preguntas con el botón "📥 Cargar banco .json".'
    ],
    tips: [
      'El botón "🔀 Mezclar" cambia el orden de las preguntas.',
      'Si tenés tu propio banco en formato JSON, podés cargarlo sin reiniciar la página.',
      'El formato del JSON es: { "preguntas": [ { question, options[], correct, explanation }, ... ] }'
    ],
    erroresComunes: [
      'Elegir respuestas por eliminación sin entender el por qué: la explicación es la parte más valiosa.',
      'No revisar la explicación cuando acertás: incluso acertando por casualidad, vale leerla.'
    ]
  },

  datasets: {
    icono: '📁',
    titulo: 'Gestor de Datasets y Archivos',
    resumen: 'Todos los módulos del laboratorio operan sobre un "dataset activo". Este panel permite cargarlo desde distintas fuentes: archivos locales, datasets de muestra incluidos, o generadores sintéticos.',
    conceptosClave: [
      { termino: 'Dataset activo', detalle: 'Es el conjunto de números que usan sorting, searching, estructuras, etc. Se comparte entre todos los paneles.' },
      { termino: 'Formatos soportados', detalle: 'CSV (con o sin encabezado), TXT (números separados por comas/espacios), JSON (arreglos u objetos con campo numérico).' },
      { termino: 'Presets', detalle: 'Los 4 datasets de muestra están embebidos en file_loader.js, pero también existen como archivos físicos en /datos/ para inspección.' },
      { termino: 'Generadores sintéticos', detalle: 'Aleatorio, Casi Ordenado (óptimo para Insertion), e Invertido (peor caso para Bubble/Insertion).' }
    ],
    pasos: [
      'Arrastrá un archivo al recuadro, o hacé clic para examinar.',
      'O usá los botones de generación: "🎲 Aleatorio", "📈 Casi Ordenado", "📉 Invertido".',
      'O elegí uno de los presets del desplegable en el header.',
      'El badge del header muestra cuántos valores tiene el dataset activo.',
      'Todos los paneles se reinician automáticamente al cambiar el dataset.'
    ],
    ejercicios: [
      'Cargá datos_inversos.csv y corré Bubble. ¿Es mucho más lento que con datos aleatorios?',
      'Generá un dataset "Casi Ordenado" y corré Insertion. ¿Es más rápido que con aleatorio?',
      'Creá tu propio CSV con 50 números y cargalo. ¿Todos los algoritmos lo soportan?',
      'Probá cargar un JSON con objetos: ¿qué campo numérico usa el parser?'
    ],
    tips: [
      'Los CSV con encabezado "valor" o "calificacion" son detectados automáticamente.',
      'Si el CSV no tiene encabezado, se toma el primer token numérico de cada línea.',
      'Los comentarios con # en TXT se ignoran.',
      'El dataset activo persiste al cambiar de panel: no se recarga.'
    ],
    erroresComunes: [
      'Editar los archivos en /datos/ esperando que la app los lea: si abrís con file://, usa los embebidos.',
      'Cargar un JSON sin campo numérico reconocible: el parser no encuentra valores.',
      'Asumir que el dataset "vuelve" al cambiar de panel: sigue siendo el que cargaste.'
    ]
  }
};

