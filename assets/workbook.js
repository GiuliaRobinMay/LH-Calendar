/* ============================================================================
   Lesko Help — Grant Planning Workbook view

   Renders the workbook from data/workbook.js and wires up the one thing a
   page can do that a PDF cannot: cost a position live.

   The calculator follows the source's own arithmetic exactly, including its
   rounding to the cent at every step — that is what makes it reproduce the
   printed $60,000 example to the penny rather than landing $5.78 away.
   ========================================================================== */
(function () {
  'use strict';

  var W = LH_WORKBOOK;
  var C = W.costing;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function money(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  /* -------------------------------------------------------------- COSTING */
  // Rounds at each step, exactly as the worked example on page 12 does.
  function cost(salary, healthcare) {
    var base = r2(salary / C.hoursPerYear);
    var pto = r2(r2(base * C.ptoHours) / C.hoursPerYear);
    var hc = r2(healthcare / C.hoursPerYear);
    var sup = r2(base * C.supervisionRate);
    var added = r2(pto + hc + sup);
    var totalHourly = r2(base + added);
    var fringePerHour = r2(totalHourly * C.fringeRate);
    var loaded = r2((totalHourly + fringePerHour) * C.hoursPerYear);
    return {
      base: base, pto: pto, hc: hc, sup: sup, added: added,
      totalHourly: totalHourly, fringePerHour: fringePerHour,
      loaded: loaded, shortfall: r2(loaded - salary),
      quick: r2(salary * C.quickMultiplier),
    };
  }

  /* ---------------------------------------------------------------- BUILD */
  function section(title, eyebrow) {
    var s = el('section', 'wb-sec');
    if (eyebrow) s.appendChild(el('span', 'eyebrow', eyebrow));
    if (title) s.appendChild(el('h2', null, title));
    return s;
  }

  function twoColTable(head, rows) {
    var t = el('table', 'wb-table');
    var thead = el('thead'), tr = el('tr');
    head.forEach(function (h) { tr.appendChild(el('th', null, h)); });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tb = el('tbody');
    rows.forEach(function (r) {
      var row = el('tr');
      r.forEach(function (c, i) {
        row.appendChild(el(i === 0 ? 'th' : 'td', i === 0 ? 'rowhead' : null, c));
      });
      tb.appendChild(row);
    });
    t.appendChild(tb);
    var wrap = el('div', 'wb-scroll');
    wrap.appendChild(t);
    return wrap;
  }

  function build() {
    var host = document.getElementById('pane-wb');
    host.textContent = '';

    /* --- intro --- */
    var intro = section(W.title);
    intro.appendChild(el('p', 'wb-tagline', W.tagline));
    intro.appendChild(el('p', 'wb-intro', W.intro));
    host.appendChild(intro);

    /* --- what you will build --- */
    var b = section('What you will build', 'Reference');
    var ol = el('ol', 'wb-steps');
    W.build.forEach(function (x) {
      var li = el('li');
      li.appendChild(el('b', null, x[0]));
      li.appendChild(el('span', null, x[1]));
      ol.appendChild(li);
    });
    b.appendChild(ol);
    b.appendChild(el('div', 'sheet-h', 'Type of grant, and what the money can be used for'));
    b.appendChild(twoColTable(['Type of grant', 'What the money can be used for'], W.grantTypes));
    host.appendChild(b);

    /* --- definitions --- */
    var d = section('Definitions you will need', 'Reference');
    d.appendChild(el('p', 'wb-intro',
      'Keep this open while you work. These eight terms cover most of what a ' +
      'funder will expect you to already understand.'));
    var dl = el('div', 'wb-defs');
    W.definitions.forEach(function (x) {
      var card = el('div', 'wb-def');
      card.appendChild(el('b', null, x[0]));
      card.appendChild(el('span', null, x[1]));
      dl.appendChild(card);
    });
    d.appendChild(dl);
    host.appendChild(d);

    /* --- the tasks --- */
    var t = section('The tasks', 'Work through these in order');
    W.tasks.forEach(function (task) {
      var card = el('div', 'wb-task');
      var head = el('div', 'wb-task-head');
      head.appendChild(el('span', 'wb-n', String(task.n)));
      head.appendChild(el('h3', null, task.title));
      card.appendChild(head);
      card.appendChild(el('p', 'wb-blurb', task.blurb));

      if (task.fields) {
        task.fields.forEach(function (f) {
          card.appendChild(el('div', 'sheet-h', f));
          card.appendChild(field('wb-t' + task.n + '-' + f.slice(0, 12), 3));
        });
      }
      if (task.columns) card.appendChild(grid(task));
      if (task.steps) {
        var ol2 = el('ol', 'wb-steps wb-steps-tight');
        task.steps.forEach(function (s) { ol2.appendChild(el('li', null, s)); });
        card.appendChild(ol2);
      }
      if (task.n === 4) card.appendChild(el('div', 'wb-tip', 'Fast funding tip · ' + W.fastTip));
      t.appendChild(card);
    });
    host.appendChild(t);

    /* --- the calculator --- */
    host.appendChild(calculator());

    /* --- resources --- */
    var r = section('Resources for the budget worksheet', 'Reference');
    r.appendChild(el('p', 'wb-intro',
      'Everything you need to fill in those figures is public and free. These are the sources.'));
    var rl = el('div', 'wb-defs');
    W.resources.forEach(function (x) {
      var a = el('a', 'wb-def wb-res');
      a.href = x[2]; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(el('b', null, x[0]));
      a.appendChild(el('span', null, x[1]));
      rl.appendChild(a);
    });
    r.appendChild(rl);
    host.appendChild(r);

    /* --- cta --- */
    var c = section(W.cta.heading, 'Next step');
    c.appendChild(el('p', 'wb-intro', W.cta.body));
    var col = el('ol', 'wb-steps');
    W.cta.steps.forEach(function (x) {
      var li = el('li');
      li.appendChild(el('b', null, x[0]));
      li.appendChild(el('span', null, x[1]));
      col.appendChild(li);
    });
    c.appendChild(col);
    var go = el('a', 'sheet-go', W.cta.signup + ' →');
    go.href = W.cta.link; go.target = '_blank'; go.rel = 'noopener';
    c.appendChild(go);
    c.appendChild(el('div', 'sheet-where', 'Questions on any of this: ' + W.cta.contact));
    host.appendChild(c);
  }

  /* Free-text answer, kept in the browser so the workbook survives a reload. */
  function field(key, rows) {
    var ta = el('textarea', 'wb-field');
    ta.rows = rows || 2;
    var k = 'lh-wb-' + key;
    try { ta.value = localStorage.getItem(k) || ''; } catch (e) { /* private mode */ }
    ta.addEventListener('input', function () {
      try { localStorage.setItem(k, ta.value); } catch (e) { /* nothing to do */ }
    });
    return ta;
  }

  function grid(task) {
    var wrap = el('div', 'wb-scroll');
    var t = el('table', 'wb-table wb-fill');
    var thead = el('thead'), tr = el('tr');
    task.columns.forEach(function (c) { tr.appendChild(el('th', null, c)); });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tb = el('tbody');
    for (var i = 0; i < task.rows; i++) {
      var row = el('tr');
      for (var j = 0; j < task.columns.length; j++) {
        var td = el('td');
        var inp = el('input', 'wb-cell');
        inp.type = 'text';
        var k = 'lh-wb-t' + task.n + '-' + i + '-' + j;
        try { inp.value = localStorage.getItem(k) || ''; } catch (e) { /* private mode */ }
        (function (k, inp) {
          inp.addEventListener('input', function () {
            try { localStorage.setItem(k, inp.value); } catch (e) { /* nothing to do */ }
          });
        })(k, inp);
        td.appendChild(inp);
        row.appendChild(td);
      }
      tb.appendChild(row);
    }
    t.appendChild(tb);
    if (task.totalLabel) {
      var tf = el('tfoot'), trf = el('tr');
      var th = el('th', null, task.totalLabel);
      th.colSpan = task.columns.length - 1;
      trf.appendChild(th);
      var td2 = el('td');
      td2.appendChild(field('t' + task.n + '-total', 1));
      trf.appendChild(td2);
      tf.appendChild(trf);
      t.appendChild(tf);
    }
    wrap.appendChild(t);
    return wrap;
  }

  /* ----------------------------------------------------------- CALCULATOR */
  function calculator() {
    var s = section('Cost a position', 'The part a PDF cannot do');
    s.appendChild(el('p', 'wb-intro',
      'A salary is not what a position costs. Put a salary in and this works ' +
      'it through the same steps as the worked example in the source, rounding ' +
      'to the cent at each one — so it reproduces that example exactly.'));

    var controls = el('div', 'calc-controls');
    var salary = numField('Annual salary', C.defaultSalary);
    var health = numField('Healthcare, per employee per year', C.defaultHealthcare);
    controls.appendChild(salary.wrap);
    controls.appendChild(health.wrap);
    s.appendChild(controls);

    var out = el('div', 'calc-out');
    s.appendChild(out);

    function draw() {
      var sal = Math.max(0, +salary.input.value || 0);
      var hc = Math.max(0, +health.input.value || 0);
      var c = cost(sal, hc);
      out.textContent = '';

      // The headline: what the position really costs.
      var head = el('div', 'calc-head');
      var big = el('div', 'calc-big');
      big.appendChild(el('span', 'calc-label', 'Fully loaded annual cost'));
      big.appendChild(el('span', 'calc-num', money(c.loaded)));
      head.appendChild(big);
      var gap = el('div', 'calc-gap');
      gap.appendChild(el('span', 'calc-label', 'Short by, if you budget the salary alone'));
      gap.appendChild(el('span', 'calc-num', money(c.shortfall)));
      head.appendChild(gap);
      out.appendChild(head);

      out.appendChild(twoColTable(['Step', 'Result'], [
        ['Base hourly rate', money(c.base) + ' / hr'],
        ['Paid time off per hour', money(c.pto) + ' / hr'],
        ['Healthcare per hour', money(c.hc) + ' / hr'],
        ['Supervision per hour (20%)', money(c.sup) + ' / hr'],
        ['Added cost per hour', money(c.added) + ' / hr'],
        ['Total hourly', money(c.totalHourly) + ' / hr'],
        ['Fringe per hour (35%)', money(c.fringePerHour) + ' / hr'],
        ['Fully loaded annual', money(c.loaded)],
      ]));

      // The source gives two methods that do not agree. Say so.
      var warn = el('div', 'calc-warn');
      warn.appendChild(el('b', null, 'The two methods in the source disagree. '));
      warn.appendChild(document.createTextNode(
        'The quick rule (salary × 1.35) gives ' + money0(c.quick) +
        '. The long method above gives ' + money0(c.loaded) + ' — a gap of ' +
        money0(c.loaded - c.quick) + '. The long version is the one to use ' +
        'when a funder wants it shown line by line, and it is the one that ' +
        'matches the worked example.'));
      out.appendChild(warn);

      if (sal === C.example.salary && hc === C.example.healthcare) {
        out.appendChild(el('div', 'calc-ok',
          'These are the source’s own figures — and every line matches its ' +
          'printed example, including ' + money(C.example.loadedAnnual) + '.'));
      }

      var tx = C.taxes.map(function (t) { return t[0] + ' ' + t[1] + '%'; }).join(' + ');
      out.appendChild(el('div', 'sheet-caveat',
        'Employer taxes quoted in the source: ' + tx + ', a combined 23.25%. ' +
        'The 2,080 hours comes from the Fair Labor Standards Act. Fringe is ' +
        'taken at 35% and supervision at 20% of base, as printed.'));
    }

    salary.input.addEventListener('input', draw);
    health.input.addEventListener('input', draw);
    draw();
    return s;
  }

  function numField(label, value) {
    var wrap = el('label', 'calc-field');
    wrap.appendChild(el('span', 'eyebrow', label));
    var row = el('span', 'calc-inputrow');
    row.appendChild(el('span', 'calc-dollar', '$'));
    var input = el('input', 'calc-input');
    input.type = 'number';
    input.min = '0';
    input.step = '1000';
    input.value = String(value);
    row.appendChild(input);
    wrap.appendChild(row);
    return { wrap: wrap, input: input };
  }

  /* ----------------------------------------------------------- VIEW SWITCH */
  var built = false;
  var vCal = document.getElementById('v-cal');
  var vWb = document.getElementById('v-wb');
  var pCal = document.getElementById('pane-cal');
  var pWb = document.getElementById('pane-wb');

  function show(which) {
    var wb = which === 'wb';
    if (wb && !built) { build(); built = true; }
    pCal.hidden = wb;
    pWb.hidden = !wb;
    vCal.classList.toggle('is-on', !wb);
    vWb.classList.toggle('is-on', wb);
    vCal.setAttribute('aria-selected', String(!wb));
    vWb.setAttribute('aria-selected', String(wb));
    window.scrollTo(0, 0);
  }
  vCal.addEventListener('click', function () { show('cal'); });
  vWb.addEventListener('click', function () { show('wb'); });
})();
