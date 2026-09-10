#!/usr/bin/env node
/* ============================================================================
   Data check —  node check-source.js

   The page is deliberately simple, which means there is very little of it and
   every piece has to be right. This asserts the data is complete and that the
   plain-language rules actually held.
   ========================================================================== */
'use strict';

const { LH_INTRO, LH_COLORS, LH_GRANTS, LH_MONTHS } = require('./data/calendar.js');

let bad = 0;
const ok = (cond, msg) => {
  console.log((cond ? 'pass  ' : 'FAIL  ') + msg);
  if (!cond) bad++;
};

ok(LH_MONTHS.length === 12, 'twelve months of advice');
ok(LH_MONTHS.every((m) => m.name && m.line && m.todo.length && m.todo.length <= 3),
   'every month has a line and no more than three things to do');
ok(LH_GRANTS.length === 7, 'seven grants — few enough to take in at a glance');
ok(LH_GRANTS.every((g) => g.name && g.when && g.what && g.tip),
   'every grant says what it is and how to get it');
ok(LH_GRANTS.every((g) => LH_COLORS[g.color]), 'every grant uses one of the four brand colours');
ok(LH_GRANTS.every((g) => g.from >= 0 && g.from < 12 && g.to >= 0 && g.to < 12),
   'every grant sits in real months');

// Every month of the year should have at least one grant open, or the page
// tells somebody "nothing for you" and they never come back.
const covered = [];
for (let m = 0; m < 12; m++) {
  covered[m] = LH_GRANTS.some((g) =>
    g.from <= g.to ? m >= g.from && m <= g.to : m >= g.from || m <= g.to);
}
const empty = covered.map((c, m) => (c ? null : m)).filter((m) => m !== null);
ok(empty.length <= 1,
   `at most one empty month (empty: ${empty.length ? empty.join(', ') : 'none'})`);

// Reading level. These are the words that sent members away last time.
const JARGON = ['funder', 'funding cycle', 'portal', 'proposal', 'fiscal',
                'Community Reinvestment', 'CRA', 'letter of intent', 'LOI',
                'de minimis', 'capacity building', 'stakeholder', 'leverage'];
const allText = JSON.stringify({ LH_INTRO, LH_GRANTS, LH_MONTHS }).toLowerCase();
const found = JARGON.filter((w) => allText.includes(w.toLowerCase()));
ok(found.length === 0, `no jargon in the copy${found.length ? ' — found: ' + found.join(', ') : ''}`);

// Long sentences are the other thing that loses people.
const sentences = [];
const walk = (v) => {
  if (typeof v === 'string') sentences.push(...v.split(/(?<=[.!?])\s+/));
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
walk({ LH_INTRO, LH_GRANTS, LH_MONTHS });
const longOnes = sentences.filter((s) => s.split(/\s+/).length > 25);
ok(longOnes.length === 0,
   `every sentence under 25 words${longOnes.length ? ' — longest: "' + longOnes[0].slice(0, 60) + '..."' : ''}`);

console.log(bad ? `\n${bad} check(s) failed.` : '\nAll checks pass.');
process.exit(bad ? 1 : 0);
