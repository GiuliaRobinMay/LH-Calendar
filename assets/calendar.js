/* ============================================================================
   Lesko Help — The Help Calendar

   A planning tool, not a directory. It answers timing questions: is this open
   now, am I about to miss a deadline, when can I start.

   Two views. The month grid draws each window as a labelled line across the
   days it is open. Clicking the month name opens the whole year at once.
   Either way the list underneath covers the same period, so moving the
   calendar to October makes the list October.

   Everything is derived from today's date — nothing needs editing as the
   months roll over. Append ?date=YYYY-MM-DD to preview another day.
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
  var mode = 'month';      // month | year
  var scope = 'today';     // today | week | month
  var catFilter = 'all';   // a key of LH_TOPICS, or 'all'

  // Only programmes with a real window go on the grid. The ones with no season
  // would paint a line across every square of every month and say nothing.
  var DATED = LH_PROGRAMS.filter(function (p) { return p.opens && p.closes && !p.watch; });
  var UNDATED = LH_PROGRAMS.filter(function (p) { return !p.opens || !p.closes || p.watch; });

  function inFilter(p) { return catFilter === 'all' || p.topic === catFilter; }
  function topicOf(p) { return LH_TOPICS[p.topic] || LH_TOPICS['no-season']; }
  function colourOf(p) { return topicOf(p).color; }

  // Only four line colours exist, but gold needs ink and blue needs white, so
  // the label colour is worked out from the real contrast ratio against each
  // rather than guessed from a lightness threshold.
  function luminance(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  var INK = '#12213F', INK_L = luminance(INK);
  function readableOn(hex) {
    var bg = luminance(hex);
    return (bg + 0.05) / (INK_L + 0.05) >= 1.05 / (bg + 0.05) ? INK : '#FFFFFF';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* -------------------------------------------------------------- STATUS */
  // Three states, and they are the whole point of the page: you can act now,
  // you are about to lose your chance, or you have time to get ready.
  var OPENING_SOON = 60, CLOSING_SOON = 30;

  function statusOf(p, on) {
    var o = day(p.opens), c = day(p.closes);
    if (on < o) return diff(on, o) <= OPENING_SOON ? 'opening' : 'later';
    if (on > c) return 'closed';
    return diff(on, c) <= CLOSING_SOON ? 'closing' : 'open';
  }
  var STATUS_LABEL = {
    open: 'Open', closing: 'Closing soon', opening: 'Opening soon',
    later: 'Not yet', closed: 'Closed',
  };

  /* -------------------------------------------------------------- PERIOD */
  function period() {
    if (scope === 'today') return { from: TODAY, to: TODAY, label: 'today' };
    if (scope === 'week') return { from: TODAY, to: addDays(TODAY, 6), label: 'the next 7 days' };
    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    if (mode === 'year') return { from: mk(y, 0, 1), to: mk(y, 11, 31), label: String(y) };
    return { from: mk(y, m, 1), to: mk(y, m + 1, 0), label: MONTHS[m] + ' ' + y };
  }

  function overlaps(p, from, to) {
    return day(p.opens) <= to && day(p.closes) >= from;
  }

  // Ends soonest first, then things that have not started. Used by the grid and
  // the list alike so the stack of lines and the stack of rows line up.
  function orderKey(p, from) {
    var o = day(p.opens), c = day(p.closes);
    return o >= from ? 100000 + diff(TODAY, o) : diff(TODAY, c);
  }
  function byOrder(from) {
    return function (a, b) { return orderKey(a, from) - orderKey(b, from); };
  }

  function activeIn(from, to) {
    return DATED.filter(inFilter)
      .filter(function (p) { return overlaps(p, from, to); })
      .sort(byOrder(from));
  }

  /* ============================================================ MONTH GRID */
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
        items.push({ p: p, kind: 'pin', label: k.label,
                     start: diff(weekStart, d), end: diff(weekStart, d) });
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

  function renderMonth(host) {
    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    var first = mk(y, m, 1);
    var gridStart = addDays(first, -first.getUTCDay());
    var weeks = Math.ceil((diff(gridStart, mk(y, m + 1, 0)) + 1) / 7);
    var gridEnd = addDays(gridStart, weeks * 7 - 1);

    var head = el('div', 'weekdays');
    head.setAttribute('aria-hidden', 'true');
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(function (d) {
      head.appendChild(el('div', null, d));
    });
    host.appendChild(head);

    var pool = activeIn(gridStart, gridEnd);
    var rank = {};
    pool.forEach(function (p, i) { rank[p.id] = i; });

    for (var w = 0; w < weeks; w++) {
      var weekStart = addDays(gridStart, w * 7);
      var packed = weekItems(weekStart, pool, rank);

      var row = el('div', 'week');
      row.style.minHeight = (26 + packed.lanes * 21 + 8) + 'px';

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
          var col = colourOf(it.p);
          b.style.setProperty('--c', col);
          b.style.setProperty('--ct', readableOn(col));
          b.textContent = it.p.name;
          if (it.cutL) b.classList.add('cut-l');
          if (it.cutR) b.classList.add('cut-r');
          b.setAttribute('aria-label', it.p.name + ', ' +
            STATUS_LABEL[statusOf(it.p, TODAY)].toLowerCase() + ', ' +
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
    setLegend(n
      ? n + ' window' + (n === 1 ? '' : 's') + ' cross ' + MONTHS[m] +
        '. Click any line for the detail. A rounded end is the real opening or closing day.'
      : 'Nothing is open in ' + MONTHS[m] + ' for this domain.');
  }

  /* ============================================================= YEAR VIEW */
  // Twelve months at once, each showing the windows that touch it as a stack
  // of short bars. This is the "when in the year does this happen" view.
  function renderYear(host) {
    var y = view.getUTCFullYear();
    var grid = el('div', 'yeargrid');

    for (var m = 0; m < 12; m++) {
      (function (m) {
        var from = mk(y, m, 1), to = mk(y, m + 1, 0);
        var active = activeIn(from, to);

        var card = el('button', 'ycard');
        card.type = 'button';
        if (y === TODAY.getUTCFullYear() && m === TODAY.getUTCMonth()) card.classList.add('is-now');

        var top = el('div', 'ycard-top');
        top.appendChild(el('span', 'ycard-name', MONTHS[m]));
        top.appendChild(el('span', 'ycard-n', active.length ? String(active.length) : '—'));
        card.appendChild(top);

        var bars = el('div', 'ybars');
        active.slice(0, 7).forEach(function (p) {
          var o = day(p.opens), c = day(p.closes);
          var bar = el('div', 'ybar');
          bar.style.setProperty('--c', colourOf(p));
          bar.style.setProperty('--ct', readableOn(colourOf(p)));
          bar.textContent = p.name;
          // Square off the end that runs past this month, so a bar that
          // starts or finishes here reads differently from one passing through.
          if (o < from) bar.classList.add('cut-l');
          if (c > to) bar.classList.add('cut-r');
          bars.appendChild(bar);
        });
        if (active.length > 7) bars.appendChild(el('div', 'ymore', '+' + (active.length - 7) + ' more'));
        card.appendChild(bars);

        card.addEventListener('click', function () {
          view = mk(y, m, 1);
          mode = 'month';
          scope = 'month';
          render();
        });
        grid.appendChild(card);
      })(m);
    }

    host.appendChild(grid);
    var total = activeIn(mk(y, 0, 1), mk(y, 11, 31)).length;
    setLegend(total + ' window' + (total === 1 ? '' : 's') + ' fall in ' + y +
              '. Click a month to open it.');
  }

  function setLegend(text) {
    document.getElementById('cal-legend').textContent = text;
  }

  /* ================================================================= LIST */
  function renderList() {
    var host = document.getElementById('list');
    host.textContent = '';

    var per = period();
    var rows = activeIn(per.from, per.to);

    // Anything opening just beyond the period is worth surfacing too — being
    // told to get ready is the whole reason to look at this in advance.
    var ahead = DATED.filter(inFilter).filter(function (p) {
      if (overlaps(p, per.from, per.to)) return false;
      var d = diff(per.to, day(p.opens));
      return d > 0 && d <= OPENING_SOON;
    }).sort(byOrder(per.to));

    if (!rows.length && !ahead.length) {
      host.appendChild(el('div', 'empty', 'Nothing is open or opening in ' + per.label + '.'));
      return;
    }

    var list = el('div', 'list');
    rows.concat(ahead).forEach(function (p) {
      var o = day(p.opens), c = day(p.closes);
      var st = statusOf(p, TODAY);

      var item = el('button', 'item');
      item.type = 'button';
      item.style.setProperty('--c', colourOf(p));

      item.appendChild(el('span', 'item-swatch'));

      var body = el('span', 'item-body');
      var name = el('span', 'item-name');
      name.appendChild(el('span', 'status ' + st, STATUS_LABEL[st]));
      name.appendChild(document.createTextNode(p.name));
      body.appendChild(name);

      // What it is comes before the dates — the dates mean nothing if you do
      // not know what you are looking at.
      body.appendChild(el('span', 'item-what', p.short || p.what));

      var sub = topicOf(p).name + '  ·  ' + shortDate(o) + ' – ' + shortDate(c);
      if (p.precision === 'varies') sub += '  ·  varies by state';
      else if (p.precision === 'typical') sub += '  ·  usual dates';
      body.appendChild(el('span', 'item-sub', sub));
      item.appendChild(body);

      var when = el('span', 'item-when');
      var toOpen = diff(TODAY, o), toClose = diff(TODAY, c);
      if (toOpen > 0) {
        when.appendChild(el('b', st === 'opening' ? 'soon' : null, 'Opens ' + shortDate(o)));
        when.appendChild(document.createTextNode(countdown(toOpen)));
      } else {
        when.appendChild(el('b', st === 'closing' ? 'hot' : null, 'Closes ' + shortDate(c)));
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
    var thisMonth = y === TODAY.getUTCFullYear() && m === TODAY.getUTCMonth();
    // Reads "This month" while you are on it, and names the month once you
    // have navigated away, so the link to the calendar stays obvious.
    var third = mode === 'year' ? String(y)
              : thisMonth ? 'This month'
              : MONTHS[m] + ' ' + y;

    [['today', 'Today'], ['week', 'This week'], ['month', third]].forEach(function (s) {
      var b = el('button', 'scope', s[1]);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(scope === s[0]));
      b.addEventListener('click', function () {
        scope = s[0];
        // Today and This week always mean the real ones, so bring the
        // calendar back if it has been moved away.
        if (s[0] !== 'month') {
          view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
          mode = 'month';
        }
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
      b.style.setProperty('--c', colourOf(p));
      b.appendChild(el('span', 'dot'));
      b.appendChild(document.createTextNode(p.name));
      b.addEventListener('click', function () { openSheet(p); });
      pills.appendChild(b);
    });
    host.appendChild(pills);
  }

  /* ============================================================= DROPDOWN */
  function renderTopics() {
    var sel = document.getElementById('topic');
    var keys = Object.keys(LH_TOPICS).filter(function (k) { return !LH_TOPICS[k].hidden; });

    if (!sel.options.length) {
      var all = document.createElement('option');
      all.value = 'all';
      all.textContent = 'Every seasonal domain';
      sel.appendChild(all);
      keys.forEach(function (k) {
        var o = document.createElement('option');
        o.value = k;
        o.textContent = LH_TOPICS[k].suit + '  ' + LH_TOPICS[k].name;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () { catFilter = sel.value; render(); });
    }
    sel.value = catFilter;

    var n = DATED.filter(inFilter).length;
    document.getElementById('topic-count').textContent =
      n + ' programme' + (n === 1 ? '' : 's') + ' with a season';

    var note = document.getElementById('topic-note');
    if (catFilter === 'all') {
      note.textContent = 'Only domains where the timing can cost you the money are listed. ' +
        'Anything you can apply for on any day of the year is below the calendar instead.';
      note.style.setProperty('--c', 'var(--rule-strong)');
    } else {
      note.textContent = LH_TOPICS[catFilter].note;
      note.style.setProperty('--c', LH_TOPICS[catFilter].color);
    }
  }

  /* ============================================================= THE CARD */
  var sheet = document.getElementById('sheet');
  var sheetCard = document.getElementById('sheet-card');
  var lastFocus = null;

  function openSheet(p) {
    var body = document.getElementById('sheet-body');
    body.textContent = '';
    sheetCard.style.setProperty('--c', colourOf(p));

    var h = el('h3', null, p.name);
    h.id = 'sheet-title';
    body.appendChild(h);

    var tp = topicOf(p);
    if (!tp.hidden) {
      var tag = el('div', 'sheet-topic');
      tag.style.setProperty('--c', tp.color);
      tag.appendChild(el('span', 'dot'));
      tag.appendChild(document.createTextNode(tp.name));
      body.appendChild(tag);
    }
    if (p.alsoCalled) body.appendChild(el('div', 'sheet-also', 'Also called: ' + p.alsoCalled));
    body.appendChild(el('p', 'sheet-what', p.what));

    // The timing box — the reason somebody opened this card at all.
    var w = el('div', 'sheet-window');
    if (!p.opens || !p.closes) {
      w.appendChild(el('span', 'big', p.watch ? 'No fixed dates' : 'Open all year'));
      w.appendChild(el('span', 'sub', p.cadence));
    } else {
      var o = day(p.opens), c = day(p.closes);
      var st = statusOf(p, TODAY);
      var chip = el('span', 'status ' + st, STATUS_LABEL[st]);
      w.appendChild(chip);

      if (st === 'open' || st === 'closing') {
        w.appendChild(el('span', 'big', remaining(diff(TODAY, c))));
        w.appendChild(el('span', 'sub', 'Closes ' + longDate(c) + '. ' + p.cadence + '.'));
      } else if (st === 'closed') {
        w.appendChild(el('span', 'big', 'Closed ' + longDate(c)));
        w.appendChild(el('span', 'sub', p.cadence + '.'));
      } else {
        w.appendChild(el('span', 'big', 'Opens ' + longDate(o) + ' — ' + countdown(diff(TODAY, o))));
        w.appendChild(el('span', 'sub', 'Runs to ' + longDate(c) + '. ' + p.cadence + '.'));
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
    renderTopics();

    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    var title = document.getElementById('cal-title');
    title.textContent = mode === 'year' ? String(y) : MONTHS[m] + ' ' + y;
    title.setAttribute('aria-label',
      mode === 'year' ? 'Showing ' + y + '. Back to the month view.'
                      : 'Showing ' + MONTHS[m] + ' ' + y + '. See the whole year.');
    document.getElementById('cal').classList.toggle('is-year', mode === 'year');

    var host = document.getElementById('cal-body');
    host.textContent = '';
    if (mode === 'year') renderYear(host); else renderMonth(host);

    renderScopes();
    renderList();
    renderAlways();
  }

  // One month at a time in the month view, one year at a time in the year
  // view — the arrows always step by whatever is on screen.
  function step(n) {
    view = mode === 'year'
      ? mk(view.getUTCFullYear() + n, 0, 1)
      : mk(view.getUTCFullYear(), view.getUTCMonth() + n, 1);
    scope = 'month';
    render();
  }
  document.getElementById('prev').addEventListener('click', function () { step(-1); });
  document.getElementById('next').addEventListener('click', function () { step(1); });

  document.getElementById('cal-title').addEventListener('click', function () {
    mode = mode === 'year' ? 'month' : 'year';
    scope = 'month';
    render();
  });

  document.getElementById('jump-today').addEventListener('click', function () {
    view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
    mode = 'month';
    scope = 'today';
    render();
  });

  render();
})();
