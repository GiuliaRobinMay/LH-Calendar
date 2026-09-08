#!/usr/bin/env node
/* ============================================================================
   Source fidelity check —  node check-source.js

   The calendar is a transcription of the Fund-Nation Grant Strategy Calendar.
   This asserts the things that would quietly go wrong if someone edited the
   data: that all twelve months are present with their five actions, and that
   every season points at a real funder type and sits in real months.
   ========================================================================== */
'use strict';

const { LH_FUNDERS, LH_SEASONS, LH_MONTHS } = require('./data/calendar.js');

let bad = 0;
const ok = (cond, msg) => {
  console.log((cond ? 'pass  ' : 'FAIL  ') + msg);
  if (!cond) bad++;
};

ok(LH_MONTHS.length === 12, 'twelve months present');
ok(LH_MONTHS.every((m) => m.theme && m.relationship && m.actions.length === 5),
   'every month has a theme, a relationship note and five actions');
ok(LH_SEASONS.every((s) => LH_FUNDERS[s.funder]), 'every season points at a real funder type');
ok(LH_SEASONS.every((s) => s.fromM >= 0 && s.fromM < 12 && s.toM >= 0 && s.toM < 12),
   'every season has valid month numbers');
// Every season must name the months it covers, so the list can explain itself.
ok(LH_SEASONS.every((s) => s.name && s.short && s.peak),
   'every season has a name, a one-line description and a peak');

console.log(bad ? `\n${bad} check(s) failed.` : '\nAll source-fidelity checks pass.');
process.exit(bad ? 1 : 0);
