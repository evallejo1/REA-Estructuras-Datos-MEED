#!/usr/bin/env node
/**
 * scripts/serve.js
 * Servidor HTTP estatico minimalista para el REA (Node.js).
 *
 * - Sin dependencias externas (solo modulos nativos).
 * - Detecta MIME por extension.
 * - Restringe el acceso al directorio raiz del proyecto (no permite path traversal).
 * - Imprime banner con la URL al arrancar.
 *
 * Uso:
 *   node scripts/serve.js            # puerto por defecto: 8080
 *   node scripts/serve.js 3000       # puerto especifico
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2]) || 8080;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv':  'text/csv; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.map':  'application/json'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found: ' + urlPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', (err) => {
  console.error('');
  if (err.code === 'EADDRINUSE') {
    console.error('  ERROR: El puerto ' + PORT + ' ya esta en uso.');
    console.error('');
    console.error('  Solucion: cierre el otro proceso, o use otro puerto:');
    console.error('    node scripts/serve.js 8081');
    console.error('');
  } else {
    console.error('  ERROR del servidor:');
    console.error('  ' + err.message);
    console.error('');
  }
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ================================================================');
  console.log('    REA Estructuras de Datos - Servidor Node.js');
  console.log('  ================================================================');
  console.log('    URL:     http://localhost:' + PORT);
  console.log('    Root:    ' + ROOT);
  console.log('    Puerto:  ' + PORT);
  console.log('');
  console.log('    Presione Ctrl+C para detener el servidor.');
  console.log('  ================================================================');
  console.log('');
});

