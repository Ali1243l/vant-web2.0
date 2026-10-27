import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import welcomeEmailHandler from './api/send-welcome.ts';

function localApiPlugin(env: Record<string, string | undefined>): Plugin {
  return {
    name: 'vant-local-api',
    configureServer(server) {
      // Use the production handler locally; never send from the browser.
      const emailHandler = (req: any, res: any) => {
        res.status = (code: number) => { res.statusCode = code; return res; };
        res.json = (payload: unknown) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
          return res;
        };
        let body = '';
        let bytes = 0;
        req.on('data', (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > 256 * 1024) {
            if (!res.writableEnded) res.status(413).json({ success: false, error: 'Request too large' });
            return;
          }
          body += chunk.toString();
        });
        req.on('end', () => {
          if (res.writableEnded) return;
          req.body = body;
          void welcomeEmailHandler(req, res);
        });
      };
      server.middlewares.use('/api/send-welcome', emailHandler);
      server.middlewares.use('/api/send-email', emailHandler);
      server.middlewares.use('/api/products', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }
        const url = env.VITE_SUPABASE_URL;
        const key = env.VITE_SUPABASE_ANON_KEY;
        if (!url || !key) {
          res.end(JSON.stringify({ success: true, data: [], count: 0 }));
          return;
        }
        try {
          const response = await fetch(`${url}/rest/v1/products?select=*,product_media(*)&order=created_at.desc`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(6000),
          });
          if (!response.ok) throw new Error(`Catalog upstream status ${response.status}`);
          const products = await response.json();
          res.end(JSON.stringify({ success: true, data: products, count: products.length }));
        } catch {
          res.statusCode = 502;
          res.end(JSON.stringify({ success: false, data: [], error: 'Catalog temporarily unavailable' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  // Server secrets must never be exposed through VITE_ variables or define.
  for (const name of ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']) {
    if (env[name]) process.env[name] = env[name];
  }
  return {
    plugins: [react(), tailwindcss(), localApiPlugin(env)],
    resolve: { alias: { '@': path.resolve(process.cwd(), '.') } },
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
