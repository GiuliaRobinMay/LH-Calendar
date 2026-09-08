# The Help Calendar

A calendar of US grants and assistance, built for the Lesko Help community.
It is a **planning tool, not a directory**: it answers *is this open now, am I
about to miss a deadline, when can I start* — not *what should I apply for*.

Most help in America is not first-come-you-qualify, it is
first-come-you-applied. Windows open, funding runs out, and the door shuts
months before the published deadline. This shows those windows.

---

## What it does

- **A real month calendar.** Day squares, week rows, and each window drawn as a
  labelled line across the days it is open. Clicking the month name opens the
  whole year at once — twelve cards, each showing what falls in it.
- **The list follows the calendar.** *Today* / *This week* / *<the month on
  screen>*. Move to October and the list becomes October — the third tab
  carries the month's name so the link is visible. Both are ordered by the same
  rule, so line three in the grid is row three in the list.
- **Three states, everywhere.** *Open*, *Closing soon* and *Opening soon* — on
  every row, in the detail card, and as a key beside the scope tabs.
- **Colour means topic.** Every line takes its colour from its seasonal domain,
  and every list row leads with that colour, so the list reads as the key to the
  calendar above it.
- **Seasonal domains only.** Nine of them, in a dropdown, each with a note on
  how its timing behaves. Anything you can apply for on any day of the year is
  kept off the grid entirely.
- **Everything is computed from today's date.** Nobody edits the page as months
  roll over. Open the same file in December and it re-sorts itself.
- **Honest about certainty.** Windows that vary by state say so on the row and
  in the card. A wrong date here costs somebody a benefit.
- **Click anything for a card** — the window, the countdown, what to have ready,
  what happens if you miss it, and where to actually go.

Research behind the dates, and a scan of what everyone else in this space is
doing, is in [`docs/research.md`](docs/research.md).

---

## Files

```
index.html            The page
assets/styles.css     Visual system — carried over from the Lesko Help quiz
assets/calendar.js    Month grid, list, scopes, and the detail card
data/programs.js      The dataset  ← this is the only file most edits touch
docs/research.md      Sourced dates + competitive analysis
build.js              Inlines everything into a single file
check-contrast.js     Fails if a topic colour cannot carry a legible label
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
  topic: 'health-coverage',            // a key of LH_TOPICS
  name: 'Medicare Open Enrollment',
  short: 'One clause — what it IS. Shown in the list.',
  what: 'A sentence or two. Shown in the detail card.',
  opens: '2026-10-15',                 // null if there is no window
  closes: '2026-12-07',
  precision: 'exact',                  // exact | typical | varies
  cadence: 'Every year, Oct 15 – Dec 7',
  prep: ['What to have ready', '...'],
  where: 'Where to actually go',
  link: 'https://...',
}
```

There are exactly **four colours** on the calendar — the bright Lesko blue,
red, gold and green, the same four as the frame stripes. No tints, no shades,
no fifth hue. Domains share them by suit family, which is fine because every
line carries its own name; the colour only says which family it is in. After
changing one, run:

```bash
node check-contrast.js
```

It works out the real contrast ratio of each colour against ink and against
white and takes the better of the two, which is what the page does at runtime.
Brand fidelity outranks the check, so a colour short of AA warns rather than
fails; only one genuinely unreadable (under 3:1) fails the build. Today the
brand red sits at 4.27:1 with white — legible, deliberately kept.

Only **seasonal** domains belong on the calendar. If a programme takes
applications every day of the year, give it `topic: 'no-season'` and it moves
to the list underneath, where it cannot imply a deadline that does not exist.

The one rule that matters: **if you are not sure of a date, say so.** Set
`precision` to `typical` or `varies` and put the detail in `caveat`. "Check your
state" is always a better answer than a confident guess — that honesty is the
main thing separating this from the articles already out there.

Suggested rhythm: a full pass each **September**, before the autumn windows
open, since that is when most of the year's dates are set. The footer date and
the review line in `data/programs.js` should both be updated when you do.

### Previewing another day

Append a date to the URL to see how the calendar will look then:

```
index.html?date=2026-12-01
```

Useful for checking a row reads correctly in the week its window opens.

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
3. **A link from the quiz.** The quiz already knows which topics somebody
   checked. Landing them on the calendar pre-filtered to those is a small change
   and probably the strongest single follow-up.

---

## A caution

This calendar tells you **when**. It does not decide whether anyone qualifies,
and it is not an application. Every card names the office to confirm with.
