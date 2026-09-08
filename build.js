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
const dataCal = read('data/calendar.js');
const calendar = read('assets/calendar.js');

// A closing </script> inside a string literal would end the inline block
// early. Nothing in the sources does this today, but the guard is cheap.
const safe = (js) => js.replace(/<\/script>/gi, '<\\/script>');

// String.replace gives "$" special meaning in the REPLACEMENT — "$'" means
// "everything after the match", "$&" the match itself. The calculator formats
// currency with "'$' + ...", which silently spliced the tail of the document
// into the middle of the script. Passing a function turns all of that off.
const put = (haystack, needle, replacement) => {
  if (!haystack.includes(needle)) {
    console.error('Build failed: could not find the tag to replace.');
    console.error(needle.split('\n')[0]);
    process.exit(1);
  }
  return haystack.replace(needle, () => replacement);
};

let out = put(html,
  '<link rel="stylesheet" href="assets/styles.css">',
  '<style>\n' + css + '\n</style>');

out = put(out,
  '<script src="data/calendar.js"></script>\n' +
  '<script src="assets/calendar.js"></script>',
  [dataCal, calendar]
    .map((js) => '<script>\n' + safe(js) + '\n</script>').join('\n'));

// Look for real src/href attributes, not bare substrings — the inlined
// sources mention their own paths in comments, which used to trip this.
const leftover = out.match(/(?:src|href)="(?!https?:)[^"]+"/g) || [];
if (leftover.length) {
  console.error('Build failed: not inlined -> ' + leftover.join(', '));
  console.error('Did the script or stylesheet tags in index.html change shape?');
  process.exit(1);
}

// A document with more than one </body> means something was spliced in where
// it should not have been — exactly what the "$" bug above used to do.
for (const [tag, want] of [['</body>', 1], ['</html>', 1], ['<body>', 1]]) {
  const n = out.split(tag).length - 1;
  if (n !== want) {
    console.error(`Build failed: found ${n} "${tag}", expected ${want}.`);
    console.error('Something was spliced into the document body.');
    process.exit(1);
  }
}

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/lh-calendar.html'), out);

// Artifact form: the publisher supplies its own doctype, html, head and body,
// so hand it only what goes inside — title and styles included.
const fragment = out
  .replace(/^[\s\S]*?<head>\s*/i, () => '')
  .replace(/<meta charset="utf-8">\s*/i, () => '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, () => '')
  .replace(/<\/head>\s*<body>\s*/i, () => '\n')
  .replace(/\s*<\/body>\s*<\/html>\s*$/i, () => '\n');

fs.writeFileSync(path.join(root, 'dist/lh-calendar.artifact.html'), fragment);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log('dist/lh-calendar.html           ' + kb(out));
console.log('dist/lh-calendar.artifact.html  ' + kb(fragment));
