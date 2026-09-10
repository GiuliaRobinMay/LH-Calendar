# Grant Calendar

A one-screen answer to "when can I apply?", for people who have never applied
for a grant before.

Built from the Fund-Nation Grant Strategy Calendar, 2026 Edition.

---

## The idea

Members told us the first version was too complicated. It was — it had funder
types, filters, a month grid, ten overlapping "seasons" and a workbook. That is
a tool for someone who already knows how grants work.

This version teaches two facts and then gets out of the way:

1. **Most grants have no deadline.** Apply any day.
2. **A few only open at set times.** Those are the seven on the page.

Everything else was cut.

## What is on the page

In this order, top to bottom:

- **The two facts**, before anything moves or asks for a click.
- **What is open right now** — worked out from today's date, with how many
  months are left to apply.
- **The seven grants**, each with a twelve-block strip showing the months it is
  open. The picture is the explanation; there is no legend to read.
- **What to do this month** — one line and up to three things.

No navigation, no filters, no dropdowns, no month grid, no tabs.

## The seven

| Grant | Open |
|---|---|
| Bank grants | February to October |
| Foundation grants | March |
| Government grants | April and May |
| State grants | June |
| Local grants | July |
| Shop & company grants | August |
| Year-end giving | November and December |

The source also has a January planning month and a November-to-January stretch
for getting to know your bank. Neither is a grant you apply for, so putting
them in this list only made it longer. They live in the monthly advice instead.

---

## Files

```
index.html          The page
assets/styles.css   Visual system, carried over from the Lesko Help quiz
assets/calendar.js  Works out the current month and draws everything
data/calendar.js    The seven grants and the twelve months of advice
data/archive/       Earlier versions, not built (see its README)
build.js            Inlines everything into a single file
check-source.js     Data completeness, and the plain-language rules
check-contrast.js   Every colour can carry a readable month letter
```

Open `index.html` in a browser. No build step, no dependencies, no server.

## Keeping it current

Edit `data/calendar.js`. Plain text, rules written at the top.

```bash
node check-source.js
node check-contrast.js
node build.js
```

`check-source.js` enforces the things that made the last version fail:

- **No jargon.** It fails on "funder", "portal", "proposal", "fiscal",
  "Community Reinvestment", "stakeholder" and friends.
- **No sentence over 25 words.**
- **No more than three things to do** in a month.
- **Seven grants**, few enough to take in at a glance.
- **No empty month** — if a month has nothing open, the page tells somebody
  "nothing for you" and they do not come back.

If you add copy and the check fails, the copy is the problem, not the check.

## Colours

Four only — the Lesko blue, red, gold and green, the same four as the frame
stripes. The month-letter colour is worked out at runtime from the real
contrast ratio, so gold gets dark text and the others get white.

## Embedding

```bash
node build.js
```

`dist/lh-calendar.html` is the whole page in one file. Host it, or paste it
into an embed block.

## A caution

Dates are guides, not promises. The source works in whole months and repeats
every year. Always confirm with the bank, foundation or office directly.
