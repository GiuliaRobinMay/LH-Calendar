# Archive

## `household-benefits.js`

The first version of this calendar covered **household benefits** — LIHEAP,
FAFSA, SNAP, Medicare open enrollment, tax season and so on. It answered
"what can a household apply for, and when".

It was replaced when the Fund-Nation source material arrived, which is a
different product for a different audience: **nonprofits seeking grants**.
The two do not merge — a nonprofit planning a bank grant cycle and a family
trying to get the heating bill paid share nothing but the word "deadline".

Nothing here is wired into the build. It is kept because the dates were
individually researched and sourced (see `docs/research.md`, section 1), and
that research would be expensive to repeat if a household-facing calendar is
ever wanted alongside this one.

## `workbook-data.js` and `workbook-view.js`

A full transcription of "Your Grant Planning Workbook" — the eight tasks as
fillable tables, the five grant types, the eight definitions, the resources,
and a live position calculator that reproduced the source's $60,000 worked
example to the cent.

Removed from the page on request: without the teaching that goes with it, the
workbook is too complicated to drop in front of people cold. The calendar
stands on its own; the workbook needs a course around it.

Kept because the transcription is faithful and the calculator was verified
against the printed example step by step. If it is ever wanted back, it needs
`check-source.js` restoring too — that file used to assert the costing
constants still matched the PDF.
