/* ============================================================================
   Lesko Help — Season Calendar
   Takes the dataset in data/programs.js and answers one question first:
   what can somebody actually apply for today?

   Everything here is derived from today's date, so the page is correct on any
   day it is opened without anyone editing it. Append ?date=YYYY-MM-DD to the
   URL to preview how the board will look on a future day.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- DAY MATH */
  // Dates are parsed at UTC noon so that adding days never trips over a
  // daylight-saving boundary and lands on the wrong calendar day.
  function day(iso) {
    var p = iso.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
  }
  function daysBetween(from, to) {
    return Math.round((to - from) / 86400000);
  }

  var override = new URLSearchParams(location.search).get('date');
  var TODAY = override && /^\d{4}-\d{2}-\d{2}$/.test(override)
    ? day(override)
    : (function () {
        var n = new Date();
        return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), 12));
      })();

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function longDate(d) {
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }
  function shortDate(d) {
    return MON[d.getUTCMonth()] + ' ' + d.getUTCDate();
  }
  function shortDateYear(d) {
    return MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }
  // "in 24 days" reads better than "24 days" in a sentence, and "tomorrow"
  // beats "in 1 day" every time.
  function countdown(n) {
    if (n === 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n < 14) return 'in ' + n + ' days';
    if (n < 60) return 'in ' + n + ' days';
    if (n < 400) {
      var m = Math.round(n / 30.4);
      return 'in about ' + m + ' month' + (m === 1 ? '' : 's');
    }
    return 'in about ' + Math.round(n / 365) + ' years';
  }
  function remaining(n) {
    if (n === 0) return 'last day';
    if (n === 1) return '1 day left';
    if (n < 70) return n + ' days left';
    var m = Math.round(n / 30.4);
    return 'about ' + m + ' months left';
  }

  /* --------------------------------------------------------------- STATUS */
  // The window is closing soon inside this many days.
  var CLOSING_SOON = 30;
  // The window opens soon inside this many days — long enough to be useful
  // for gathering paperwork, short enough not to swamp the board.
  var OPENING_SOON = 75;

  var GROUPS = [
    { key: 'closing', title: 'Closing soon',
      note: 'The window shuts within a month. Do these this week.' },
    { key: 'open', title: 'Open right now',
      note: 'You can apply today. Nothing is standing in the way.' },
    { key: 'soon', title: 'Opens soon — start getting ready',
      note: 'Not open yet. Gather the paperwork now so you can file the week it opens.' },
    { key: 'watch', title: 'No fixed season — watch for it',
      note: 'These open without much warning and close fast. Be ready before they do.' },
    { key: 'always', title: 'Open every day of the year',
      note: 'No deadline at all. The only reason not to have applied is not knowing about it.' },
    { key: 'later', title: 'Later in the year',
      note: 'Nothing to do yet. Here so it does not arrive as a surprise.' },
    { key: 'closed', title: 'Closed for this round',
      note: 'The window has passed. Here is when it comes back.' },
  ];

  function statusOf(p) {
    if (p.watch) return 'watch';
    if (!p.opens && !p.closes) return 'always';

    var o = day(p.opens), c = day(p.closes);

    if (TODAY >= o && TODAY <= c) {
      return daysBetween(TODAY, c) <= CLOSING_SOON ? 'closing' : 'open';
    }
    if (TODAY < o) {
      return daysBetween(TODAY, o) <= OPENING_SOON ? 'soon' : 'later';
    }
    return 'closed';
  }

  // The one-line summary that sits in the tinted box on every card. This is
  // the line most people will read and nothing else.
  function windowLine(p, status) {
    var o = p.opens ? day(p.opens) : null;
    var c = p.closes ? day(p.closes) : null;

    if (status === 'always')
      return { lead: 'Open now', parts: ['no deadline, apply any day'] };
    if (status === 'watch')
      return { lead: 'No fixed dates', parts: [p.cadence] };
    if (status === 'open' || status === 'closing')
      return { lead: 'Open now',
               parts: ['closes ' + shortDateYear(c), remaining(daysBetween(TODAY, c))] };
    if (status === 'soon' || status === 'later')
      return { lead: 'Opens ' + shortDateYear(o),
               parts: [countdown(daysBetween(TODAY, o))] };
    return { lead: 'Closed ' + shortDateYear(c), parts: [p.cadence] };
  }

  /* ------------------------------------------------------------- ELEMENTS */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function suitSpan(catKey) {
    var c = LH_CATEGORIES[catKey];
    var s = el('span', 'card-suit suit-' + c.color, c.suit);
    s.setAttribute('title', c.name);
    return s;
  }

  /* ----------------------------------------------------------------- CARD */
  function buildCard(p, status) {
    var card = el('article', 'card');

    var top = el('div', 'card-top');
    top.appendChild(suitSpan(p.cat));

    var titleWrap = el('div');
    titleWrap.appendChild(el('h3', 'card-title', p.name));
    if (p.alsoCalled) titleWrap.appendChild(el('div', 'card-also', 'Also called: ' + p.alsoCalled));
    top.appendChild(titleWrap);

    var badgeText = {
      closing: 'Closing soon', open: 'Open now', soon: 'Opens soon',
      watch: 'Watch for it', always: 'Always open', later: 'Later', closed: 'Closed',
    }[status];
    top.appendChild(el('span', 'badge', badgeText));
    card.appendChild(top);

    card.appendChild(el('p', 'card-what', p.what));

    var w = windowLine(p, status);
    var win = el('div', 'window');
    win.appendChild(el('span', 'lead', w.lead));

    var parts = w.parts.slice();
    if (p.precision === 'varies') parts.push('dates differ by state');
    else if (p.precision === 'typical') parts.push('usual dates, check yours');

    parts.forEach(function (text) {
      win.appendChild(el('span', 'sep', '·'));
      // Long phrases are allowed to wrap internally; short ones are kept
      // whole so a countdown never splits across two lines.
      win.appendChild(el('span', 'dates' + (text.length > 28 ? ' wrapok' : ''), text));
    });
    card.appendChild(win);

    // Only show key dates that have not already gone by.
    (p.keyDates || []).forEach(function (k) {
      var d = day(k.date);
      if (daysBetween(TODAY, d) < 0) return;
      var row = el('div', 'keydate');
      row.appendChild(el('span', 'kd-date', shortDate(d)));
      row.appendChild(el('span', null, k.label));
      card.appendChild(row);
    });

    if (p.urgent) {
      var u = el('div', 'urgent');
      u.appendChild(el('b', null, 'Worth knowing. '));
      u.appendChild(document.createTextNode(p.urgent));
      card.appendChild(u);
    }

    // The paperwork list is the practical payload, but it is long — so it
    // collapses, and opens itself for anything you could act on today.
    if (p.prep && p.prep.length) {
      var det = el('details', 'prep');
      var actionable = status === 'open' || status === 'closing' ||
                       status === 'always' || status === 'watch';
      if (actionable) det.open = true;

      var label = 'What to have ready';
      if (status === 'soon' && p.prepDays) {
        var lead = daysBetween(TODAY, day(p.opens)) - p.prepDays;
        label = lead <= 0
          ? 'Start gathering now — ' + p.prep.length + ' things'
          : 'Start gathering ' + countdown(Math.max(lead, 0)) + ' — ' + p.prep.length + ' things';
      }
      det.appendChild(el('summary', null, label));

      var ul = el('ul');
      p.prep.forEach(function (item) { ul.appendChild(el('li', null, item)); });
      det.appendChild(ul);

      if (p.missedIt) det.appendChild(el('p', null, 'If you miss it: ' + p.missedIt));
      if (p.renewal) det.appendChild(el('p', null, 'Renewing: ' + p.renewal));
      card.appendChild(det);
    }

    if (p.caveat) card.appendChild(el('div', 'caveat', p.caveat));

    var foot = el('div', 'card-foot');
    foot.appendChild(el('span', 'where', p.where));
    if (p.link) {
      var a = el('a', null, 'Go there →');
      a.href = p.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', 'Open the official page for ' + p.name);
      foot.appendChild(a);
    }
    card.appendChild(foot);

    return card;
  }

  /* ---------------------------------------------------------------- STATE */
  var filters = { status: 'all', cat: 'all' };

  var decorated = LH_PROGRAMS.map(function (p) {
    return { p: p, status: statusOf(p) };
  });

  function visible() {
    return decorated.filter(function (d) {
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.cat !== 'all' && d.p.cat !== filters.cat) return false;
      return true;
    });
  }

  /* ---------------------------------------------------------------- TALLY */
  function renderTally() {
    var box = document.getElementById('tally');
    box.textContent = '';

    var openNow = decorated.filter(function (d) {
      return d.status === 'open' || d.status === 'closing' || d.status === 'always';
    }).length;
    var closing = decorated.filter(function (d) { return d.status === 'closing'; }).length;
    var soon = decorated.filter(function (d) { return d.status === 'soon'; }).length;

    [
      [openNow, 'open to apply for today'],
      [closing, 'closing within a month'],
      [soon, 'worth getting ready for'],
    ].forEach(function (row) {
      var r = el('div', 'tally-row');
      r.appendChild(el('span', 'tally-num', String(row[0])));
      r.appendChild(el('span', null, row[1]));
      box.appendChild(r);
    });
  }

  /* -------------------------------------------------------------- FILTERS */
  function renderFilters() {
    var statusRow = document.getElementById('filter-status');
    var catRow = document.getElementById('filter-cat');
    statusRow.textContent = '';
    catRow.textContent = '';

    function chip(row, label, key, group, count, suitHTML) {
      var b = el('button', 'chip');
      b.type = 'button';
      if (suitHTML) {
        var s = el('span', 'suit ' + suitHTML.cls, suitHTML.glyph);
        b.appendChild(s);
      }
      b.appendChild(document.createTextNode(label));
      if (count != null) b.appendChild(el('span', 'count', String(count)));
      b.setAttribute('aria-pressed', String(filters[group] === key));
      b.addEventListener('click', function () {
        filters[group] = filters[group] === key ? 'all' : key;
        render();
      });
      row.appendChild(b);
    }

    chip(statusRow, 'Everything', 'all', 'status', decorated.length);
    GROUPS.forEach(function (g) {
      var n = decorated.filter(function (d) { return d.status === g.key; }).length;
      if (!n) return;
      var short = { closing: 'Closing soon', open: 'Open now', soon: 'Opens soon',
                    watch: 'Watch for it', always: 'All year', later: 'Later',
                    closed: 'Closed' }[g.key];
      chip(statusRow, short, g.key, 'status', n);
    });

    chip(catRow, 'All four', 'all', 'cat', null);
    Object.keys(LH_CATEGORIES).forEach(function (k) {
      var c = LH_CATEGORIES[k];
      var n = decorated.filter(function (d) { return d.p.cat === k; }).length;
      chip(catRow, c.name, k, 'cat', n, { glyph: c.suit, cls: 'suit-' + c.color });
    });
  }

  /* ---------------------------------------------------------------- BOARD */
  function renderBoard() {
    var board = document.getElementById('board');
    board.textContent = '';

    var items = visible();
    if (!items.length) {
      board.appendChild(el('div', 'empty',
        'Nothing matches those two filters together. Try clearing one.'));
      return;
    }

    GROUPS.forEach(function (g) {
      var inGroup = items.filter(function (d) { return d.status === g.key; });
      if (!inGroup.length) return;

      var section = el('section', 'group');
      section.setAttribute('data-status', g.key);

      var head = el('div', 'group-head');
      head.appendChild(el('h2', null, g.title));
      head.appendChild(el('span', 'group-note', g.note));
      section.appendChild(head);

      // Soonest thing first inside every group — that is the reading order
      // people actually want.
      inGroup.sort(function (a, b) {
        var ka = sortKey(a), kb = sortKey(b);
        return ka - kb;
      });

      var cards = el('div', 'cards');
      cards.setAttribute('data-n', String(inGroup.length));
      inGroup.forEach(function (d) { cards.appendChild(buildCard(d.p, d.status)); });
      section.appendChild(cards);
      board.appendChild(section);
    });
  }

  function sortKey(d) {
    if (d.status === 'open' || d.status === 'closing') return daysBetween(TODAY, day(d.p.closes));
    if (d.status === 'soon' || d.status === 'later') return daysBetween(TODAY, day(d.p.opens));
    return 0;
  }

  /* ----------------------------------------------------------- YEAR STRIP */
  // A rolling 12 months starting this month. A January-to-December grid would
  // cut the winter programmes — the ones that matter most — clean in half.
  function renderYear() {
    var wrap = document.getElementById('gantt');
    wrap.textContent = '';

    var startYear = TODAY.getUTCFullYear();
    var startMonth = TODAY.getUTCMonth();
    var windowStart = Date.UTC(startYear, startMonth, 1, 12);
    var windowEnd = Date.UTC(startYear, startMonth + 12, 1, 12);
    var span = windowEnd - windowStart;

    function pct(ms) { return ((ms - windowStart) / span) * 100; }
    var todayPct = pct(TODAY.getTime());

    // Month header
    wrap.appendChild(el('div', 'gantt-label gantt-head'));
    var head = el('div', 'gantt-track gantt-head');
    for (var i = 0; i < 12; i++) {
      var mi = (startMonth + i) % 12;
      var yr = startYear + Math.floor((startMonth + i) / 12);
      var m = el('div', 'm' + (mi === 0 ? ' newyear' : ''),
                 mi === 0 ? MON[mi] + ' ' + yr : MON[mi]);
      head.appendChild(m);
    }
    var marker = el('div', 'gantt-today labelled');
    marker.style.left = todayPct + '%';
    head.appendChild(marker);
    wrap.appendChild(head);

    var items = visible().slice().sort(function (a, b) {
      var ao = a.p.opens ? day(a.p.opens).getTime() : Infinity;
      var bo = b.p.opens ? day(b.p.opens).getTime() : Infinity;
      return ao - bo;
    });

    items.forEach(function (d) {
      var p = d.p;
      var cat = LH_CATEGORIES[p.cat];

      var label = el('div', 'gantt-label');
      label.appendChild(el('span', 'suit suit-' + cat.color, cat.suit));
      label.appendChild(el('span', null, p.name));
      label.setAttribute('title', p.name);
      wrap.appendChild(label);

      var track = el('div', 'gantt-track');

      var bar;
      if (!p.opens || !p.closes || d.status === 'watch') {
        bar = el('div', 'bar always', d.status === 'watch' ? 'Could open any time' : 'Open all year');
        bar.style.left = '0%';
        bar.style.width = '100%';
      } else {
        var o = day(p.opens).getTime(), c = day(p.closes).getTime();
        // Clip to the visible year rather than dropping the row — a window
        // that started before this month is still open today.
        var rawLeft = pct(o), rawRight = pct(c);
        var left = Math.max(rawLeft, 0);
        var right = Math.min(rawRight, 100);
        if (right <= 0 || left >= 100) return; // genuinely outside the year
        // A window that runs past either edge of the visible year gets a
        // squared-off end, so a clipped bar never reads as a real boundary.
        var clip = (rawLeft < 0 ? ' clip-left' : '') + (rawRight > 100 ? ' clip-right' : '');
        bar = el('div', 'bar' + (p.precision === 'exact' ? '' : ' approx') + clip);
        bar.style.left = left + '%';
        bar.style.width = Math.max(right - left, 1.2) + '%';
        bar.style.setProperty('--bar', barColour(d.status));
        if (right - left > 13) {
          bar.textContent = MON[day(p.opens).getUTCMonth()].toUpperCase() +
                            ' – ' + MON[day(p.closes).getUTCMonth()].toUpperCase();
        }
        bar.setAttribute('title', p.name + ' · ' + longDate(day(p.opens)) +
                         ' to ' + longDate(day(p.closes)));
      }
      track.appendChild(bar);

      var m = el('div', 'gantt-today');
      m.style.left = todayPct + '%';
      track.appendChild(m);

      wrap.appendChild(track);
    });
  }

  function barColour(status) {
    return ({
      open: 'var(--st-open)', closing: 'var(--st-closing)',
      soon: 'var(--st-soon)', later: 'var(--st-later)',
      closed: 'var(--st-always)', always: 'var(--st-always)',
      watch: 'var(--st-watch)',
    })[status] || 'var(--st-always)';
  }

  /* ------------------------------------------------------------------ RUN */
  function render() {
    renderFilters();
    renderBoard();
    renderYear();
  }

  document.getElementById('today-date').textContent = longDate(TODAY);
  renderTally();
  render();
})();
