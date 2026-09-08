/* ============================================================================
   Lesko Help — The Help Calendar

   A planning tool, not a directory. It answers timing questions: is this open
   now, am I about to miss a deadline, when can I start.

   The month grid and the list underneath are always the same period. Move the
   calendar to October and the list is October. Everything else is derived from
   today's date, so nothing needs editing as the months roll over.

   Append ?date=YYYY-MM-DD to preview another day.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- DAY MATH */
  // Parsed at UTC noon so adding days never trips over a daylight-saving
  // boundary and lands on the wrong calendar square.
  function day(s) {
    var p = s.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
  }
  function mk(y, m, d) { return new Date(Date.UTC(y, m, d, 12)); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function diff(a, b) { return Math.round((b - a) / 86400000); }

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function longDate(d) { return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }
  function shortDate(d) { return MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); }

  function countdown(n) {
    if (n === 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n < 60) return 'in ' + n + ' days';
    var m = Math.round(n / 30.4);
    return m < 13 ? 'in ' + m + ' months' : 'in ' + Math.round(n / 365) + ' years';
  }
  function remaining(n) {
    if (n === 0) return 'last day';
    if (n === 1) return '1 day left';
    if (n < 70) return n + ' days left';
    return Math.round(n / 30.4) + ' months left';
  }

  var qs = new URLSearchParams(location.search).get('date');
  var TODAY = qs && /^\d{4}-\d{2}-\d{2}$/.test(qs) ? day(qs) : (function () {
    var n = new Date();
    return mk(n.getFullYear(), n.getMonth(), n.getDate());
  })();

  /* ---------------------------------------------------------------- STATE */
  var view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
  var scope = 'today';     // today | week | month
  var catFilter = 'all';

  // Only programmes with a real window go on the grid. The ones with no season
  // would paint a line across every square of every month and say nothing.
  var DATED = LH_PROGRAMS.filter(function (p) { return p.opens && p.closes && !p.watch; });
  var UNDATED = LH_PROGRAMS.filter(function (p) { return !p.opens || !p.closes || p.watch; });

  function inFilter(p) { return catFilter === 'all' || p.cat === catFilter; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* --------------------------------------------------------------- PERIOD */
  // The one place that decides which days the page is talking about. The grid
  // and the list both read from it, which is what keeps them in step.
  function period() {
    if (scope === 'today') return { from: TODAY, to: TODAY, label: 'Today' };
    if (scope === 'week') return { from: TODAY, to: addDays(TODAY, 6), label: 'This week' };
    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    return { from: mk(y, m, 1), to: mk(y, m + 1, 0), label: MONTHS[m] + ' ' + y };
  }

  function overlaps(p, from, to) {
    return day(p.opens) <= to && day(p.closes) >= from;
  }

  // Ends soonest first, then things that have not started. Used by both the
  // grid and the list so the stack of lines and the stack of rows line up.
  function orderKey(p, from) {
    var o = day(p.opens), c = day(p.closes);
    return o >= from ? 100000 + diff(TODAY, o) : diff(TODAY, c);
  }
  function byOrder(from) {
    return function (a, b) { return orderKey(a, from) - orderKey(b, from); };
  }

  /* ================================================================= GRID */
  function weekItems(weekStart, pool, rank) {
    var weekEnd = addDays(weekStart, 6);
    var items = [];

    pool.forEach(function (p) {
      var o = day(p.opens), c = day(p.closes);
      if (c < weekStart || o > weekEnd) return;
      items.push({
        p: p, kind: 'bar',
        start: Math.max(diff(weekStart, o), 0),
        end: Math.min(diff(weekStart, c), 6),
        cutL: o < weekStart, cutR: c > weekEnd,
      });
    });

    LH_PROGRAMS.filter(inFilter).forEach(function (p) {
      (p.keyDates || []).forEach(function (k) {
        var d = day(k.date);
        if (d < weekStart || d > weekEnd) return;
        items.push({ p: p, kind: 'pin', label: k.label, start: diff(weekStart, d), end: diff(weekStart, d) });
      });
    });

    items.sort(function (a, b) {
      if (a.kind !== b.kind) return a.kind === 'bar' ? -1 : 1;
      if (a.kind === 'pin') return a.start - b.start;
      return rank[a.p.id] - rank[b.p.id];
    });

    var lanes = [];
    items.forEach(function (it) {
      var i = 0;
      while (lanes[i] && lanes[i].some(function (o) { return it.start <= o.end && o.start <= it.end; })) i++;
      (lanes[i] = lanes[i] || []).push(it);
      it.lane = i;
    });

    return { items: items, lanes: lanes.length };
  }

  function renderGrid() {
    var host = document.getElementById('weeks');
    host.textContent = '';

    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    document.getElementById('cal-month').textContent = MONTHS[m] + ' ' + y;

    var first = mk(y, m, 1);
    var gridStart = addDays(first, -first.getUTCDay());
    var weeks = Math.ceil((diff(gridStart, mk(y, m + 1, 0)) + 1) / 7);
    var gridEnd = addDays(gridStart, weeks * 7 - 1);

    var pool = DATED.filter(inFilter).filter(function (p) {
      return overlaps(p, gridStart, gridEnd);
    }).sort(byOrder(mk(y, m, 1)));

    var rank = {};
    pool.forEach(function (p, i) { rank[p.id] = i; });

    for (var w = 0; w < weeks; w++) {
      var weekStart = addDays(gridStart, w * 7);
      var packed = weekItems(weekStart, pool, rank);

      var row = el('div', 'week');
      row.style.minHeight = (26 + packed.lanes * 16 + 8) + 'px';

      var days = el('div', 'week-days');
      for (var i = 0; i < 7; i++) {
        var d = addDays(weekStart, i);
        var cell = el('div');
        if (d.getUTCMonth() !== m) cell.classList.add('out');
        if (diff(d, TODAY) === 0) cell.classList.add('today');
        cell.appendChild(el('span', 'dnum', String(d.getUTCDate())));
        days.appendChild(cell);
      }
      row.appendChild(days);

      var overlay = el('div', 'week-events');
      packed.items.forEach(function (it) {
        var b = el('button', 'ev');
        b.type = 'button';
        b.style.gridColumn = (it.start + 1) + ' / ' + (it.end + 2);
        b.style.gridRow = String(it.lane + 1);

        if (it.kind === 'pin') {
          b.classList.add('pin');
          b.setAttribute('aria-label', it.p.name + ': ' + it.label);
          b.title = it.label;
        } else {
          b.style.setProperty('--c', it.p.color);
          if (it.cutL) b.classList.add('cut-l');
          if (it.cutR) b.classList.add('cut-r');
          b.setAttribute('aria-label', it.p.name + ', open ' +
            longDate(day(it.p.opens)) + ' to ' + longDate(day(it.p.closes)));
          b.title = it.p.name + ' · ' + shortDate(day(it.p.opens)) +
                    ' – ' + shortDate(day(it.p.closes));
        }
        b.addEventListener('click', function () { openSheet(it.p); });
        overlay.appendChild(b);
      });
      row.appendChild(overlay);
      host.appendChild(row);
    }

    var n = pool.length;
    document.getElementById('cal-legend').textContent = n
      ? n + ' window' + (n === 1 ? '' : 's') + ' cross ' + MONTHS[m] + '. ' +
        'Each line is one programme — click it for the detail. Rounded end = the real opening or closing day.'
      : 'Nothing is open in ' + MONTHS[m] + ' for this topic.';
  }

  /* ================================================================= LIST */
  function renderList() {
    var host = document.getElementById('list');
    host.textContent = '';

    var per = period();
    var rows = DATED.filter(inFilter)
      .filter(function (p) { return overlaps(p, per.from, per.to); })
      .sort(byOrder(per.from))
      .map(function (p) { return { p: p, o: day(p.opens), c: day(p.closes) }; });

    if (!rows.length) {
      host.appendChild(el('div', 'empty', 'Nothing is open or opening in ' + per.label.toLowerCase() + '.'));
      return;
    }

    var list = el('div', 'list');
    rows.forEach(function (r) {
      var p = r.p;
      var item = el('button', 'item');
      item.type = 'button';
      item.style.setProperty('--c', p.color);

      item.appendChild(el('span', 'item-swatch'));

      var body = el('span', 'item-body');
      var name = el('span', 'item-name');

      var toClose = diff(TODAY, r.c), toOpen = diff(TODAY, r.o);
      var state = toOpen > 0 ? 'soon' : (toClose <= 30 ? 'closing' : 'open');
      name.appendChild(el('span', 'status ' + state,
        state === 'soon' ? 'Not yet' : state === 'closing' ? 'Closing' : 'Open'));
      name.appendChild(document.createTextNode(p.name));
      body.appendChild(name);

      var sub = shortDate(r.o) + ' – ' + shortDate(r.c);
      if (p.precision === 'varies') sub += '  ·  varies by state';
      else if (p.precision === 'typical') sub += '  ·  usual dates';
      body.appendChild(el('span', 'item-sub', sub));
      item.appendChild(body);

      var when = el('span', 'item-when');
      if (toOpen > 0) {
        when.appendChild(el('b', null, 'Opens ' + shortDate(r.o)));
        when.appendChild(document.createTextNode(countdown(toOpen)));
      } else {
        var b = el('b', toClose <= 30 ? 'hot' : null, 'Closes ' + shortDate(r.c));
        when.appendChild(b);
        when.appendChild(document.createTextNode(remaining(toClose)));
      }
      item.appendChild(when);

      item.addEventListener('click', function () { openSheet(p); });
      list.appendChild(item);
    });
    host.appendChild(list);
  }

  /* =============================================================== SCOPES */
  function renderScopes() {
    var host = document.getElementById('scopes');
    host.textContent = '';
    var y = view.getUTCFullYear(), m = view.getUTCMonth();

    [['today', 'Today'], ['week', 'This week'], ['month', MONTHS[m] + ' ' + y]]
      .forEach(function (s) {
        var b = el('button', 'scope', s[1]);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(scope === s[0]));
        b.addEventListener('click', function () {
          scope = s[0];
          // Today and This week always mean the real ones, so jump the grid
          // back if it has been moved away.
          if (s[0] !== 'month') view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
          render();
        });
        host.appendChild(b);
      });
  }

  /* =============================================================== ALWAYS */
  function renderAlways() {
    var host = document.getElementById('always');
    host.textContent = '';
    var list = UNDATED.filter(inFilter);
    if (!list.length) return;

    host.appendChild(el('span', 'eyebrow', 'No season — these take applications any day'));
    var pills = el('div', 'pills');
    list.forEach(function (p) {
      var b = el('button', 'pill');
      b.type = 'button';
      b.style.setProperty('--c', p.color);
      b.appendChild(el('span', 'dot'));
      b.appendChild(document.createTextNode(p.name));
      b.addEventListener('click', function () { openSheet(p); });
      pills.appendChild(b);
    });
    host.appendChild(pills);
  }

  /* ================================================================ CHIPS */
  function renderChips() {
    var host = document.getElementById('filter-cat');
    host.textContent = '';

    function chip(label, key, glyph, colour) {
      var b = el('button', 'chip');
      b.type = 'button';
      if (glyph) b.appendChild(el('span', 'suit suit-' + colour, glyph));
      b.appendChild(document.createTextNode(label));
      b.setAttribute('aria-pressed', String(catFilter === key));
      b.addEventListener('click', function () {
        catFilter = catFilter === key ? 'all' : key;
        render();
      });
      host.appendChild(b);
    }

    chip('Everything', 'all');
    Object.keys(LH_CATEGORIES).forEach(function (k) {
      var c = LH_CATEGORIES[k];
      chip(c.name, k, c.suit, c.color);
    });
  }

  /* ============================================================= THE CARD */
  var sheet = document.getElementById('sheet');
  var sheetCard = document.getElementById('sheet-card');
  var lastFocus = null;

  function openSheet(p) {
    var body = document.getElementById('sheet-body');
    body.textContent = '';
    sheetCard.style.setProperty('--c', p.color);

    var h = el('h3', null, p.name);
    h.id = 'sheet-title';
    body.appendChild(h);
    if (p.alsoCalled) body.appendChild(el('div', 'sheet-also', 'Also called: ' + p.alsoCalled));
    body.appendChild(el('p', 'sheet-what', p.what));

    // The timing box — the reason somebody opened this card.
    var w = el('div', 'sheet-window');
    if (!p.opens || !p.closes) {
      w.appendChild(el('span', 'big', p.watch ? 'No fixed dates' : 'Open all year'));
      w.appendChild(el('span', 'sub', p.cadence));
    } else {
      var o = day(p.opens), c = day(p.closes);
      var toOpen = diff(TODAY, o), toClose = diff(TODAY, c);
      if (toOpen > 0) {
        w.appendChild(el('span', 'big', 'Opens ' + longDate(o) + ' — ' + countdown(toOpen)));
        w.appendChild(el('span', 'sub', 'Runs to ' + longDate(c) + '. ' + p.cadence + '.'));
      } else if (toClose >= 0) {
        w.appendChild(el('span', 'big', 'Open now — ' + remaining(toClose)));
        w.appendChild(el('span', 'sub', 'Closes ' + longDate(c) + '. ' + p.cadence + '.'));
      } else {
        w.appendChild(el('span', 'big', 'Closed ' + longDate(c)));
        w.appendChild(el('span', 'sub', p.cadence + '.'));
      }
      if (p.precision !== 'exact') {
        w.appendChild(el('span', 'sub',
          p.precision === 'varies'
            ? ' Dates differ by state — check yours.'
            : ' These are the usual dates; check yours.'));
      }
    }
    body.appendChild(w);

    (p.keyDates || []).forEach(function (k) {
      if (diff(TODAY, day(k.date)) < 0) return;
      body.appendChild(el('div', 'sheet-flag', shortDate(day(k.date)) + ' — ' + k.label));
    });

    if (p.urgent) body.appendChild(el('div', 'sheet-flag', p.urgent));

    if (p.prep && p.prep.length) {
      body.appendChild(el('div', 'sheet-h', 'What to have ready'));
      var ul = el('ul');
      p.prep.forEach(function (x) { ul.appendChild(el('li', null, x)); });
      body.appendChild(ul);
    }
    if (p.missedIt) {
      body.appendChild(el('div', 'sheet-h', 'If you miss it'));
      body.appendChild(el('p', 'sheet-note', p.missedIt));
    }
    if (p.renewal) {
      body.appendChild(el('div', 'sheet-h', 'Renewing'));
      body.appendChild(el('p', 'sheet-note', p.renewal));
    }
    if (p.caveat) body.appendChild(el('div', 'sheet-caveat', p.caveat));

    if (p.link) {
      var a = el('a', 'sheet-go', 'Go to the official page →');
      a.href = p.link; a.target = '_blank'; a.rel = 'noopener';
      body.appendChild(a);
    }
    body.appendChild(el('div', 'sheet-where', p.where));

    lastFocus = document.activeElement;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    sheetCard.querySelector('.sheet-x').focus();
  }

  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  Array.prototype.forEach.call(sheet.querySelectorAll('[data-close]'), function (n) {
    n.addEventListener('click', closeSheet);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeSheet();
  });

  /* ================================================================== RUN */
  function render() {
    renderChips();
    renderGrid();
    renderScopes();
    renderList();
    renderAlways();
  }

  // Moving the calendar moves the list with it — that is the whole point of
  // the third scope tab carrying the month's name.
  function shift(months) {
    view = mk(view.getUTCFullYear(), view.getUTCMonth() + months, 1);
    scope = 'month';
    render();
  }
  document.getElementById('prev').addEventListener('click', function () { shift(-1); });
  document.getElementById('next').addEventListener('click', function () { shift(1); });
  document.getElementById('prev-year').addEventListener('click', function () { shift(-12); });
  document.getElementById('next-year').addEventListener('click', function () { shift(12); });
  document.getElementById('jump-today').addEventListener('click', function () {
    view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
    scope = 'today';
    render();
  });

  render();
})();
