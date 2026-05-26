/**
 * Build script for production API server
 * Uses esbuild to bundle src/server/ into dist-server/
 */

import * as esbuild from 'esbuild';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUTDIR = 'dist-server';

// Clean / create output dir
if (existsSync(OUTDIR)) {
  await import('node:fs/promises').then(m => m.rm(OUTDIR, { recursive: true }));
}
mkdirSync(OUTDIR, { recursive: true });

// Bundle server entrypoint
await esbuild.build({
  entryPoints: ['src/server/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: `${OUTDIR}/index.js`,
  external: ['mysql2', 'drizzle-orm', 'better-auth', '@better-auth/*'],
  define: {
    'import.meta.url': 'import_meta_url',
  },
  banner: {
    js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
const import_meta_url = import.meta.url;`,
  },
});

// Compile all .ts API routes to .js
async function compileApiRoutes(dir) {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(dir, entry.name);
    const relPath = srcPath.replace(/^src\/server\//, '');
    const outPath = join(OUTDIR, relPath);

    if (entry.isDirectory()) {
      mkdirSync(outPath, { recursive: true });
      await compileApiRoutes(srcPath);
    } else if (entry.name.endsWith('.ts')) {
      await esbuild.build({
        entryPoints: [srcPath],
        bundle: false,
        platform: 'node',
        target: 'node22',
        format: 'esm',
        outfile: outPath.replace(/\.ts$/, '.js'),
      });
    }
  }
}

await compileApiRoutes('src/server/api');
await compileApiRoutes('src/server/db');

console.log('✅ Server built to dist-server/');
