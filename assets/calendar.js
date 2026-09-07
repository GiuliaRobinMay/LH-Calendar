/* ============================================================================
   Lesko Help — The Help Calendar

   A real month grid. Windows run across the days they are open, the way a
   multi-day event does in any calendar app. Everything is derived from today's
   date, so nobody has to edit the page when the month turns over.

   Append ?date=YYYY-MM-DD to preview another day.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- DAY MATH */
  // Parsed at UTC noon so adding days never trips over a daylight-saving
  // boundary and lands on the wrong calendar square.
  function day(iso) {
    var p = iso.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
  }
  function mk(y, m, d) { return new Date(Date.UTC(y, m, d, 12)); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function diff(a, b) { return Math.round((b - a) / 86400000); }
  function iso(d) {
    return d.getUTCFullYear() + '-' +
           String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
           String(d.getUTCDate()).padStart(2, '0');
  }

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function longDate(d) { return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }
  function shortDate(d) { return MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  function shortYear(d) { return MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }

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

  var q = new URLSearchParams(location.search).get('date');
  var TODAY = q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? day(q) : (function () {
    var n = new Date();
    return mk(n.getFullYear(), n.getMonth(), n.getDate());
  })();

  /* ---------------------------------------------------------------- STATE */
  var view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1); // month on screen
  var selected = TODAY;
  var catFilter = 'all';

  // Only programmes with a real window belong on a grid. The ones with no
  // season at all would otherwise paint a bar across every square of every
  // month and drown the things that actually have a date.
  var DATED = LH_PROGRAMS.filter(function (p) { return p.opens && p.closes && !p.watch; });
  var UNDATED = LH_PROGRAMS.filter(function (p) { return !p.opens || !p.closes || p.watch; });

  function inFilter(p) { return catFilter === 'all' || p.cat === catFilter; }
  function colourVar(p) { return 'var(--' + LH_CATEGORIES[p.cat].color + ')'; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function suit(p) {
    var c = LH_CATEGORIES[p.cat];
    return el('span', 'suit suit-' + c.color, c.suit);
  }

  /* -------------------------------------------------------------- STATUS */
  function statusOf(p, on) {
    if (p.watch) return 'watch';
    if (!p.opens || !p.closes) return 'always';
    var o = day(p.opens), c = day(p.closes);
    if (on < o) return 'soon';
    if (on > c) return 'closed';
    return diff(on, c) <= 30 ? 'closing' : 'open';
  }

  /* ================================================================= GRID */
  // One row of the grid holds every window overlapping that week. Bars are
  // packed into lanes so two that overlap never sit on the same line.
  function weekItems(weekStart, eventful) {
    var weekEnd = addDays(weekStart, 6);
    var items = [];

    eventful.forEach(function (p) {
      var o = day(p.opens), c = day(p.closes);
      if (c < weekStart || o > weekEnd) return;
      items.push({
        p: p, kind: 'bar',
        start: Math.max(diff(weekStart, o), 0),
        end: Math.min(diff(weekStart, c), 6),
        cutL: o < weekStart, cutR: c > weekEnd,
      });
    });

    // Key dates are one-day markers inside a window — the ACA cutoff for
    // January coverage, the date EITC refunds can first be paid.
    LH_PROGRAMS.filter(inFilter).forEach(function (p) {
      (p.keyDates || []).forEach(function (k) {
        var d = day(k.date);
        if (d < weekStart || d > weekEnd) return;
        var col = diff(weekStart, d);
        items.push({ p: p, kind: 'pin', label: k.label, start: col, end: col });
      });
    });

    // Longest first, so the bars that span the week settle into the top lanes
    // and the grid reads as bands rather than confetti.
    items.sort(function (a, b) {
      if (a.kind !== b.kind) return a.kind === 'bar' ? -1 : 1;
      var la = a.end - a.start, lb = b.end - b.start;
      return lb - la || a.start - b.start;
    });

    var lanes = [];
    items.forEach(function (it) {
      var i = 0;
      while (lanes[i] && lanes[i].some(function (o) {
        return it.start <= o.end && o.start <= it.end;
      })) i++;
      lanes[i] = lanes[i] || [];
      lanes[i].push(it);
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
    var lastOfMonth = mk(y, m + 1, 0);
    var weeks = Math.ceil((diff(gridStart, lastOfMonth) + 1) / 7);

    var gridEnd = addDays(gridStart, weeks * 7 - 1);

    // A window running clean through the whole visible grid has no edge to
    // draw. Repeating its bar on all six week rows turns the month into a wall
    // of stripes, so those go in a band above the grid instead and only
    // windows that actually open or close in view get a bar.
    var eventful = [], running = [];
    DATED.filter(inFilter).forEach(function (p) {
      var o = day(p.opens), c = day(p.closes);
      if (c < gridStart || o > gridEnd) return;
      if (o >= gridStart || c <= gridEnd) eventful.push(p);
      else running.push(p);
    });
    renderRunning(running);

    for (var w = 0; w < weeks; w++) {
      var weekStart = addDays(gridStart, w * 7);
      var packed = weekItems(weekStart, eventful);

      var row = el('div', 'week');
      row.style.minHeight = (28 + packed.lanes * 22 + 8) + 'px';

      // Day squares
      var days = el('div', 'week-days');
      for (var i = 0; i < 7; i++) {
        var d = addDays(weekStart, i);
        var cell = el('div');
        if (d.getUTCMonth() !== m) cell.classList.add('out');
        if (diff(d, TODAY) === 0) cell.classList.add('today');
        if (diff(d, selected) === 0) cell.classList.add('sel');
        cell.appendChild(el('span', 'dnum', String(d.getUTCDate())));
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', longDate(d));
        (function (dd) {
          function pick() { selected = dd; render(); }
          cell.addEventListener('click', pick);
          cell.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
          });
        })(d);
        days.appendChild(cell);
      }
      row.appendChild(days);

      // Bars on top
      var overlay = el('div', 'week-events');
      packed.items.forEach(function (it) {
        var b = el('button', 'ev');
        b.type = 'button';
        b.style.gridColumn = (it.start + 1) + ' / ' + (it.end + 2);
        b.style.gridRow = String(it.lane + 1);

        if (it.kind === 'pin') {
          b.classList.add('pin');
          b.textContent = '◆ ' + it.p.name;
          b.title = it.label;
        } else {
          b.style.setProperty('--c', colourVar(it.p));
          if (LH_CATEGORIES[it.p.cat].color === 'gold') b.classList.add('gold');
          if (it.p.precision !== 'exact') b.classList.add('approx');
          if (it.cutL) b.classList.add('cut-l');
          if (it.cutR) b.classList.add('cut-r');
          b.textContent = it.p.name;
          b.title = it.p.name + ' · ' + longDate(day(it.p.opens)) +
                    ' to ' + longDate(day(it.p.closes));
        }

        (function (dd) {
          b.addEventListener('click', function (e) { e.stopPropagation(); selected = dd; render(); });
        })(addDays(weekStart, it.start));
        overlay.appendChild(b);
      });
      row.appendChild(overlay);

      host.appendChild(row);
    }
  }

  function renderRunning(list) {
    var box = document.getElementById('running');
    box.textContent = '';
    if (!list.length) { box.hidden = true; return; }
    box.hidden = false;

    box.appendChild(el('span', 'eyebrow', 'Open all month'));
    var pills = el('div', 'pills');
    list.forEach(function (p) {
      var b = el('button', 'pill');
      b.type = 'button';
      b.appendChild(suit(p));
      b.appendChild(document.createTextNode(p.name));
      b.title = p.name + ' \u00b7 open ' + longDate(day(p.opens)) +
                ' to ' + longDate(day(p.closes));
      b.addEventListener('click', function () { selected = TODAY; render(); });
      pills.appendChild(b);
    });
    box.appendChild(pills);
  }

  /* ============================================================ DAY PANEL */
  function renderDay() {
    var box = document.getElementById('day-panel');
    box.textContent = '';
    box.appendChild(el('span', 'eyebrow',
      diff(selected, TODAY) === 0 ? 'Today' : 'Selected day'));
    box.appendChild(el('h3', null, longDate(selected)));

    var rows = el('div', 'rows');
    var any = false;

    DATED.filter(inFilter).forEach(function (p) {
      var o = day(p.opens), c = day(p.closes);
      if (selected < o || selected > c) return;
      any = true;

      var r = el('div', 'row');
      r.appendChild(suit(p));
      var body = el('div');
      body.appendChild(el('div', 'row-name', p.name));

      var meta = el('div', 'row-meta');
      var isOpenDay = diff(selected, o) === 0;
      var isCloseDay = diff(selected, c) === 0;
      var left = diff(selected, c);

      if (isOpenDay) meta.appendChild(el('b', null, 'OPENS TODAY'));
      else if (isCloseDay) meta.appendChild(el('b', 'hot', 'LAST DAY'));
      else {
        var t = el('span', left <= 30 ? 'hot' : null, 'Open · ' + remaining(left));
        meta.appendChild(t);
      }
      if (p.precision !== 'exact') {
        meta.appendChild(document.createTextNode(
          p.precision === 'varies' ? ' · varies by state' : ' · usual dates'));
      }
      body.appendChild(meta);

      // The shout is reserved for rows where it changes what you do today.
      if (p.urgent && (isOpenDay || isCloseDay || left <= 45))
        body.appendChild(el('div', 'flag', p.urgent));

      if (p.link) {
        var a = el('a', null, p.where + ' →');
        a.href = p.link; a.target = '_blank'; a.rel = 'noopener';
        var wrap = el('div'); wrap.style.marginTop = '5px';
        wrap.appendChild(a); body.appendChild(wrap);
      }
      r.appendChild(body);
      rows.appendChild(r);
    });

    LH_PROGRAMS.filter(inFilter).forEach(function (p) {
      (p.keyDates || []).forEach(function (k) {
        if (diff(selected, day(k.date)) !== 0) return;
        any = true;
        var r = el('div', 'row');
        r.appendChild(suit(p));
        var body = el('div');
        body.appendChild(el('div', 'row-name', p.name));
        body.appendChild(el('div', 'flag', k.label));
        r.appendChild(body);
        rows.appendChild(r);
      });
    });

    box.appendChild(any ? rows : el('div', 'empty', 'No window opens or closes on this day.'));
  }

  /* ============================================================== UPCOMING */
  // What actually needs doing, soonest first: anything closing inside 45 days
  // and anything opening inside 60.
  function renderUpcoming() {
    var box = document.getElementById('upcoming');
    box.textContent = '';
    box.appendChild(el('span', 'eyebrow', 'What is coming up'));

    var events = [];
    DATED.filter(inFilter).forEach(function (p) {
      var o = day(p.opens), c = day(p.closes);
      var toOpen = diff(TODAY, o), toClose = diff(TODAY, c);
      if (toOpen > 0 && toOpen <= 60) events.push({ p: p, d: toOpen, type: 'opens', on: o });
      else if (toOpen <= 0 && toClose >= 0 && toClose <= 45) events.push({ p: p, d: toClose, type: 'closes', on: c });
    });
    events.sort(function (a, b) { return a.d - b.d; });

    if (!events.length) {
      box.appendChild(el('div', 'empty', 'Nothing opens or closes in the next few weeks.'));
      return;
    }

    var rows = el('div', 'rows');
    events.slice(0, 8).forEach(function (e) {
      var r = el('div', 'row');
      r.appendChild(suit(e.p));
      var body = el('div');
      body.appendChild(el('div', 'row-name', e.p.name));
      var meta = el('div', 'row-meta');
      var verb = e.type === 'closes' ? 'Closes ' : 'Opens ';
      meta.appendChild(el('span', e.type === 'closes' ? 'hot' : null,
        verb + shortDate(e.on) + ' · ' + countdown(e.d)));
      body.appendChild(meta);
      r.appendChild(body);
      (function (on) {
        r.style.cursor = 'pointer';
        r.addEventListener('click', function () {
          selected = on;
          view = mk(on.getUTCFullYear(), on.getUTCMonth(), 1);
          render();
        });
      })(e.on);
      rows.appendChild(r);
    });
    box.appendChild(rows);
  }

  /* ================================================================ ALWAYS */
  function renderAlways() {
    var box = document.getElementById('always');
    box.textContent = '';
    box.appendChild(el('span', 'eyebrow', 'No season — apply any day'));

    var list = UNDATED.filter(inFilter);
    if (!list.length) { box.appendChild(el('div', 'empty', 'Nothing in this topic.')); return; }

    var pills = el('div', 'pills');
    list.forEach(function (p) {
      var a = el('a', 'pill');
      a.href = p.link || '#';
      if (p.link) { a.target = '_blank'; a.rel = 'noopener'; }
      a.style.textDecoration = 'none';
      a.appendChild(suit(p));
      a.appendChild(document.createTextNode(p.name));
      a.title = p.what;
      pills.appendChild(a);
    });
    box.appendChild(pills);
  }

  /* ================================================================ CHIPS */
  function renderChips() {
    var row = document.getElementById('filter-cat');
    row.textContent = '';

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
      row.appendChild(b);
    }

    chip('All', 'all');
    Object.keys(LH_CATEGORIES).forEach(function (k) {
      var c = LH_CATEGORIES[k];
      chip(c.name.split(' ')[0], k, c.suit, c.color);
    });
  }

  /* ================================================================== RUN */
  function render() {
    renderChips();
    renderGrid();
    renderDay();
    renderUpcoming();
    renderAlways();
  }

  document.getElementById('prev').addEventListener('click', function () {
    view = mk(view.getUTCFullYear(), view.getUTCMonth() - 1, 1);
    render();
  });
  document.getElementById('next').addEventListener('click', function () {
    view = mk(view.getUTCFullYear(), view.getUTCMonth() + 1, 1);
    render();
  });
  document.getElementById('jump-today').addEventListener('click', function () {
    view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
    selected = TODAY;
    render();
  });

  render();
})();
