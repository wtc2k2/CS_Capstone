/**
 * Builds a single-file bundle for the Phaser Sandbox.
 *
 * - Bundles all TS source into one src/main.js
 * - Replaces `import Phaser from 'phaser'` with a globalThis reference
 *   (the sandbox loads Phaser via <script> tag)
 * - Strips the CSS import (inlined in index.html instead)
 * - Copies phaser.js, project.config, generates index.html
 */

import { build } from 'esbuild';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  copyFileSync,
  existsSync,
} from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist-sandbox');

// Clean
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'src'), { recursive: true });

// Bundle with esbuild
await build({
  entryPoints: [join(SRC, 'main.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2020',
  outfile: join(OUT, 'src', 'main.js'),
  plugins: [
    {
      // Replace `import Phaser from 'phaser'` → use the global
      name: 'phaser-global',
      setup(b) {
        b.onResolve({ filter: /^phaser$/ }, () => ({
          path: 'phaser',
          namespace: 'phaser-global',
        }));
        b.onLoad({ filter: /.*/, namespace: 'phaser-global' }, () => ({
          contents: 'export default globalThis.Phaser;',
          loader: 'js',
        }));
      },
    },
    {
      // Ignore CSS imports (we inline CSS in index.html)
      name: 'ignore-css',
      setup(b) {
        b.onResolve({ filter: /\.css$/ }, () => ({
          path: 'style.css',
          namespace: 'ignore-css',
        }));
        b.onLoad({ filter: /.*/, namespace: 'ignore-css' }, () => ({
          contents: '',
          loader: 'js',
        }));
      },
    },
  ],
});

// Copy phaser.js
const phaserSrc = join(ROOT, 'phaser.js');
if (existsSync(phaserSrc)) {
  copyFileSync(phaserSrc, join(OUT, 'phaser.js'));
}

// Copy project.config
const configSrc = join(ROOT, 'project.config');
if (existsSync(configSrc)) {
  copyFileSync(configSrc, join(OUT, 'project.config'));
}

// Read CSS for inlining
const cssPath = join(SRC, 'style.css');
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf-8') : '';

// Write index.html
writeFileSync(
  join(OUT, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Campus Clash</title>
  <style>
${css}
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script src="phaser.js"></script>
  <script type="module" src="src/main.js"></script>
</body>
</html>
`,
);

console.log(`✓ Sandbox build → ${relative(ROOT, OUT)}/`);
