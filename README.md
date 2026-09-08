# Grant Strategy Calendar

The Fund-Nation grant year as a working calendar, built for the Lesko Help
community. It is a **planning tool for organisations seeking grants**: when
each funder type opens, what to do this month, and the workbook that gets
your package ready before you start searching.

Built from two source documents:

- **Grant Strategy Calendar, 2026 Edition** — Fund-Nation, 14 pages
- **Your Grant Planning Workbook** — Fund-Nation · Nonprofit Classroom, 15 pages

---

## What it does

### Calendar

- **A real month calendar.** Each funder season is drawn as a labelled line
  across the months it runs. Clicking the month name opens the whole year —
  twelve cards, each showing its theme and what falls in it.
- **The month's own page.** Underneath the grid, that month's theme, its
  relationship-building note and its five actions, straight from the source.
  Plus the *Grants to apply for this month* space the PDF leaves blank, which
  saves in your browser.
- **Three states.** *Open*, *Closing soon*, *Opening soon* — on every row, in
  the detail card, and as a key beside the scope tabs.
- **Today / This week / This month**, and the list always covers whatever the
  calendar is showing.
- **Filter by funder type**, each with a note on how its timing behaves.

### Workbook

- All eight tasks, as fillable tables that save in your browser.
- The five grant types, and the eight definitions.
- **A live position calculator** — the one thing a PDF cannot do. Put in a
  salary and it works through the source's own steps, rounding to the cent at
  each one, so it reproduces the printed $60,000 example exactly.
- The resources page, and the Beginner Grants next step.

---

## About the dates

The source works in **whole months**, not dates — "banks open their grant
portals this month", not "March 14" — and it ends with *"Rinse and repeat,
every year."*

So seasons are stored as recurring month bands and regenerated for whichever
year is on screen, rather than pinned to 2026. A band that runs past New Year
(the bank relationship season, November to January) sets `wraps: true` and is
generated across the boundary.

The single exception is **Giving Tuesday**, which is the Tuesday after
Thanksgiving and therefore moves every year. It is computed, not stored.

---

## One thing the source does not agree with itself about

Workbook page 11 gives a quick rule: *"salary multiplied by 1.35 is the figure
that goes in your budget."* Page 12 then works a $60,000 salary through the
long method and arrives at **$108,409.60** — an effective multiplier of about
1.81.

On $60,000 that is $81,000 versus $108,409.60, a gap of $27,409.60.

Both are reproduced exactly as printed, and the calculator shows both side by
side with the gap named. Budgeting the wrong one is the error the page exists
to prevent, so it is surfaced rather than quietly resolved.

---

## Files

```
index.html              The page
assets/styles.css       Visual system — carried over from the Lesko Help quiz
assets/calendar.js      Month grid, year view, month plan, seasons list
assets/workbook.js      Workbook view and the position calculator
data/calendar.js        Funder types, seasons, and the twelve month pages
data/workbook.js        Tasks, definitions, costing constants, resources
data/archive/           The earlier household-benefits calendar (not built)
docs/research.md        Research behind the earlier version, kept for reference
build.js                Inlines everything into a single file
check-contrast.js       Fails if a funder colour cannot carry a legible label
check-source.js         Fails if the data stops matching the source PDFs
```

Open `index.html` directly in a browser. No build step, no dependencies, no
server.

---

## Keeping it current

Edit `data/calendar.js` and `data/workbook.js`. Both are plain text, with the
rules written at the top of each file.

Before shipping a change, run both checks:

```bash
node check-source.js      # data still matches the source PDFs
node check-contrast.js    # every colour can carry a label
node build.js             # rebuild dist/
```

`check-source.js` is the important one. It asserts that all twelve months are
present with five actions each, that every season points at a real funder
type, and that the costing constants still reproduce the source's worked
example to the cent. If someone adjusts a rate, that check tells them the
calculator has stopped agreeing with the PDF beside it.

### Colours

There are exactly **four** — the bright Lesko blue, red, gold and green, the
same four as the frame stripes. No tints, no shades, no fifth hue. Funder
types share them by suit family, which works because every line carries its
own name.

Pinning to the exact brand colours puts the red at 4.27:1 with white text,
just under WCAG AA for small text. That is a deliberate call: brand fidelity
outranks the check here, so `check-contrast.js` warns rather than fails, and
only a colour under 3:1 fails the build. Do not "fix" the warning by inventing
an off-brand shade.

### Previewing another day

```
index.html?date=2027-02-01
```

Useful for checking how February reads when the bank portals open.

---

## Putting it in the community

```bash
node build.js
```

Writes two files:

- **`dist/lh-calendar.html`** — the whole page in one file, nothing external
  except the Google Fonts link. Host it, or paste it into a Circle custom-code
  block.
- **`dist/lh-calendar.artifact.html`** — the same without the outer
  `<html>`/`<head>`/`<body>`, which is what the Claude Artifact publisher wants.

Both are committed, so the current build can be grabbed without running
anything.

The build inlines with replacer **functions**, not strings. This matters:
`String.replace` treats `$'` in a string replacement as "everything after the
match", and the calculator formats currency with `'$' + …` — which used to
splice the tail of the document into the middle of the script four times over.
There is now a structural check that fails the build if more than one
`</body>` ends up in the output.

---

## A caution

This calendar tells you **when**, in whole months, and it repeats every year.
It is not a list of real deadlines. Confirm every actual date directly with the
funder — which is, as the source keeps pointing out, a good reason to call them.
