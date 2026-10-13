// build-html.js — OPTIONAL. Joins the section files in src/html/ into ONE-FILE pages:
//   index.single.html and admin/index.single.html
// Use these only when you cannot run a local server (double-click) or want one file to upload.
// The normal index.html loads the section files by itself, so it needs no build.
//
//   node build-html.js          build once
//   node build-html.js --watch  rebuild every time you save a section file
//
// A line like   <!-- @include pages/shop.html -->   is replaced by that file's content.
// Includes can be nested (pages/help/index.html includes pages/help/shipping.html, etc).
// No packages needed, only Node.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC  = path.join(ROOT, 'src', 'html');
const JOBS = [
  { template: 'index.template.html', output: 'index.single.html' },          // the store
  { template: 'admin.template.html', output: 'admin/index.single.html' },    // the order desk (admin panel)
];
const MARK = /^[ \t]*<!--\s*@include\s+(\S+)\s*-->[ \t]*$/;

function expand(file, stack = []) {
  const full = path.join(SRC, file);
  if (stack.includes(file)) throw new Error('Include loop: ' + [...stack, file].join(' -> '));
  if (!fs.existsSync(full)) throw new Error('Missing section file: src/html/' + file + (stack.length ? '  (used in ' + stack[stack.length - 1] + ')' : ''));
  const text = fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  if (stack.length && lines[lines.length - 1] === '') lines.pop();   // editors add a final newline to partials
  return lines.map(line => {
    const m = line.match(MARK);
    return m ? expand(m[1], [...stack, file]) : line;
  }).join('\n');
}

function build() {
  for (const job of JOBS) {
    fs.writeFileSync(path.join(ROOT, job.output), expand(job.template));
    console.log('built', job.output);
  }
}

try { build(); } catch (e) { console.error('Build failed: ' + e.message); process.exit(1); }

if (process.argv.includes('--watch')) {
  console.log('Watching src/html ... (Ctrl+C to stop)');
  let t;
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(t);
    t = setTimeout(() => { try { build(); } catch (e) { console.error('Build failed: ' + e.message); } }, 120);
  });
}
