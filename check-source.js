#!/usr/bin/env node
/* ============================================================================
   Source fidelity check —  node check-source.js

   The calendar and workbook are transcriptions of two Fund-Nation PDFs. This
   asserts the things that would quietly go wrong if someone edited the data:
   that all twelve months are present, that every season points at a real
   funder type, and — most importantly — that the costing constants still
   reproduce the worked example printed in the source, to the cent.
   ========================================================================== */
'use strict';

const { LH_FUNDERS, LH_SEASONS, LH_MONTHS } = require('./data/calendar.js');
const { LH_WORKBOOK } = require('./data/workbook.js');

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
ok(LH_WORKBOOK.tasks.length === 8, 'eight workbook tasks');
ok(LH_WORKBOOK.definitions.length === 8, 'eight definitions');

// The one that matters: the calculator must agree with the printed example.
const C = LH_WORKBOOK.costing;
const e = C.example;
const r2 = (n) => Math.round(n * 100) / 100;

const base = r2(e.salary / C.hoursPerYear);
const pto = r2(r2(base * C.ptoHours) / C.hoursPerYear);
const hc = r2(e.healthcare / C.hoursPerYear);
const sup = r2(base * C.supervisionRate);
const added = r2(pto + hc + sup);
const totalHourly = r2(base + added);
const fringePerHour = r2(totalHourly * C.fringeRate);
const loaded = r2((totalHourly + fringePerHour) * C.hoursPerYear);

[['base hourly', base, e.baseHourly],
 ['PTO per hour', pto, e.ptoPerHour],
 ['healthcare per hour', hc, e.healthcarePerHour],
 ['supervision per hour', sup, e.supervisionPerHour],
 ['added per hour', added, e.addedPerHour],
 ['total hourly', totalHourly, e.totalHourly],
 ['fringe per hour', fringePerHour, e.fringePerHour],
 ['fully loaded annual', loaded, e.loadedAnnual],
 ['shortfall', r2(loaded - e.salary), e.shortfall],
].forEach(([label, got, want]) =>
  ok(Math.abs(got - want) < 0.005, `${label} reproduces the source (${want})`));

const taxes = C.taxes.reduce((a, t) => a + t[1], 0);
ok(Math.abs(taxes - 23.25) < 0.001, 'employer taxes still total the printed 23.25%');

console.log(bad ? `\n${bad} check(s) failed.` : '\nAll source-fidelity checks pass.');
process.exit(bad ? 1 : 0);
