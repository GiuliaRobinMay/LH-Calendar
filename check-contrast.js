#!/usr/bin/env node
/* ============================================================================
   Contrast check —  node check-contrast.js

   Every funder-type colour has to carry a bold label on the calendar line. This
   works out the real WCAG contrast ratio of that colour against ink and
   against white and takes the better of the two — exactly what the page does
   at runtime.

   The palette is pinned to the four Lesko brand colours, which is a brand
   decision that outranks this check, so a colour under 4.5:1 is reported as a
   warning rather than a failure. Only a colour under 3:1 — genuinely
   unreadable rather than merely short of AA — fails.

   Run it after changing or adding a colour in data/calendar.js.
   ========================================================================== */
'use strict';

const { LH_FUNDERS } = require('./data/calendar.js');

const INK = '#12213F';
const AA = 4.5;           // WCAG AA for text below 18px
const FLOOR = 3.0;        // below this a label is genuinely unreadable

function luminance(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

const inkL = luminance(INK);
let failed = 0;
let warned = 0;
let worst = Infinity;

for (const [key, topic] of Object.entries(LH_FUNDERS)) {
  const bg = luminance(topic.color);
  const onWhite = 1.05 / (bg + 0.05);
  const onInk = (bg + 0.05) / (inkL + 0.05);
  const ratio = Math.max(onWhite, onInk);
  const label = onInk >= onWhite ? 'ink' : 'white';

  worst = Math.min(worst, ratio);
  const verdict = ratio < FLOOR ? 'FAIL' : ratio < AA ? 'warn' : 'pass';
  if (verdict === 'FAIL') failed++;
  if (verdict === 'warn') warned++;

  console.log(
    `${verdict}  ${ratio.toFixed(2)}:1  ${label.padEnd(5)} ${topic.color}  ${key}`
  );
}

console.log(`\nworst ${worst.toFixed(2)}:1  (AA is ${AA}:1, hard floor ${FLOOR}:1)`);

if (warned) {
  console.log(
    `\n${warned} colour(s) sit between ${FLOOR} and ${AA}. That is the known ` +
    `cost of\npinning the palette to the exact Lesko brand colours — the ` +
    `labels stay bold\nand legible, but they do not clear AA. Accepted ` +
    `deliberately; do not "fix" it\nby inventing an off-brand shade.`
  );
}

if (failed) {
  console.error(`\n${failed} funder colour(s) cannot carry a legible label at all.`);
  console.error('Pick a different one of the four brand colours for that funder type.');
  process.exit(1);
}
