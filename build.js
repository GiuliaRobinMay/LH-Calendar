#!/usr/bin/env node
/* ============================================================================
   Build — inline everything into one file.

     node build.js

   Produces two things in dist/:

     lh-calendar.html           Full standalone page. Drop it on any host, or
                                paste it into a Circle custom-code block. No
                                external files, so nothing can 404.

     lh-calendar.artifact.html  The same page with the <html>/<head>/<body>
                                wrapper stripped, which is the shape the
                                Claude Artifact publisher expects.

   Only the Google Fonts <link> stays external — it is the one font host
   allowed by the Artifact content-security policy, and there is a real
   fallback stack behind every family.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const html = read('index.html');
const css = read('assets/styles.css');
const programs = read('data/programs.js');
const calendar = read('assets/calendar.js');

// A closing </script> inside a string literal would end the inline block
// early. Nothing in the sources does this today, but the guard is cheap.
const safe = (js) => js.replace(/<\/script>/gi, '<\\/script>');

let out = html
  .replace(
    '<link rel="stylesheet" href="assets/styles.css">',
    '<style>\n' + css + '\n</style>'
  )
  .replace(
    '<script src="data/programs.js"></script>\n<script src="assets/calendar.js"></script>',
    '<script>\n' + safe(programs) + '\n</script>\n<script>\n' + safe(calendar) + '\n</script>'
  );

if (out.includes('assets/styles.css') || out.includes('assets/calendar.js')) {
  console.error('Build failed: a reference was not inlined. Did index.html change shape?');
  process.exit(1);
}

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/lh-calendar.html'), out);

// Artifact form: the publisher supplies its own doctype, html, head and body,
// so hand it only what goes inside — title and styles included.
const fragment = out
  .replace(/^[\s\S]*?<head>\s*/i, '')
  .replace(/<meta charset="utf-8">\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<\/head>\s*<body>\s*/i, '\n')
  .replace(/\s*<\/body>\s*<\/html>\s*$/i, '\n');

fs.writeFileSync(path.join(root, 'dist/lh-calendar.artifact.html'), fragment);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log('dist/lh-calendar.html           ' + kb(out));
console.log('dist/lh-calendar.artifact.html  ' + kb(fragment));
