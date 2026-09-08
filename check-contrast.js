#!/usr/bin/env node
/* ============================================================================
   Contrast check —  node check-contrast.js

   Every topic colour has to carry a bold label on the calendar line. This
   works out the real WCAG contrast ratio of that colour against ink and
   against white, takes the better of the two (which is exactly what the page
   does at runtime), and fails the build if any topic drops below 4.5:1.

   Run it after changing or adding a colour in data/programs.js.
   ========================================================================== */
'use strict';

const { LH_TOPICS } = require('./data/programs.js');

const INK = '#12213F';
const MIN = 4.5;          // WCAG AA for text below 18px

function luminance(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

const inkL = luminance(INK);
let failed = 0;
let worst = Infinity;

for (const [key, topic] of Object.entries(LH_TOPICS)) {
  const bg = luminance(topic.color);
  const onWhite = 1.05 / (bg + 0.05);
  const onInk = (bg + 0.05) / (inkL + 0.05);
  const ratio = Math.max(onWhite, onInk);
  const label = onInk >= onWhite ? 'ink' : 'white';

  worst = Math.min(worst, ratio);
  if (ratio < MIN) failed++;

  console.log(
    `${ratio >= MIN ? 'pass' : 'FAIL'}  ${ratio.toFixed(2)}:1  ` +
    `${label.padEnd(5)} ${topic.color}  ${key}`
  );
}

console.log(`\nworst ${worst.toFixed(2)}:1 (need ${MIN}:1)`);

if (failed) {
  console.error(`\n${failed} topic colour(s) cannot carry a legible label.`);
  console.error('Darken or lighten them until this passes, keeping the hue.');
  process.exit(1);
}
