/**
 * file_loader.js
 * Módulo para la lectura, validación y análisis de archivos externos (.csv, .txt, .json)
 * Soporta tanto carga mediante File API (FileReader) como datasets precargados de muestra.
 *
 * [PATCH Backlog B5] loadPreset() async con fetch + fallback a embebidos.
 */

const FileLoader = (() => {
  const PRESET_FILES = {
    'datos_numeros.csv': {
      nombre: 'datos_numeros.csv',
      tipo: 'csv',
      descripcion: '25 valores numéricos con etiquetas de muestra (A-Y)',
      contenido: `id,valor,etiqueta
1,78,Muestra_A
2,23,Muestra_B
3,89,Muestra_C
4,12,Muestra_D
5,45,Muestra_E
6,90,Muestra_F
7,34,Muestra_G
8,67,Muestra_H
9,56,Muestra_I
10,8,Muestra_J
11,99,Muestra_K
12,15,Muestra_L
13,42,Muestra_M
14,71,Muestra_N
15,63,Muestra_O
16,29,Muestra_P
17,84,Muestra_Q
18,37,Muestra_R
19,51,Muestra_S
20,18,Muestra_T
21,95,Muestra_U
22,6,Muestra_V
23,60,Muestra_W
24,75,Muestra_X
25,31,Muestra_Y`
    },
    'datos_valores.txt': {
      nombre: 'datos_valores.txt',
      tipo: 'txt',
      descripcion: '25 valores desordenados en texto plano',
      contenido: `# Archivo de texto plano con valores numéricos
64, 34, 25, 12, 22, 11, 90, 88, 76, 54, 43, 31, 95, 19, 8, 47, 52, 69, 14, 83, 27, 61, 72, 38, 5`
    },
    'datos_estudiantes.json': {
      nombre: 'datos_estudiantes.json',
      tipo: 'json',
      descripcion: '15 registros estructurados de estudiantes con calificaciones',
      contenido: JSON.stringify([
        { "id": 101, "nombre": "Ana Morales", "calificacion": 88, "grupo": "A" },
        { "id": 102, "nombre": "Carlos Perez", "calificacion": 45, "grupo": "B" },
        { "id": 103, "nombre": "Diana Ruiz", "calificacion": 96, "grupo": "A" },
        { "id": 104, "nombre": "Eduardo Diaz", "calificacion": 67, "grupo": "C" },
        { "id": 105, "nombre": "Fernanda Vega", "calificacion": 74, "grupo": "B" },
        { "id": 106, "nombre": "Gabriel Silva", "calificacion": 52, "grupo": "A" },
        { "id": 107, "nombre": "Helena Gomez", "calificacion": 91, "grupo": "C" },
        { "id": 108, "nombre": "Ignacio Torres", "calificacion": 33, "grupo": "B" },
        { "id": 109, "nombre": "Julia Castro", "calificacion": 84, "grupo": "A" },
        { "id": 110, "nombre": "Kevin Ortiz", "calificacion": 59, "grupo": "C" },
        { "id": 111, "nombre": "Lucia Mendez", "calificacion": 78, "grupo": "B" },
        { "id": 112, "nombre": "Manuel Rios", "calificacion": 99, "grupo": "A" },
        { "id": 113, "nombre": "Natalia Lara", "calificacion": 62, "grupo": "C" },
        { "id": 114, "nombre": "Oscar Benitez", "calificacion": 41, "grupo": "B" },
        { "id": 115, "nombre": "Patricia Solis", "calificacion": 87, "grupo": "A" }
      ], null, 2)
    },
    'datos_inversos.csv': {
      nombre: 'datos_inversos.csv',
      tipo: 'csv',
      descripcion: '20 valores en orden estrictamente descendente (peor caso)',
      contenido: `valor,descripcion
100,Elemento_01
95,Elemento_02
90,Elemento_03
85,Elemento_04
80,Elemento_05
75,Elemento_06
70,Elemento_07
65,Elemento_08
60,Elemento_09
55,Elemento_10
50,Elemento_11
45,Elemento_12
40,Elemento_13
35,Elemento_14
30,Elemento_15
25,Elemento_16
20,Elemento_17
15,Elemento_18
10,Elemento_19
5,Elemento_20`
    }
  };

  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No se ha proporcionado ningún archivo.'));
      }
      const extension = file.name.split('.').pop().toLowerCase();
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawContent = e.target.result;
        try {
          const parsed = parseContent(rawContent, extension, file.name);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error de lectura al acceder al archivo físico.'));
      reader.readAsText(file);
    });
  }

  async function loadPreset(key) {
    const preset = PRESET_FILES[key];
    if (!preset) {
      throw new Error(`Preset "${key}" no encontrado.`);
    }
    try {
      const response = await fetch(`datos/${key}`);
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          const parsed = parseContent(text, preset.tipo, preset.nombre);
          parsed.source = 'archivo-fisico';
          return parsed;
        }
      }
    } catch (err) {
      // Silencioso
    }
    const parsed = parseContent(preset.contenido, preset.tipo, preset.nombre);
    parsed.source = 'embebido';
    return parsed;
  }

  function parseContent(rawContent, format, fileName = 'desconocido') {
    let numbers = [];
    let items = [];
    let details = '';
    const cleanRaw = rawContent.trim();
    if (!cleanRaw) throw new Error('El archivo está completamente vacío.');

    if (format === 'json' || cleanRaw.startsWith('[') || cleanRaw.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            if (typeof item === 'number') {
              numbers.push(item);
              items.push({ valor: item, label: `#${idx + 1}` });
            } else if (typeof item === 'object' && item !== null) {
              const numericKey = ['calificacion', 'valor', 'score', 'nota', 'val', 'id', 'edad'].find(k => typeof item[k] === 'number');
              if (numericKey) {
                numbers.push(item[numericKey]);
                items.push({
                  valor: item[numericKey],
                  label: item.nombre || item.etiqueta || item.label || `#${item.id || idx + 1}`,
                  original: item
                });
              }
            }
          });
          details = `JSON procesado: ${numbers.length} elementos encontrados.`;
        } else if (typeof parsed === 'object') {
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key])) {
              return parseContent(JSON.stringify(parsed[key]), 'json', fileName);
            }
          }
          throw new Error('El archivo JSON no contiene un arreglo de elementos.');
        }
      } catch (e) {
        throw new Error('Error al parsear archivo JSON: ' + e.message);
      }
    } else if (format === 'csv') {
      const lines = cleanRaw.split(/\r?\n/).filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));
      if (lines.length === 0) throw new Error('El archivo CSV no contiene líneas de datos.');
      const firstLineTokens = lines[0].split(/[,;]/).map(t => t.trim());
      const hasHeader = firstLineTokens.some(t => isNaN(Number(t)));
      const dataLines = hasHeader ? lines.slice(1) : lines;
      let targetColIndex = -1;
      if (hasHeader) {
        const headerNames = firstLineTokens.map(h => h.toLowerCase().replace(/['"]/g, ''));
        targetColIndex = headerNames.findIndex(h => ['valor', 'calificacion', 'score', 'nota', 'val', 'id', 'edad'].includes(h));
      }
      dataLines.forEach((line, idx) => {
        const tokens = line.split(/[,;]/).map(t => t.trim().replace(/^["']|["']$/g, ''));
        let val = null;
        let label = `Item ${idx + 1}`;
        if (targetColIndex >= 0 && targetColIndex < tokens.length) {
          val = Number(tokens[targetColIndex]);
          label = tokens.length > 2 ? tokens[2] : (tokens[0] || label);
        } else {
          for (let i = 0; i < tokens.length; i++) {
            const num = Number(tokens[i]);
            if (!isNaN(num) && tokens[i] !== '') {
              val = num;
              label = tokens[i + 1] || tokens[0] || label;
              break;
            }
          }
        }
        if (val !== null && !isNaN(val)) {
          numbers.push(val);
          items.push({ valor: val, label: label });
        }
      });
      details = `CSV procesado: ${numbers.length} valores numéricos extraídos.`;
    } else {
      const lines = cleanRaw.split(/\r?\n/);
      const cleanTokens = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) continue;
        const parts = trimmed.split(/[\s,;]+/).filter(p => p.length > 0);
        cleanTokens.push(...parts);
      }
      cleanTokens.forEach((token, idx) => {
        const num = Number(token);
        if (!isNaN(num)) {
          numbers.push(num);
          items.push({ valor: num, label: `#${idx + 1}` });
        }
      });
      details = `TXT procesado: ${numbers.length} números leídos.`;
    }

    if (numbers.length === 0) throw new Error('No se pudieron extraer valores numéricos válidos del archivo.');

    return {
      fileName: fileName,
      numbers: numbers,
      items: items,
      count: numbers.length,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      promedio: +(numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2),
      details: details,
      rawPreview: cleanRaw.slice(0, 500) + (cleanRaw.length > 500 ? '...' : '')
    };
  }

  return { PRESET_FILES, readFileAsync, loadPreset, parseContent };
})();

