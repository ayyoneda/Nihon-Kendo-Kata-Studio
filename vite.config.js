import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './', // Permite rodar no GitHub Pages em qualquer subpasta!
  publicDir: 'public',
  server: {
    port: 3000,
    strictPort: true,
    open: false
  },
  plugins: [
    {
      name: 'save-database-api',
      configureServer(server) {
        server.middlewares.use('/api/save-database', (req, res) => {
          if (req.method === 'POST') {
            // Seguranca: Bloquear requisicoes de sites externos (Anti-CSRF / Cross-Site)
            const secFetchSite = req.headers['sec-fetch-site'];
            if (secFetchSite && secFetchSite === 'cross-site') {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: false, error: 'Acesso negado: requisicoes cross-site sao proibidas.' }));
            }

            const origin = req.headers['origin'] || req.headers['referer'] || '';
            const isLocalOrigin = origin.startsWith('http://localhost:3000') || origin.startsWith('http://127.0.0.1:3000');
            if (origin && !isLocalOrigin) {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: false, error: 'Origem nao autorizada.' }));
            }

            let body = '';
            let bodySize = 0;
            const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5 MB

            req.on('data', chunk => {
              bodySize += chunk.length;
              if (bodySize > MAX_BODY_SIZE) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Payload muito grande.' }));
                req.destroy();
                return;
              }
              body += chunk;
            });

            req.on('end', () => {
              try {
                const data = JSON.parse(body);

                // Validacao minima de integridade do catalogo
                if (!data || typeof data !== 'object' || !Array.isArray(data.demonstrations) || !data.katas_pedagogical) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  return res.end(JSON.stringify({ success: false, error: 'Schema de dados invalido.' }));
                }

                const filePath = path.resolve(__dirname, 'data/kata_database.json');
                const publicFilePath = path.resolve(__dirname, 'public/data/kata_database.json');

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                fs.mkdirSync(path.dirname(publicFilePath), { recursive: true });
                fs.writeFileSync(publicFilePath, JSON.stringify(data, null, 2), 'utf-8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Arquivo salvo no disco com sucesso!' }));
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
          }
        });
      }
    }
  ]
});
