# Grant Strategy Calendar

The Fund-Nation grant year as a working calendar, built for the Lesko Help
community. It is a **planning tool for organisations seeking grants**: which
funder types are open when, and what to do each month.

Built from **Grant Strategy Calendar, 2026 Edition** — Fund-Nation, 14 pages.

---

## What it does

- **Opens on the year.** Twelve cards, each with its theme from the source and
  the seasons running through it. That is the view that answers *when does what
  happen*.
- **Click a month for the detail** — or step through with the arrows. You get
  the month grid, that month's page from the source (theme, relationship note,
  five actions), and the *Grants to apply for this month* space the PDF leaves
  blank, which saves in your browser.
- **Three states.** *Open*, *Closing soon*, *Opening soon* — on every row, in
  the detail card, and as a key beside the scope tabs. A season that has ended
  says when it comes back, because they all repeat.
- **Today / This week / This period**, and the list always covers whatever the
  calendar is showing.
- **Filter by funder type**, each with a note on how its timing behaves.

## The ten seasons

The source gives twelve *monthly themes*. Those collapse into ten recurring
seasons, because several consecutive months belong to one funder cycle:

| Season | Runs | Funder type |
|---|---|---|
| Planning & preparation | January | Planning & readiness |
| Bank grant portals open | February – October | Banks & CRA |
| Bank relationship season | November – January | Banks & CRA |
| Foundation grant season | March | Foundations |
| Federal grant season | April – May | Federal |
| State grants & mid-year review | June | State |
| Local & community grants | July | Local & community |
| Retail & corporate grants | August | Retail & corporate |
| Giving Tuesday campaign | September – November | Campaigns |
| Year-end & major gifts | November – December | Campaigns |

Banks get two because the source treats them as two distinct jobs: the portal
window, and the unfunded months that decide it.

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

## A note on the workbook

The Grant Planning Workbook was built and then removed. Without the teaching
that goes with it, it is too complicated to put in front of people cold — the
calendar stands alone, the workbook needs a course around it. It is preserved
under `data/archive/`, along with a note on what would need restoring if it
comes back. It also documented a real contradiction in the source: the quick
costing rule (salary × 1.35) and the long method disagree by $27,409.60 on a
$60,000 salary. Worth fixing in the PDF regardless of whether the page returns.

---

## Files

```
index.html              The page
assets/styles.css       Visual system — carried over from the Lesko Help quiz
assets/calendar.js      Year view, month grid, month plan, seasons list
data/calendar.js        Funder types, seasons, and the twelve month pages
data/archive/           The household-benefits calendar and the workbook,
                        both retired but kept (see its README)
docs/research.md        Research behind the earlier version, kept for reference
build.js                Inlines everything into a single file
check-contrast.js       Fails if a funder colour cannot carry a legible label
check-source.js         Fails if the data stops matching the source PDFs
```

Open `index.html` directly in a browser. No build step, no dependencies, no
server.

---

## Keeping it current

Edit `data/calendar.js`. It is plain text, with the rules written at the top.

Before shipping a change, run both checks:

```bash
node check-source.js      # data still matches the source PDFs
node check-contrast.js    # every colour can carry a label
node build.js             # rebuild dist/
```

`check-source.js` asserts that all twelve months are present with five actions
each, and that every season points at a real funder type, sits in real months,
and carries the name and description the list needs to explain itself.

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

The build inlines with replacer **functions**, not strings. `String.replace`
treats `$'` in a string replacement as "everything after the match", which once
spliced the tail of the document into the middle of a script four times over.
A structural check now fails the build if more than one `</body>` reaches the
output.

---

## A caution

This calendar tells you **when**, in whole months, and it repeats every year.
It is not a list of real deadlines. Confirm every actual date directly with the
funder — which is, as the source keeps pointing out, a good reason to call them.
