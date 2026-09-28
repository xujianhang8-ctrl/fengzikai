#!/usr/bin/env node
/* Bundle the game into one self-contained HTML file.
 *
 *   node tools/build.mjs                    -> dist/husheng-zhiyue.html (a full page to share or open offline)
 *   node tools/build.mjs --fragment <out>   -> page content without <html>/<head>/<body>, for hosts that add their own
 *
 * Scans found in images/paintings/ are embedded as data URIs. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const out = args.find((a) => !a.startsWith('--')) || join(root, 'dist', 'husheng-zhiyue.html');
const read = (p) => readFileSync(join(root, p), 'utf8');

// Which painting scans are present?
const sandbox = { window: {} };
vm.runInNewContext(read('js/paintings.js'), sandbox);
const paintings = sandbox.window.PAINTINGS || {};
const embedded = {};
for (const [id, p] of Object.entries(paintings)) {
  const file = join(root, p.file);
  if (!existsSync(file)) continue;
  const type = extname(file).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  embedded[id] = `data:${type};base64,${readFileSync(file).toString('base64')}`;
}

let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (m, href) => `<style>\n${read(href)}\n</style>`);
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (m, src) => {
  let code = read(src);
  if (src === 'js/paintings.js' && Object.keys(embedded).length) code += `\nwindow.PAINTING_DATA = ${JSON.stringify(embedded)};\n`;
  return `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;
});

if (fragment) {
  const head = /<head>([\s\S]*?)<\/head>/.exec(html)[1]
    .replace(/<meta charset[^>]*>\s*/i, '')
    .replace(/<meta name="viewport"[^>]*>\s*/i, '');
  const body = /<body>([\s\S]*?)<\/body>/.exec(html)[1];
  html = `${head.trim()}\n${body.trim()}\n`;
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`Wrote ${out} (${kb} KB, ${Object.keys(embedded).length} of ${Object.keys(paintings).length} original scans embedded)`);
