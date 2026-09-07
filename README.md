# The Help Calendar

A season calendar for US grants and assistance, built for the Lesko Help
community. It answers one question before any other: **what can somebody
actually apply for today?**

Most help in America is not first-come-you-qualify, it is
first-come-you-applied. Windows open, funding runs out, and the door shuts
months before the published deadline. This shows those windows.

---

## What it does

- **A status board, not a month grid.** Programmes are grouped by what you can
  do about them right now — *closing soon*, *open right now*, *opens soon*,
  *watch for it*, *open all year*, *later*. A month grid was tried on paper and
  rejected: nearly every window spans several months, so a grid buries the one
  thing people need.
- **Everything is computed from today's date.** Nobody has to edit the page when
  the date rolls over. Open the same file in December and it reorders itself.
- **Honest about certainty.** A window we know exactly is drawn solid. One that
  is typical-but-varies is drawn striped and says so on the card face, not in a
  footnote. A wrong date here costs somebody a benefit.
- **A rolling twelve-month strip.** Starting from the current month, not
  January, so winter programmes are not cut in half.
- **What to have ready.** Every card lists the paperwork, and cards for windows
  that have not opened yet say when to start gathering it.

Research behind the dates, and a scan of what everyone else in this space is
doing, is in [`docs/research.md`](docs/research.md).

---

## Files

```
index.html            The page
assets/styles.css     Visual system — carried over from the Lesko Help quiz
assets/calendar.js    Status logic, board, and the year strip
data/programs.js      The dataset  ← this is the only file most edits touch
docs/research.md      Sourced dates + competitive analysis
build.js              Inlines everything into a single file
dist/                 Build output (committed, so it can be pasted anywhere)
```

Open `index.html` directly in a browser. There is no build step, no
dependencies, and no server needed.

---

## Keeping it current

Edit `data/programs.js`. It is plain text and dates, with the rules written at
the top of the file. No code knowledge needed.

Each entry looks like this:

```js
{
  id: 'medicare-open-enrollment',
  name: 'Medicare Open Enrollment',
  cat: 'health',                       // home | health | money | family
  what: 'One plain-English sentence.',
  opens: '2026-10-15',                 // null if there is no window
  closes: '2026-12-07',
  precision: 'exact',                  // exact | typical | varies
  cadence: 'Every year, Oct 15 – Dec 7',
  prep: ['What to have ready', '...'],
  where: 'Where to actually go',
  link: 'https://...',
}
```

The one rule that matters: **if you are not sure of a date, say so.** Set
`precision` to `typical` or `varies` and put the detail in `caveat`. "Check your
state" is always a better answer than a confident guess — that honesty is the
main thing separating this from the articles already out there.

Suggested rhythm: a full pass each **September**, before the autumn windows
open, since that is when most of the year's dates are set. The footer date and
the review line in `data/programs.js` should both be updated when you do.

### Previewing another day

Append a date to the URL to see how the board will look then:

```
index.html?date=2026-12-01
```

Useful for checking a card reads correctly in the week its window opens.

---

## Putting it in the community

```bash
node build.js
```

This writes two files:

- **`dist/lh-calendar.html`** — the whole page in one file, nothing external
  except the Google Fonts link. Host it, or paste it into a Circle custom-code
  block.
- **`dist/lh-calendar.artifact.html`** — the same page without the outer
  `<html>`/`<head>`/`<body>`, which is the shape the Claude Artifact publisher
  expects.

Both are committed, so the current build can be grabbed without running
anything.

---

## Where this goes next

In rough order of value, with reasoning in `docs/research.md`:

1. **Per-state dates.** A dozen programmes genuinely differ by state, and right
   now the honest answer is "check yours". `precision` is already in the data
   model to hang this on.
2. **Reminders.** "Your heating help window opens in three weeks" is almost
   certainly the highest-value thing here, and needs member storage rather than
   a static page.
3. **A link from the quiz.** The quiz already knows which suits somebody
   checked. Landing them on the calendar pre-filtered to those topics is a small
   change and probably the strongest single follow-up.

---

## A caution

This calendar tells you **when**. It does not decide whether anyone qualifies,
and it is not an application. Every card names the office to confirm with.
