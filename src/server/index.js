/**
 * Production API Server for School Smart Eye
 * Serves all API routes + static frontend files
 */

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── CORS ───────────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ── API Routes Loader ──────────────────────────────────────────────────
async function loadApiRoutes() {
  const apiDir = join(__dirname, 'api');

  async function scan(dir, prefix) {
    if (!existsSync(dir)) return;

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const routeName = entry.name.replace(/^\[(.*?)\]$/, ':$1');
        await scan(fullPath, `${prefix}/${routeName}`);
      } else if (/^(GET|POST|PUT|DELETE|PATCH)\.(ts|js)$/.test(entry.name)) {
        const method = entry.name.split('.')[0].toLowerCase();
        const routePath = prefix || '/';

        try {
          const module = await import(fullPath);
          const handler = module.default || module.handler;

          if (typeof handler === 'function') {
            app[method](`/api${routePath}`, handler);
            console.log(`  📡 API [${method.toUpperCase()}] /api${routePath}`);
          }
        } catch (err) {
          console.error(`  ⚠️ Failed to load ${fullPath}:`, err.message);
        }
      }
    }
  }

  await scan(apiDir, '');
}

// ── Static Files (Frontend) ────────────────────────────────────────────
function serveStatic() {
  const clientDir = join(__dirname, 'client');
  const distDir = join(__dirname, '..', '..', 'dist');
  const staticDir = existsSync(clientDir) ? clientDir : distDir;

  if (existsSync(staticDir)) {
    app.use(express.static(staticDir, {
      setHeaders(res, filePath) {
        if (filePath.includes('/assets/')) {
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.set('Cache-Control', 'no-cache');
        }
      }
    }));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      if (extname(req.path)) return next();
      res.sendFile(join(staticDir, 'index.html'));
    });

    console.log(`  📁 Static files served from: ${staticDir}`);
  } else {
    console.warn('  ⚠️ No static files found. Build frontend first.');
  }
}

// ── Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Health Check ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'schooly-api' });
});

// ── Start ──────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🏫 School Smart Eye — API Server');
  console.log('================================\n');

  await loadApiRoutes();
  serveStatic();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Health: http://0.0.0.0:${PORT}/api/health`);
  });
}

main().catch(console.error);
