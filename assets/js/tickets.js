/* ============================================================================
   ЗОНА ПОЛУНОЧИ — билеты, календарь, калькулятор
   ----------------------------------------------------------------------------
   Загруженность дней не случайная и не «рандом при каждой перезагрузке»:
   она считается хешем от даты, поэтому один и тот же день всегда выглядит
   одинаково — иначе календарь мигал бы разными состояниями при каждом
   переключении месяца, и ему нельзя было бы верить.

   Три состояния различаются не только цветом: у каждого своя форма
   индикатора, зачёркивание для «нет мест» и текстовая подпись в aria-label.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;
  var DATA = window.EXHIBITION;

  var state = {
    mode: 'weekday',      /* какие цены показаны в тарифах */
    date: null,           /* выбранный день, ISO */
    session: null,        /* выбранный сеанс */
    counts: {},           /* билеты по тарифам */
    month: null           /* первый день показанного месяца */
  };

  DATA.tickets.forEach(function (tk) { state.counts[tk.id] = 0; });

  /* ------------------------------------------------------------ Даты ----- */
  function iso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function fromIso(s) {
    var p = s.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function isWeekend(d) { var w = d.getDay(); return w === 0 || w === 6; }
  function isClosed(d) {
    var isoDay = d.getDay() === 0 ? 7 : d.getDay();
    return DATA.meta.closedWeekdays.indexOf(isoDay) !== -1;
  }
  function inRange(d) {
    var s = iso(d);
    return s >= DATA.meta.dateFrom && s <= DATA.meta.dateTo;
  }

  /* Устойчивый хеш строки: одинаковый день — одинаковая загруженность */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function occupancy(d) {
    if (!inRange(d) || isClosed(d)) { return 'closed'; }
    var base = hash(iso(d)) % 100;
    if (isWeekend(d)) { base -= 26; }     /* выходные заметно плотнее */
    if (base < 12) { return 'none'; }
    if (base < 42) { return 'few'; }
    return 'free';
  }

  function seatsFor(dateIso, time, occ) {
    if (occ === 'none' || occ === 'closed') { return 0; }
    var h = hash(dateIso + time);
    if (occ === 'few') { return (h % 4 === 0) ? 0 : 1 + (h % 9); }
    return 18 + (h % 42);
  }

  /* -------------------------------------------------------- Тарифы ------- */
  function price(tk) { return state.mode === 'weekend' ? tk.weekend : tk.weekday; }

  function renderTariffs() {
    var box = MZ.$('[data-tariffs]');
    if (!box) { return; }
    var t = MZ.i18n.t;

    box.textContent = '';
    DATA.tickets.forEach(function (tk) {
      var card = document.createElement('article');
      card.className = 'tariff reveal';

      var name = document.createElement('h3');
      name.className = 'tariff__name';
      name.textContent = t('tickets.names.' + tk.id);

      var priceBox = document.createElement('div');
      priceBox.className = 'tariff__price';
      var value = document.createElement('span');
      value.setAttribute('data-price-for', tk.id);
      value.textContent = String(price(tk));
      var cur = document.createElement('span');
      cur.className = 'tariff__cur';
      cur.textContent = t('common.currency');
      priceBox.appendChild(value);
      priceBox.appendChild(cur);

      var note = document.createElement('p');
      note.className = 'tariff__note';
      note.textContent = t('tickets.notes.' + tk.id);

      card.appendChild(name);
      card.appendChild(priceBox);
      card.appendChild(note);
      box.appendChild(card);
    });
    MZ.observeReveal(box);
  }

  /* Цена меняется отсчётом, а не подменой строки — так видно, что изменилось */
  function animatePrices() {
    DATA.tickets.forEach(function (tk) {
      var el = MZ.$('[data-price-for="' + tk.id + '"]');
      if (!el) { return; }
      var from = parseInt(el.textContent, 10) || 0;
      var to = price(tk);
      if (from === to) { return; }
      if (MZ.reduced) { el.textContent = String(to); return; }

      var t0 = 0;
      var dur = 420;
      window.requestAnimationFrame(function step(now) {
        if (!t0) { t0 = now; }
        var p = MZ.clamp((now - t0) / dur, 0, 1);
        el.textContent = String(Math.round(MZ.lerp(from, to, 1 - Math.pow(1 - p, 3))));
        if (p < 1) { window.requestAnimationFrame(step); }
      });
    });
  }

  /* ------------------------------------------------------ Календарь ------ */
  function monthStart(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }

  function limits() {
    return {
      first: monthStart(fromIso(DATA.meta.dateFrom)),
      last: monthStart(fromIso(DATA.meta.dateTo))
    };
  }

  function renderCalendar() {
    var root = MZ.$('[data-calendar]');
    if (!root) { return; }
    var t = MZ.i18n.t;

    var monthLabel = MZ.$('[data-cal-month]', root);
    var grid = MZ.$('[data-cal-grid]', root);
    var weekdays = MZ.$('[data-cal-weekdays]', root);
    var prev = MZ.$('[data-cal-prev]', root);
    var next = MZ.$('[data-cal-next]', root);
    if (!grid) { return; }

    var names = t('tickets.monthNames') || [];
    var short = t('tickets.weekdayShort') || [];
    var full = t('tickets.weekdayFull') || [];
    var lim = limits();

    if (monthLabel) {
      monthLabel.textContent = (names[state.month.getMonth()] || '') + ' ' + state.month.getFullYear();
    }

    if (weekdays) {
      weekdays.textContent = '';
      short.forEach(function (w) {
        var cell = document.createElement('span');
        cell.textContent = w;
        weekdays.appendChild(cell);
      });
    }

    if (prev) { prev.disabled = state.month <= lim.first; }
    if (next) { next.disabled = state.month >= lim.last; }

    grid.textContent = '';

    /* Неделя начинается с понедельника */
    var firstDay = new Date(state.month.getFullYear(), state.month.getMonth(), 1);
    var lead = (firstDay.getDay() + 6) % 7;
    for (var i = 0; i < lead; i++) {
      var blank = document.createElement('span');
      blank.className = 'cal__day is-empty';
      blank.setAttribute('aria-hidden', 'true');
      grid.appendChild(blank);
    }

    var daysInMonth = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 0).getDate();
    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(state.month.getFullYear(), state.month.getMonth(), day);
      var occ = occupancy(d);
      var dIso = iso(d);
      var open = occ !== 'closed' && occ !== 'none';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal__day cal__day--' + occ;
      btn.setAttribute('data-date', dIso);
      btn.setAttribute('aria-pressed', state.date === dIso ? 'true' : 'false');
      btn.disabled = !open;

      var num = document.createElement('span');
      num.textContent = String(day);
      btn.appendChild(num);

      if (occ !== 'closed') {
        var dot = document.createElement('span');
        dot.className = 'cal__dot';
        btn.appendChild(dot);
      }

      /* Полная подпись для скринридера: дата, день недели и словами —
         свободно, мало мест или нет мест */
      btn.setAttribute('aria-label',
        day + ' ' + (names[d.getMonth()] || '') + ', ' +
        (full[(d.getDay() + 6) % 7] || '') + ' — ' +
        t('tickets.occupancy.' + occ));

      grid.appendChild(btn);
    }
  }

  /* -------------------------------------------------------- Сеансы ------- */
  function renderSessions() {
    var box = MZ.$('[data-sessions]');
    var hint = MZ.$('[data-sessions-hint]');
    if (!box) { return; }
    var t = MZ.i18n.t;

    box.textContent = '';

    if (!state.date) {
      if (hint) { hint.textContent = t('tickets.sessionsHint'); hint.hidden = false; }
      return;
    }
    if (hint) { hint.hidden = true; }

    var d = fromIso(state.date);
    var occ = occupancy(d);

    DATA.sessions.forEach(function (time) {
      var seats = seatsFor(state.date, time, occ);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'session';
      btn.setAttribute('data-session', time);
      btn.setAttribute('aria-pressed', state.session === time ? 'true' : 'false');
      btn.disabled = seats === 0;

      var label = document.createElement('span');
      label.textContent = time;

      var seatsEl = document.createElement('span');
      seatsEl.className = 'session__seats';
      seatsEl.textContent = seats === 0
        ? t('tickets.soldOut')
        : seats + ' ' + t('tickets.seatsLeft');

      btn.appendChild(label);
      btn.appendChild(seatsEl);
      box.appendChild(btn);
    });
  }

  /* ---------------------------------------------------- Калькулятор ------ */
  function renderCalc() {
    var box = MZ.$('[data-calc]');
    if (!box) { return; }
    var t = MZ.i18n.t;

    box.textContent = '';
    DATA.tickets.forEach(function (tk) {
      var row = document.createElement('div');
      row.className = 'calc__row';

      var info = document.createElement('div');
      info.className = 'calc__info';
      var name = document.createElement('div');
      name.className = 'calc__name';
      name.textContent = t('tickets.names.' + tk.id);
      var pr = document.createElement('div');
      pr.className = 'calc__price';
      pr.setAttribute('data-calc-price', tk.id);
      pr.textContent = price(tk) + ' ' + t('common.currency');
      info.appendChild(name);
      info.appendChild(pr);

      var stepper = document.createElement('div');
      stepper.className = 'stepper';

      var minus = document.createElement('button');
      minus.type = 'button';
      minus.className = 'stepper__btn';
      minus.textContent = '−';
      minus.setAttribute('aria-label', t('tickets.minus') + ': ' + t('tickets.names.' + tk.id));
      minus.setAttribute('data-step', '-1');
      minus.setAttribute('data-for', tk.id);

      var value = document.createElement('span');
      value.className = 'stepper__value';
      value.setAttribute('data-count-for', tk.id);
      value.setAttribute('aria-live', 'polite');
      value.textContent = String(state.counts[tk.id]);

      var plus = document.createElement('button');
      plus.type = 'button';
      plus.className = 'stepper__btn';
      plus.textContent = '+';
      plus.setAttribute('aria-label', t('tickets.plus') + ': ' + t('tickets.names.' + tk.id));
      plus.setAttribute('data-step', '1');
      plus.setAttribute('data-for', tk.id);

      stepper.appendChild(minus);
      stepper.appendChild(value);
      stepper.appendChild(plus);

      row.appendChild(info);
      row.appendChild(stepper);
      box.appendChild(row);
    });

    syncCalc();
  }

  function total() {
    return DATA.tickets.reduce(function (sum, tk) {
      return sum + state.counts[tk.id] * price(tk);
    }, 0);
  }

  function syncCalc() {
    var t = MZ.i18n.t;

    DATA.tickets.forEach(function (tk) {
      var value = MZ.$('[data-count-for="' + tk.id + '"]');
      if (value) { value.textContent = String(state.counts[tk.id]); }

      var pr = MZ.$('[data-calc-price="' + tk.id + '"]');
      if (pr) { pr.textContent = price(tk) + ' ' + t('common.currency'); }

      var minus = MZ.$('[data-step="-1"][data-for="' + tk.id + '"]');
      var plus = MZ.$('[data-step="1"][data-for="' + tk.id + '"]');
      if (minus) { minus.disabled = state.counts[tk.id] === 0; }
      if (plus) { plus.disabled = state.counts[tk.id] >= tk.max; }
    });

    var out = MZ.$('[data-total]');
    if (out) { out.textContent = total() + ' ' + t('common.currency'); }

    var summary = MZ.$('[data-order-summary]');
    if (summary) {
      var parts = [];
      if (state.date) { parts.push(state.date); }
      if (state.session) { parts.push(state.session); }
      var picked = DATA.tickets.filter(function (tk) { return state.counts[tk.id] > 0; })
        .map(function (tk) { return t('tickets.names.' + tk.id) + ' × ' + state.counts[tk.id]; });
      summary.textContent = picked.length
        ? parts.concat(picked).join(' · ')
        : t('tickets.nothingSelected');
    }
  }

  /* ------------------------------------------------------- Обработчики --- */
  function bind() {
    var root = MZ.$('[data-tickets-page]');
    if (!root) { return; }

    /* Переключатель будни/выходные */
    MZ.$$('[data-mode]', root).forEach(function (input) {
      input.addEventListener('change', function () {
        state.mode = input.getAttribute('data-mode');
        animatePrices();
        syncCalc();
      });
    });

    /* Календарь: делегирование, чтобы не перевешивать слушатели при
       каждой перерисовке месяца */
    var cal = MZ.$('[data-calendar]', root);
    if (cal) {
      cal.addEventListener('click', function (e) {
        var prev = e.target.closest('[data-cal-prev]');
        var next = e.target.closest('[data-cal-next]');
        var day = e.target.closest('[data-date]');

        if (prev) {
          state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
          renderCalendar();
          return;
        }
        if (next) {
          state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
          renderCalendar();
          return;
        }
        if (day && !day.disabled) {
          state.date = day.getAttribute('data-date');
          state.session = null;

          /* Цены сами переключаются на тип выбранного дня: иначе человек
             увидит в тарифах одну сумму, а в итоге другую */
          var weekend = isWeekend(fromIso(state.date));
          state.mode = weekend ? 'weekend' : 'weekday';
          var radio = MZ.$('[data-mode="' + state.mode + '"]');
          if (radio) { radio.checked = true; }

          animatePrices();
          renderCalendar();
          renderSessions();
          syncCalc();
        }
      });
    }

    var sessions = MZ.$('[data-sessions]', root);
    if (sessions) {
      sessions.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-session]');
        if (!btn || btn.disabled) { return; }
        state.session = btn.getAttribute('data-session');
        renderSessions();
        syncCalc();
      });
    }

    var calc = MZ.$('[data-calc]', root);
    if (calc) {
      calc.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-step]');
        if (!btn) { return; }
        var id = btn.getAttribute('data-for');
        var tk = DATA.tickets.filter(function (x) { return x.id === id; })[0];
        if (!tk) { return; }
        var delta = Number(btn.getAttribute('data-step'));
        state.counts[id] = MZ.clamp(state.counts[id] + delta, 0, tk.max);
        syncCalc();
      });
    }
  }

  /* ---------------------------------------------------------- Правила ---- */
  function renderRules() {
    var list = MZ.$('[data-rules]');
    if (!list) { return; }
    list.textContent = '';
    (MZ.i18n.t('tickets.rules') || []).forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function renderLegend() {
    var box = MZ.$('[data-legend]');
    if (!box) { return; }
    var t = MZ.i18n.t;
    box.textContent = '';
    ['free', 'few', 'none'].forEach(function (key) {
      var item = document.createElement('span');
      var dot = document.createElement('span');
      dot.className = 'cal__dot';
      /* Тот же индикатор, что и в календаре: форма, а не только цвет */
      var holder = document.createElement('span');
      holder.className = 'cal__day--' + key;
      holder.style.display = 'contents';
      holder.appendChild(dot);
      item.appendChild(holder);
      item.appendChild(document.createTextNode(' ' + t('tickets.occupancy.' + key)));
      box.appendChild(item);
    });
  }

  function renderAll() {
    renderTariffs();
    renderCalendar();
    renderSessions();
    renderCalc();
    renderRules();
    renderLegend();
  }

  MZ.pages = MZ.pages || {};
  MZ.pages.tickets = function () {
    var first = fromIso(DATA.meta.dateFrom);
    var today = new Date();
    state.month = monthStart(today > first ? today : first);

    renderAll();
    bind();

    var form = MZ.$('[data-form="tickets"]');
    if (form) {
      form.mzReset = function () {
        state.session = null;
        DATA.tickets.forEach(function (tk) { state.counts[tk.id] = 0; });
        renderSessions();
        syncCalc();
      };

      MZ.form.init(form, {
        successKey: 'forms.successTickets',
        validate: function () {
          var t = MZ.i18n.t;
          if (!state.date || !state.session) { return t('forms.errors.session'); }
          if (total() === 0) { return t('forms.errors.empty'); }
          return '';
        }
      });
    }

    document.addEventListener('mz:lang', function () {
      renderAll();
    });
  };
})(window, document);
