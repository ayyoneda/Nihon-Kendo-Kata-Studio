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
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const filePath = path.resolve(__dirname, 'data/kata_database.json');
                const publicFilePath = path.resolve(__dirname, 'public/data/kata_database.json');

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                fs.mkdirSync(path.dirname(publicFilePath), { recursive: true });
                fs.writeFileSync(publicFilePath, JSON.stringify(data, null, 2), 'utf-8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Arquivo salvo no disco!' }));
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
