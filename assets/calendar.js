/* ============================================================================
   Lesko Help — Grant Strategy Calendar

   The Fund-Nation grant year as a working calendar. Seasons are stored as
   recurring month bands (the source works in whole months and says "rinse and
   repeat, every year"), so they are generated for whichever year is on screen
   rather than pinned to 2026.

   It opens on the whole year, which is the view that answers "when does what
   happen". Click a month — or step through with the arrows — for the month
   grid, that month's page from the PDF, and the seasons in detail.

   Append ?date=YYYY-MM-DD to preview another day.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- DAY MATH */
  // Parsed at UTC noon so adding days never trips over a daylight-saving
  // boundary and lands on the wrong calendar square.
  function mk(y, m, d) { return new Date(Date.UTC(y, m, d, 12)); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function diff(a, b) { return Math.round((b - a) / 86400000); }
  function lastDay(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }

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
  var TODAY = (function () {
    if (qs && /^\d{4}-\d{2}-\d{2}$/.test(qs)) {
      var p = qs.split('-');
      return mk(+p[0], +p[1] - 1, +p[2]);
    }
    var n = new Date();
    return mk(n.getFullYear(), n.getMonth(), n.getDate());
  })();

  // Giving Tuesday is the Tuesday after Thanksgiving, and Thanksgiving is the
  // fourth Thursday in November — so it moves every year and has to be worked
  // out rather than stored.
  function givingTuesday(year) {
    var d = mk(year, 10, 1), thursdays = 0;
    while (true) {
      if (d.getUTCDay() === 4 && ++thursdays === 4) break;
      d = addDays(d, 1);
    }
    return addDays(d, 5);
  }

  /* ---------------------------------------------------------------- STATE */
  var view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
  var mode = 'year';       // year | month — the year is the way in
  var scope = 'month';     // today | week | month ("month" = whatever is shown)
  var funderFilter = 'all';

  function inFilter(s) { return funderFilter === 'all' || s.funder === funderFilter; }
  function funderOf(s) { return LH_FUNDERS[s.funder]; }
  function colourOf(s) { return funderOf(s).color; }

  // Only four line colours exist, but gold needs ink and blue needs white, so
  // the label colour comes from the real contrast ratio against each.
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

  /* ------------------------------------------------------------- INSTANCES */
  // A season is a month band, not a date range. Turn it into real dates for a
  // given year — and for a band that wraps New Year, the run that started the
  // year before is still open in January, so generate that one too.
  function instancesFor(season, year) {
    var out = [];
    [year - 1, year, year + 1].forEach(function (y) {
      var from = mk(y, season.fromM, Math.min(season.fromD, lastDay(y, season.fromM)));
      var endYear = season.wraps ? y + 1 : y;
      var to = mk(endYear, season.toM, Math.min(season.toD, lastDay(endYear, season.toM)));
      out.push({ s: season, from: from, to: to });
    });
    return out;
  }

  function instancesIn(from, to) {
    var year = from.getUTCFullYear();
    var out = [];
    LH_SEASONS.filter(inFilter).forEach(function (s) {
      instancesFor(s, year).forEach(function (inst) {
        if (inst.from <= to && inst.to >= from) out.push(inst);
      });
    });
    // De-duplicate: the three generated years can overlap on a wrapping band.
    var seen = {};
    out = out.filter(function (i) {
      var k = i.s.id + '|' + i.from.getTime();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
    return out.sort(byOrder(from));
  }

  /* -------------------------------------------------------------- STATUS */
  var OPENING_SOON = 60, CLOSING_SOON = 30;

  function statusOf(inst, on) {
    if (on < inst.from) return diff(on, inst.from) <= OPENING_SOON ? 'opening' : 'later';
    if (on > inst.to) return 'closed';
    return diff(on, inst.to) <= CLOSING_SOON ? 'closing' : 'open';
  }
  var STATUS_LABEL = {
    open: 'Open', closing: 'Closing soon', opening: 'Opening soon',
    later: 'Not yet', closed: 'Finished',
  };

  // Seasons repeat, so one that has ended is not gone — it comes back. Find
  // the next run, which is what a closed row should actually be telling you.
  function nextRun(season, after) {
    var year = after.getUTCFullYear();
    var runs = instancesFor(season, year).concat(instancesFor(season, year + 1));
    runs.sort(function (a, b) { return a.from - b.from; });
    for (var i = 0; i < runs.length; i++) if (runs[i].from > after) return runs[i];
    return null;
  }

  // What needs attention sorts above what does not: closing, then open, then
  // opening soon, then later, then already finished.
  var STATUS_RANK = { closing: 0, open: 1, opening: 2, later: 3, closed: 4 };
  function byOrder(from) {
    return function (a, b) {
      var ra = STATUS_RANK[statusOf(a, TODAY)], rb = STATUS_RANK[statusOf(b, TODAY)];
      if (ra !== rb) return ra - rb;
      // Within a rank, soonest first — by end date if running, else by start.
      var ka = ra <= 1 ? diff(TODAY, a.to) : diff(TODAY, a.from);
      var kb = rb <= 1 ? diff(TODAY, b.to) : diff(TODAY, b.from);
      return ka - kb;
    };
  }

  /* -------------------------------------------------------------- PERIOD */
  function period() {
    if (scope === 'today') return { from: TODAY, to: TODAY, label: 'today' };
    if (scope === 'week') return { from: TODAY, to: addDays(TODAY, 6), label: 'the next 7 days' };
    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    if (mode === 'year') return { from: mk(y, 0, 1), to: mk(y, 11, 31), label: String(y) };
    return { from: mk(y, m, 1), to: mk(y, m + 1, 0), label: MONTHS[m] + ' ' + y };
  }

  /* ============================================================ MONTH GRID */
  function weekItems(weekStart, pool, rank) {
    var weekEnd = addDays(weekStart, 6);
    var items = [];

    pool.forEach(function (inst) {
      if (inst.to < weekStart || inst.from > weekEnd) return;
      items.push({
        inst: inst, kind: 'bar',
        start: Math.max(diff(weekStart, inst.from), 0),
        end: Math.min(diff(weekStart, inst.to), 6),
        cutL: inst.from < weekStart, cutR: inst.to > weekEnd,
      });
    });

    // Giving Tuesday is the one exact date in the whole source.
    var gt = givingTuesday(weekStart.getUTCFullYear());
    if (gt >= weekStart && gt <= weekEnd &&
        (funderFilter === 'all' || funderFilter === 'campaign')) {
      items.push({ kind: 'pin', label: 'Giving Tuesday',
                   start: diff(weekStart, gt), end: diff(weekStart, gt) });
    }

    items.sort(function (a, b) {
      if (a.kind !== b.kind) return a.kind === 'bar' ? -1 : 1;
      if (a.kind === 'pin') return a.start - b.start;
      return rank[a.inst.s.id] - rank[b.inst.s.id];
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

    var pool = instancesIn(gridStart, gridEnd);
    var rank = {};
    pool.forEach(function (inst, i) { rank[inst.s.id] = i; });

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
          b.textContent = it.label;
          b.title = it.label;
          b.setAttribute('aria-label', it.label);
        } else {
          var col = colourOf(it.inst.s);
          b.style.setProperty('--c', col);
          b.style.setProperty('--ct', readableOn(col));
          b.textContent = it.inst.s.name;
          if (it.cutL) b.classList.add('cut-l');
          if (it.cutR) b.classList.add('cut-r');
          b.title = it.inst.s.name + ' · ' + shortDate(it.inst.from) + ' – ' + shortDate(it.inst.to);
          b.setAttribute('aria-label', it.inst.s.name + ', ' +
            STATUS_LABEL[statusOf(it.inst, TODAY)].toLowerCase());
          b.addEventListener('click', function () { openSheet(it.inst); });
        }
        overlay.appendChild(b);
      });
      row.appendChild(overlay);
      host.appendChild(row);
    }

    var n = pool.length;
    setLegend(n + ' season' + (n === 1 ? '' : 's') + ' cross ' + MONTHS[m] +
              '. Click any line for what it needs. A rounded end is where the season starts or finishes.');
  }

  /* ============================================================= YEAR VIEW */
  function renderYear(host) {
    var y = view.getUTCFullYear();
    var grid = el('div', 'yeargrid');

    for (var m = 0; m < 12; m++) {
      (function (m) {
        var from = mk(y, m, 1), to = mk(y, m + 1, 0);
        var active = instancesIn(from, to);

        var card = el('button', 'ycard');
        card.type = 'button';
        if (y === TODAY.getUTCFullYear() && m === TODAY.getUTCMonth()) card.classList.add('is-now');

        var top = el('div', 'ycard-top');
        top.appendChild(el('span', 'ycard-name', MONTHS[m]));
        top.appendChild(el('span', 'ycard-n', active.length ? String(active.length) : '—'));
        card.appendChild(top);

        // The month's theme from the PDF is the most useful line here.
        card.appendChild(el('div', 'ycard-theme', LH_MONTHS[m].theme));

        var bars = el('div', 'ybars');
        active.slice(0, 5).forEach(function (inst) {
          var bar = el('div', 'ybar');
          bar.style.setProperty('--c', colourOf(inst.s));
          bar.style.setProperty('--ct', readableOn(colourOf(inst.s)));
          bar.textContent = inst.s.name;
          if (inst.from < from) bar.classList.add('cut-l');
          if (inst.to > to) bar.classList.add('cut-r');
          bars.appendChild(bar);
        });
        if (active.length > 5) bars.appendChild(el('div', 'ymore', '+' + (active.length - 5) + ' more'));
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
    var total = LH_SEASONS.filter(inFilter).length;
    setLegend('The whole year at a glance — ' + total + ' recurring season' +
              (total === 1 ? '' : 's') + ', each running for the months shown. ' +
              'Click a month for its plan and the detail.');
  }

  function setLegend(text) { document.getElementById('cal-legend').textContent = text; }

  /* =========================================================== MONTH PLAN */
  // The month's own page from the PDF, reproduced.
  function renderMonthPlan() {
    var host = document.getElementById('monthplan');
    host.textContent = '';
    if (mode === 'year') { host.hidden = true; return; }
    host.hidden = false;

    var m = view.getUTCMonth(), y = view.getUTCFullYear();
    var plan = LH_MONTHS[m];

    var head = el('div', 'mp-head');
    head.appendChild(el('span', 'eyebrow', MONTHS[m] + ' ' + y));
    head.appendChild(el('h2', null, plan.theme));
    host.appendChild(head);

    var cols = el('div', 'mp-cols');

    var rel = el('div', 'mp-rel');
    rel.appendChild(el('span', 'eyebrow', 'Relationship building this month'));
    rel.appendChild(el('p', null, plan.relationship));
    cols.appendChild(rel);

    var str = el('div', 'mp-actions');
    str.appendChild(el('span', 'eyebrow', 'Strategy and focus'));
    var ol = el('ol');
    plan.actions.forEach(function (a) {
      var li = el('li');
      li.appendChild(el('b', null, a[0] + ': '));
      li.appendChild(document.createTextNode(a[1]));
      ol.appendChild(li);
    });
    str.appendChild(ol);
    cols.appendChild(str);

    host.appendChild(cols);

    // The PDF leaves this space blank for you to fill in. Kept, and saved in
    // the browser so it survives a reload.
    var notes = el('div', 'mp-notes');
    notes.appendChild(el('span', 'eyebrow', 'Grants to apply for this month'));
    var ta = el('textarea');
    ta.rows = 3;
    ta.placeholder = 'The ones you are actually going after — name, funder, deadline.';
    var key = 'lh-grants-' + y + '-' + m;
    try { ta.value = localStorage.getItem(key) || ''; } catch (e) { /* private mode */ }
    ta.addEventListener('input', function () {
      try { localStorage.setItem(key, ta.value); } catch (e) { /* nothing to do */ }
    });
    notes.appendChild(ta);
    host.appendChild(notes);
  }

  /* ================================================================= LIST */
  function renderList() {
    var host = document.getElementById('list');
    host.textContent = '';

    var per = period();

    // A band that wraps New Year has two runs touching the same year — last
    // winter's and this one's. Listing both is just noise, so keep the most
    // relevant run per season (the sort has already put it first).
    var seenSeason = {};
    var rows = instancesIn(per.from, per.to).filter(function (inst) {
      if (seenSeason[inst.s.id]) return false;
      seenSeason[inst.s.id] = 1;
      return true;
    });

    // Anything opening just beyond the period is worth surfacing — being told
    // to get ready is the whole reason to look ahead.
    var ahead = [];
    LH_SEASONS.filter(inFilter).forEach(function (s) {
      if (seenSeason[s.id]) return;
      instancesFor(s, per.to.getUTCFullYear()).forEach(function (inst) {
        if (seenSeason[s.id]) return;
        if (inst.from <= per.to && inst.to >= per.from) return;
        var d = diff(per.to, inst.from);
        if (d > 0 && d <= OPENING_SOON) { ahead.push(inst); seenSeason[s.id] = 1; }
      });
    });
    ahead.sort(byOrder(per.to));

    if (!rows.length && !ahead.length) {
      host.appendChild(el('div', 'empty', 'Nothing is running in ' + per.label + '.'));
      return;
    }

    var list = el('div', 'list');
    rows.concat(ahead).forEach(function (inst) {
      var s = inst.s, st = statusOf(inst, TODAY);

      var item = el('button', 'item');
      item.type = 'button';
      item.style.setProperty('--c', colourOf(s));
      item.appendChild(el('span', 'item-swatch'));

      var body = el('span', 'item-body');
      var name = el('span', 'item-name');
      name.appendChild(el('span', 'status ' + st, STATUS_LABEL[st]));
      name.appendChild(document.createTextNode(s.name));
      body.appendChild(name);
      body.appendChild(el('span', 'item-what', s.short));
      body.appendChild(el('span', 'item-sub',
        funderOf(s).name + '  ·  ' + shortDate(inst.from) + ' – ' + shortDate(inst.to) +
        '  ·  ' + s.peak));
      item.appendChild(body);

      var when = el('span', 'item-when');
      if (st === 'closed') {
        var next = nextRun(s, TODAY);
        when.appendChild(el('b', null, 'Ended ' + shortDate(inst.to)));
        when.appendChild(document.createTextNode(
          next ? 'back ' + countdown(diff(TODAY, next.from)) : 'not scheduled again'));
      } else if (st === 'opening' || st === 'later') {
        when.appendChild(el('b', st === 'opening' ? 'soon' : null, 'Starts ' + shortDate(inst.from)));
        when.appendChild(document.createTextNode(countdown(diff(TODAY, inst.from))));
      } else {
        when.appendChild(el('b', st === 'closing' ? 'hot' : null, 'Ends ' + shortDate(inst.to)));
        when.appendChild(document.createTextNode(remaining(diff(TODAY, inst.to))));
      }
      item.appendChild(when);

      item.addEventListener('click', function () { openSheet(inst); });
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
    var third = mode === 'year' ? String(y)
              : thisMonth ? 'This month'
              : MONTHS[m] + ' ' + y;

    [['today', 'Today'], ['week', 'This week'], ['month', third]].forEach(function (sc) {
      var b = el('button', 'scope', sc[1]);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(scope === sc[0]));
      b.addEventListener('click', function () {
        scope = sc[0];
        if (sc[0] !== 'month') {
          view = mk(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1);
          mode = 'month';
        }
        render();
      });
      host.appendChild(b);
    });
  }

  /* ============================================================= DROPDOWN */
  function renderFunders() {
    var sel = document.getElementById('topic');
    if (!sel.options.length) {
      var all = document.createElement('option');
      all.value = 'all';
      all.textContent = 'Every funder type';
      sel.appendChild(all);
      Object.keys(LH_FUNDERS).forEach(function (k) {
        var o = document.createElement('option');
        o.value = k;
        o.textContent = LH_FUNDERS[k].suit + '  ' + LH_FUNDERS[k].name;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () { funderFilter = sel.value; render(); });
    }
    sel.value = funderFilter;

    var n = LH_SEASONS.filter(inFilter).length;
    document.getElementById('topic-count').textContent =
      n + ' recurring season' + (n === 1 ? '' : 's') + ' — the list below names each one';

    var note = document.getElementById('topic-note');
    if (funderFilter === 'all') {
      note.textContent = 'A season is one funder cycle — the stretch of the year ' +
        'when that kind of money is actually in play. They repeat every year. ' +
        'Pick a funder type to see only its own.';
      note.style.setProperty('--c', 'var(--rule-strong)');
    } else {
      note.textContent = LH_FUNDERS[funderFilter].note;
      note.style.setProperty('--c', LH_FUNDERS[funderFilter].color);
    }
  }

  /* ============================================================= THE CARD */
  var sheet = document.getElementById('sheet');
  var sheetCard = document.getElementById('sheet-card');
  var lastFocus = null;

  function openSheet(inst) {
    var s = inst.s;
    var body = document.getElementById('sheet-body');
    body.textContent = '';
    sheetCard.style.setProperty('--c', colourOf(s));

    var h = el('h3', null, s.name);
    h.id = 'sheet-title';
    body.appendChild(h);

    var tag = el('div', 'sheet-topic');
    tag.style.setProperty('--c', colourOf(s));
    tag.appendChild(el('span', 'dot'));
    tag.appendChild(document.createTextNode(funderOf(s).name));
    body.appendChild(tag);

    body.appendChild(el('p', 'sheet-what', s.what));

    var st = statusOf(inst, TODAY);
    var w = el('div', 'sheet-window');
    w.appendChild(el('span', 'status ' + st, STATUS_LABEL[st]));
    if (st === 'open' || st === 'closing') {
      w.appendChild(el('span', 'big', remaining(diff(TODAY, inst.to))));
      w.appendChild(el('span', 'sub', 'Runs to ' + longDate(inst.to) + '. Peak: ' + s.peak + '.'));
    } else if (st === 'closed') {
      var back = nextRun(s, TODAY);
      w.appendChild(el('span', 'big', 'Ended ' + longDate(inst.to)));
      w.appendChild(el('span', 'sub', back
        ? 'Back on ' + longDate(back.from) + ', ' + countdown(diff(TODAY, back.from)) +
          '. Peak: ' + s.peak + '.'
        : 'Peak: ' + s.peak + '.'));
    } else {
      w.appendChild(el('span', 'big', 'Starts ' + longDate(inst.from) + ' — ' + countdown(diff(TODAY, inst.from))));
      w.appendChild(el('span', 'sub', 'Runs to ' + longDate(inst.to) + '. Peak: ' + s.peak + '.'));
    }
    w.appendChild(el('span', 'sub', ' Whole months, and it repeats every year.'));
    body.appendChild(w);

    if (s.givingTuesday) {
      var gt = givingTuesday(inst.from.getUTCFullYear());
      body.appendChild(el('div', 'sheet-flag',
        'Giving Tuesday ' + gt.getUTCFullYear() + ' falls on ' + longDate(gt) +
        ' — the Tuesday after Thanksgiving, so it moves every year.'));
    }
    if (s.urgent) body.appendChild(el('div', 'sheet-flag', s.urgent));

    if (s.prep && s.prep.length) {
      body.appendChild(el('div', 'sheet-h', 'What this season needs from you'));
      var ul = el('ul');
      s.prep.forEach(function (x) { ul.appendChild(el('li', null, x)); });
      body.appendChild(ul);
    }

    body.appendChild(el('div', 'sheet-where', 'From the Fund-Nation Grant Strategy Calendar.'));

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
    renderFunders();

    var y = view.getUTCFullYear(), m = view.getUTCMonth();
    var title = document.getElementById('cal-title');
    title.textContent = mode === 'year' ? String(y) : MONTHS[m] + ' ' + y;
    title.setAttribute('aria-label', mode === 'year'
      ? 'Showing ' + y + '. Back to the month view.'
      : 'Showing ' + MONTHS[m] + ' ' + y + '. See the whole year.');
    document.getElementById('cal').classList.toggle('is-year', mode === 'year');

    var host = document.getElementById('cal-body');
    host.textContent = '';
    if (mode === 'year') renderYear(host); else renderMonth(host);

    renderMonthPlan();
    renderScopes();
    renderList();
  }

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

  // Stepping with the arrows from the year view drops into the month, which
  // is what "scroll month by month for the detail" means.
  document.getElementById('cal-title').title = 'Switch between the year and the month';

  /* ------------------------------------------------------------- STATIC */
  document.getElementById('tagline').textContent = LH_META.tagline;
  document.getElementById('foot-src').textContent = ' ' + LH_META.source + '.';

  var quiet = document.getElementById('quiet');
  quiet.appendChild(el('span', 'eyebrow', LH_META.quietMonth.heading));
  quiet.appendChild(el('p', null, LH_META.quietMonth.body));
  quiet.appendChild(el('p', 'quiet-repeat', LH_META.repeat));

  render();
})();
