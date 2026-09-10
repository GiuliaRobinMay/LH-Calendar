/* ============================================================================
   Lesko Help — Grant Calendar

   Built for someone who has never applied for a grant. It answers, in order:

     1. Do I have to wait?          Mostly no.
     2. What can I do right now?    This list.
     3. When does the rest open?    This strip.
     4. What should I do today?     This box.

   No navigation, no filters, no month grid. Everything is on one screen and
   works out where we are in the year on its own.
   ========================================================================== */
(function () {
  'use strict';

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var INITIALS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  var now = new Date();
  var THIS_MONTH = now.getMonth();
  var TODAY = now.getDate();

  // Preview another month with ?month=1 (0 = January). Only for checking the
  // page reads right in, say, February.
  var q = new URLSearchParams(location.search).get('month');
  if (q !== null && /^\d+$/.test(q) && +q >= 0 && +q < 12) THIS_MONTH = +q;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function colourOf(g) { return LH_COLORS[g.color]; }

  // Gold carries dark text, the other three carry white. Worked out from the
  // real contrast ratio rather than hard-coded, so a colour change cannot
  // quietly leave a label unreadable.
  function labelOn(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return (L + 0.05) / 0.0695 >= 1.05 / (L + 0.05) ? '#12213F' : '#FFFFFF';
  }

  /* -------------------------------------------------------------- MONTHS */
  // A grant can run across New Year (November to February), so "is month m
  // inside this grant" is not a simple from <= m <= to.
  function isOpenIn(g, m) {
    return g.from <= g.to ? (m >= g.from && m <= g.to)
                          : (m >= g.from || m <= g.to);
  }
  function isOpenNow(g) { return isOpenIn(g, THIS_MONTH); }

  // How many months until it opens again. Used for "opens in 2 months".
  function monthsUntilOpen(g) {
    for (var i = 0; i < 12; i++) {
      if (isOpenIn(g, (THIS_MONTH + i) % 12)) return i;
    }
    return null;
  }
  // The last month it is open, counting forward from now.
  function monthsLeftOpen(g) {
    for (var i = 0; i < 12; i++) {
      if (!isOpenIn(g, (THIS_MONTH + i) % 12)) return i - 1;
    }
    return 11;
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  /* --------------------------------------------------------- MONTH STRIP */
  // Twelve blocks. Filled where the grant is open. This is the whole
  // explanation of "when" — no legend needed, no reading required.
  function strip(g) {
    var wrap = el('div', 'strip');
    for (var m = 0; m < 12; m++) {
      var cell = el('div', 'strip-m' + (isOpenIn(g, m) ? ' on' : ''));
      if (isOpenIn(g, m)) {
        cell.style.background = colourOf(g);
        cell.style.color = labelOn(colourOf(g));
      }
      if (m === THIS_MONTH) cell.classList.add('is-now');
      var lab = el('span', 'strip-l', INITIALS[m]);
      if (isOpenIn(g, m)) lab.style.color = 'inherit';
      cell.appendChild(lab);
      cell.setAttribute('aria-hidden', 'true');
      wrap.appendChild(cell);
    }
    return wrap;
  }

  /* ============================================================ OPEN NOW */
  function renderNow() {
    var host = document.getElementById('now');
    host.textContent = '';

    var open = LH_GRANTS.filter(isOpenNow);
    var soon = LH_GRANTS.filter(function (g) {
      var u = monthsUntilOpen(g);
      return u !== null && u > 0 && u <= 2;
    });

    var head = el('div', 'now-head');
    head.appendChild(el('span', 'now-month', 'It is ' + MONTHS[THIS_MONTH]));
    head.appendChild(el('h2', null, open.length
      ? 'You can apply for ' + open.length + ' of them right now'
      : 'None of the seven are open this month'));
    host.appendChild(head);

    if (open.length) {
      var list = el('div', 'now-list');
      open.forEach(function (g) {
        var left = monthsLeftOpen(g);
        var b = el('button', 'now-item');
        b.type = 'button';
        b.style.setProperty('--c', colourOf(g));
        b.appendChild(el('span', 'now-dot'));
        var body = el('span', 'now-body');
        body.appendChild(el('span', 'now-name', g.name));
        body.appendChild(el('span', 'now-note', left === 0
          ? 'Last month — closes end of ' + MONTHS[THIS_MONTH]
          : left + ' more ' + plural(left, 'month', 'months') + ' to apply'));
        b.appendChild(body);
        if (left === 0) b.classList.add('is-last');
        b.addEventListener('click', function () { openSheet(g); });
        list.appendChild(b);
      });
      host.appendChild(list);
    } else {
      host.appendChild(el('p', 'now-none',
        'That is normal. Use this month to get ready — see the box at the bottom.'));
    }

    if (soon.length) {
      var s = el('p', 'now-soon');
      s.appendChild(el('b', null, 'Coming up: '));
      s.appendChild(document.createTextNode(soon.map(function (g) {
        var u = monthsUntilOpen(g);
        return g.name + ' opens ' + (u === 1 ? 'next month' : 'in ' + u + ' months');
      }).join('. ') + '.'));
      host.appendChild(s);
    }
  }

  /* ============================================================== GRANTS */
  function renderGrants() {
    var host = document.getElementById('grants');
    host.textContent = '';

    // Open ones first — that is what someone can act on today.
    var sorted = LH_GRANTS.slice().sort(function (a, b) {
      var oa = isOpenNow(a) ? 0 : 1, ob = isOpenNow(b) ? 0 : 1;
      return oa - ob || monthsUntilOpen(a) - monthsUntilOpen(b);
    });

    sorted.forEach(function (g) {
      var card = el('button', 'grant');
      card.type = 'button';
      card.style.setProperty('--c', colourOf(g));
      if (isOpenNow(g)) card.classList.add('is-open');

      var top = el('div', 'grant-top');
      var names = el('div');
      names.appendChild(el('h3', null, g.name));
      names.appendChild(el('div', 'grant-when', 'Open ' + g.when));
      top.appendChild(names);
      top.appendChild(el('span', 'tag ' + (isOpenNow(g) ? 'tag-open' : 'tag-shut'),
        isOpenNow(g) ? 'OPEN NOW' : 'Opens ' + MONTHS[g.from]));
      card.appendChild(top);

      card.appendChild(strip(g));
      card.appendChild(el('p', 'grant-what', g.what));
      card.appendChild(el('span', 'grant-more', 'Tap to read more'));

      card.addEventListener('click', function () { openSheet(g); });
      host.appendChild(card);
    });
  }

  /* ========================================================== THIS MONTH */
  function renderMonth() {
    var host = document.getElementById('thismonth');
    host.textContent = '';
    var m = LH_MONTHS[THIS_MONTH];

    host.appendChild(el('h2', 'sec-title', 'What to do in ' + MONTHS[THIS_MONTH]));
    host.appendChild(el('p', 'month-line', m.line));

    var ol = el('ol', 'month-todo');
    m.todo.forEach(function (t) { ol.appendChild(el('li', null, t)); });
    host.appendChild(ol);
  }

  /* ================================================================ CARD */
  var sheet = document.getElementById('sheet');
  var sheetCard = document.getElementById('sheet-card');
  var lastFocus = null;

  function openSheet(g) {
    var body = document.getElementById('sheet-body');
    body.textContent = '';
    sheetCard.style.setProperty('--c', colourOf(g));

    var h = el('h3', null, g.name);
    h.id = 'sheet-title';
    body.appendChild(h);

    body.appendChild(el('div', 'sheet-when',
      isOpenNow(g) ? 'Open now · ' + g.when : 'Opens in ' + MONTHS[g.from] + ' · ' + g.when));

    body.appendChild(strip(g));

    body.appendChild(el('div', 'sheet-h', 'What it is'));
    body.appendChild(el('p', 'sheet-p', g.what));

    body.appendChild(el('div', 'sheet-h', 'How to get it'));
    body.appendChild(el('p', 'sheet-p', g.tip));

    if (g.heads) {
      body.appendChild(el('div', 'sheet-flag', g.heads));
    }

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

  /* ================================================================= RUN */
  document.getElementById('always-h').textContent = LH_INTRO.alwaysHeading;
  document.getElementById('always-b').textContent = LH_INTRO.alwaysBody;
  document.getElementById('season-h').textContent = LH_INTRO.seasonHeading;
  document.getElementById('season-b').textContent = LH_INTRO.seasonBody;

  renderNow();
  renderGrants();
  renderMonth();
})();
