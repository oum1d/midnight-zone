/* ============================================================================
   ЗОНА ПОЛУНОЧИ — общие утилиты
   ----------------------------------------------------------------------------
   Здесь живут три вещи, от которых зависит плавность всего сайта:

   1. Один rAF-цикл на страницу вместо десятка отдельных.
   2. Один обработчик скролла и один обработчик мыши — оба только ставят флаг,
      а вся работа делается в кадре. В самих обработчиках не читается ни одно
      свойство, вызывающее пересчёт вёрстки.
   3. Флаги окружения (reduced motion, тач, узкий экран) — считаются один раз
      и решают, включать ли тяжёлые эффекты.

   Файл подключается первым и ни от чего не зависит.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = {};

  /* ----------------------------------------------------------- Выборка --- */
  MZ.$ = function (sel, root) { return (root || document).querySelector(sel); };
  MZ.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------ Числа ---- */
  MZ.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  MZ.lerp = function (a, b, t) { return a + (b - a) * t; };

  MZ.hexToRgb = function (hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) { h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; }
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  MZ.mixRgb = function (a, b, t) {
    return 'rgb(' + Math.round(MZ.lerp(a[0], b[0], t)) + ',' +
                    Math.round(MZ.lerp(a[1], b[1], t)) + ',' +
                    Math.round(MZ.lerp(a[2], b[2], t)) + ')';
  };

  /* Глубина как показание прибора: −04 210 м, всегда пять разрядов */
  MZ.formatDepth = function (metres) {
    var v = Math.max(0, Math.round(metres));
    var s = String(v);
    while (s.length < 5) { s = '0' + s; }
    return '−' + s.slice(0, 2) + ' ' + s.slice(2);
  };

  MZ.formatInt = function (v) {
    return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  /* ------------------------------------------------------- Окружение ----- */
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  MZ.reduced = mqReduce ? mqReduce.matches : false;

  var mqFine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
  MZ.finePointer = mqFine ? mqFine.matches : true;

  MZ.isNarrow = function () { return window.innerWidth < 900; };

  /* Тяжёлые эффекты — фонарь, 3D-наклон, много частиц — только там, где есть
     мышь и разрешено движение. На телефоне они не мучают батарею. */
  MZ.heavyOk = function () { return !MZ.reduced && MZ.finePointer && !MZ.isNarrow(); };

  if (mqReduce && mqReduce.addEventListener) {
    mqReduce.addEventListener('change', function (e) {
      MZ.reduced = e.matches;
      /* Перезагрузка честнее, чем попытка на лету разобрать половину эффектов:
         пользователь меняет эту настройку раз в жизни. */
      window.location.reload();
    });
  }

  /* ------------------------------------------------------- Хранилище ----- */
  MZ.store = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* приватный режим */ }
    }
  };

  /* ==========================================================================
     Единый кадровый цикл
     ========================================================================== */
  var loopTasks = [];
  var scrollTasks = [];
  var pointerTasks = [];

  var frameId = 0;
  var scrollPending = false;
  var pointerPending = false;
  var visible = true;

  MZ.pointer = { x: 0, y: 0, inside: false };
  MZ.scrollY = 0;

  function frame(now) {
    frameId = 0;

    if (scrollPending) {
      scrollPending = false;
      MZ.scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      for (var i = 0; i < scrollTasks.length; i++) { scrollTasks[i](MZ.scrollY); }
    }

    if (pointerPending) {
      pointerPending = false;
      for (var j = 0; j < pointerTasks.length; j++) { pointerTasks[j](MZ.pointer); }
    }

    for (var k = 0; k < loopTasks.length; k++) { loopTasks[k](now); }

    if (loopTasks.length && visible) { request(); }
  }

  function request() {
    if (!frameId) { frameId = window.requestAnimationFrame(frame); }
  }

  /* Постоянный цикл: только для частиц. Останавливается, когда вкладка скрыта. */
  MZ.addLoop = function (fn) {
    loopTasks.push(fn);
    request();
  };

  /* Работа по скроллу. Слушатель только ставит флаг — ни чтения размеров,
     ни расчётов в нём нет. Всё остальное происходит в кадре. */
  MZ.onScrollFrame = function (fn) {
    scrollTasks.push(fn);
    if (scrollTasks.length === 1) {
      window.addEventListener('scroll', markScroll, { passive: true });
      window.addEventListener('resize', markScroll, { passive: true });
      window.addEventListener('orientationchange', markScroll, { passive: true });
    }
    markScroll();
  };

  function markScroll() { scrollPending = true; request(); }
  MZ.invalidate = markScroll;

  /* Один обработчик мыши на всю страницу: им пользуются и фонарь, и наклон
     карточек. Два отдельных слушателя на mousemove — самый быстрый способ
     потерять кадры. */
  MZ.onPointer = function (fn) {
    pointerTasks.push(fn);
    if (pointerTasks.length === 1) {
      window.addEventListener('mousemove', markPointer, { passive: true });
      window.addEventListener('mouseleave', pointerOut, { passive: true });
    }
  };

  function markPointer(e) {
    MZ.pointer.x = e.clientX;
    MZ.pointer.y = e.clientY;
    MZ.pointer.inside = true;
    pointerPending = true;
    request();
  }

  function pointerOut() {
    MZ.pointer.inside = false;
    pointerPending = true;
    request();
  }

  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible) { request(); }
  });

  /* ==========================================================================
     Появление по мере прокрутки
     ========================================================================== */
  MZ.observeReveal = function (root) {
    var nodes = MZ.$$('.reveal, .reveal-child', root || document);
    if (!nodes.length) { return; }

    if (MZ.reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    nodes.forEach(function (n) { io.observe(n); });
  };

  /* Ступенчатая задержка для детей контейнера .reveal-child */
  MZ.stagger = function (container, step) {
    MZ.$$(':scope > *', container).forEach(function (el, i) {
      el.style.transitionDelay = (i * (step || 60)) + 'ms';
    });
  };

  /* ==========================================================================
     Счётчики: число отсчитывается от нуля, когда блок появляется в кадре
     ========================================================================== */
  MZ.countUp = function (el, to, duration) {
    var dur = duration || 900;
    if (MZ.reduced) { el.textContent = MZ.formatInt(to); return; }

    var start = 0;
    var t0 = 0;

    function step(now) {
      if (!t0) { t0 = now; }
      var p = MZ.clamp((now - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = MZ.formatInt(MZ.lerp(start, to, eased));
      if (p < 1) { window.requestAnimationFrame(step); }
    }
    window.requestAnimationFrame(step);
  };

  MZ.observeCounters = function (root) {
    var nodes = MZ.$$('[data-count-to]', root || document);
    if (!nodes.length) { return; }

    if (MZ.reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.textContent = MZ.formatInt(parseFloat(n.dataset.countTo)); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        MZ.countUp(entry.target, parseFloat(entry.target.dataset.countTo));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    nodes.forEach(function (n) { n.textContent = '0'; io.observe(n); });
  };

  /* ==========================================================================
     Мелочи
     ========================================================================== */

  /* Плавная прокрутка к элементу с учётом высоты шапки */
  MZ.scrollToEl = function (el) {
    if (!el) { return; }
    var header = document.querySelector('.header');
    var offset = header ? header.offsetHeight : 0;
    var top = el.getBoundingClientRect().top + (window.pageYOffset || 0) - offset - 8;
    window.scrollTo({ top: top, behavior: MZ.reduced ? 'auto' : 'smooth' });
  };

  /* Анимация высоты для аккордеонов: от текущей к авто и обратно.
     Height анимируется только здесь и только на раскрытии — это не кадровая
     анимация, а разовый переход, поэтому layout-стоимость допустима. */
  MZ.togglePanel = function (panel, open) {
    /* visibility переключается вместе с высотой: свёрнутая панель должна
       исчезать и для скринридера, а не только визуально. */
    if (MZ.reduced) {
      panel.style.height = open ? 'auto' : '0px';
      panel.style.visibility = open ? 'visible' : 'hidden';
      return;
    }

    if (open) {
      panel.style.visibility = 'visible';
      var h = panel.firstElementChild ? panel.firstElementChild.offsetHeight : 0;
      panel.style.height = h + 'px';
      var done = function () {
        panel.style.height = 'auto';
        panel.removeEventListener('transitionend', done);
      };
      panel.addEventListener('transitionend', done);
    } else {
      var cur = panel.firstElementChild ? panel.firstElementChild.offsetHeight : 0;
      panel.style.height = cur + 'px';
      /* Принудительное чтение, иначе браузер склеит два значения в одно
         и перехода не будет */
      void panel.offsetHeight;
      panel.style.height = '0px';
      var hide = function () {
        panel.style.visibility = 'hidden';
        panel.removeEventListener('transitionend', hide);
      };
      panel.addEventListener('transitionend', hide);
    }
  };

  window.MZ = MZ;
})(window, document);
