/* ============================================================================
   ЗОНА ПОЛУНОЧИ — общий интерфейс
   ----------------------------------------------------------------------------
   Меню, аккордеоны, появление блоков, 3D-наклон карточек и переход между
   страницами «вода смыкается».

   Наклон карточек считается в том же кадровом цикле, что и всё остальное,
   и разделён на две фазы: сначала читаем геометрию (в задаче скролла),
   потом только пишем CSS-переменные (в задаче мыши). Смешивать чтение и
   запись в одном проходе — верный способ получить дёрганье.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;

  /* ======================================================== Мобильное меню */
  function initNav() {
    var burger = MZ.$('.burger');
    var nav = MZ.$('.nav');
    if (!burger || !nav) { return; }

    function close() {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !open);
      burger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });

    /* Переключатель языка на узком экране переезжает в меню: в шапке 375
       пикселей его не разместить рядом с логотипом, кнопкой билета и
       бургером. Элемент именно перемещается, а не копируется — две
       одинаковые группы кнопок сбили бы скринридер и клавиатуру. */
    var lang = MZ.$('.lang');
    var side = MZ.$('.header__side');

    function placeLang() {
      if (!lang || !side) { return; }
      var narrow = window.innerWidth < 900;
      if (narrow && lang.parentNode !== nav) {
        nav.appendChild(lang);
        lang.classList.add('lang--in-menu');
      } else if (!narrow && lang.parentNode !== side) {
        side.insertBefore(lang, side.firstChild);
        lang.classList.remove('lang--in-menu');
      }
    }

    placeLang();
    window.addEventListener('resize', placeLang, { passive: true });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { close(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) { close(); }
    }, { passive: true });
  }

  /* ============================================================ Аккордеоны */
  function initAccordions(root) {
    MZ.$$('[data-acc]', root || document).forEach(function (btn) {
      if (btn.dataset.accBound) { return; }
      btn.dataset.accBound = '1';

      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) { return; }

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        MZ.togglePanel(panel, !open);

        var more = btn.querySelector('[data-acc-label]');
        if (more) {
          more.textContent = open ? MZ.i18n.t('common.more') : MZ.i18n.t('common.less');
        }
      });
    });
  }

  /* ====================================================== Плавные переходы */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) { return; }
      var id = link.getAttribute('href').slice(1);
      if (!id) { return; }
      var target = document.getElementById(id);
      if (!target) { return; }
      e.preventDefault();
      MZ.scrollToEl(target);
      /* Фокус переносим руками, иначе клавиатура останется наверху */
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ==========================================================================
     Переход между страницами: тёмная волна снизу вверх и обратно.
     Ссылку перехватываем только если это обычный левый клик по внутренней
     странице — никаких сюрпризов для «открыть в новой вкладке».
     ========================================================================== */
  function initWave() {
    var wave = MZ.$('.wave');
    if (!wave || MZ.reduced) { return; }

    var FLAG = 'mz-wave';

    /* Приход: волна уходит вверх, открывая страницу */
    var came = false;
    try { came = window.sessionStorage.getItem(FLAG) === '1'; } catch (e) { came = false; }
    if (came) {
      try { window.sessionStorage.removeItem(FLAG); } catch (e) { /* пусто */ }
      wave.classList.add('is-active', 'is-out');
      window.setTimeout(function () { wave.classList.remove('is-active', 'is-out'); }, 700);
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }

      var link = e.target.closest('a');
      if (!link) { return; }
      if (link.target && link.target !== '_self') { return; }
      if (link.hasAttribute('download')) { return; }

      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) { return; }

      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) { return; }
      if (url.pathname === window.location.pathname) { return; }

      e.preventDefault();
      try { window.sessionStorage.setItem(FLAG, '1'); } catch (err) { /* пусто */ }

      wave.classList.add('is-active', 'is-in');
      window.setTimeout(function () { window.location.href = url.href; }, 520);
    });
  }

  /* ==========================================================================
     3D-наклон карточек залов + подсветка изнутри.
     Только мышь, только широкий экран, только если движение разрешено.
     ========================================================================== */
  function initTilt() {
    if (!MZ.heavyOk()) { return; }

    var cards = [];
    var rects = [];
    var MAX = 5; /* градусов: больше выглядит как аттракцион, а не как карточка */

    /* Карточки перечитываются при каждом замере: при смене языка сетка залов
       перерисовывается целиком, и список узлов иначе остался бы устаревшим. */
    function measure() {
      cards = MZ.$$('[data-tilt]');
      rects = cards.map(function (card) { return card.getBoundingClientRect(); });
    }

    MZ.onScrollFrame(measure);

    MZ.onPointer(function (p) {
      for (var i = 0; i < cards.length; i++) {
        var r = rects[i];
        if (!r || !r.width) { continue; }

        var inside = p.inside && p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
        var card = cards[i];

        if (!inside) {
          if (card.classList.contains('is-tilting')) {
            card.classList.remove('is-tilting');
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
          }
          continue;
        }

        var nx = (p.x - r.left) / r.width;
        var ny = (p.y - r.top) / r.height;

        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((nx - 0.5) * 2 * MAX).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - ny) * 2 * MAX).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (nx * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (ny * 100).toFixed(1) + '%');
      }
    });

    window.addEventListener('resize', measure, { passive: true });
  }

  /* ==========================================================================
     Хронология: вертикальный скролл переводится в горизонтальный.
     На узком экране и при reduced-motion секция остаётся обычной лентой,
     которую листают пальцем — это честнее, чем ломать нативный скролл.
     ========================================================================== */
  function initTimeline() {
    var root = MZ.$('[data-timeline]');
    if (!root) { return; }

    var track = MZ.$('.timeline__track', root);
    var sticky = MZ.$('.timeline__sticky', root);
    if (!track || !sticky) { return; }

    if (MZ.reduced || MZ.isNarrow()) { return; }

    root.classList.add('timeline--pinned');

    var distance = 0;

    function measure() {
      distance = Math.max(0, track.scrollWidth - sticky.clientWidth + 32);
      /* Высота секции = экран + путь, который нужно проехать вбок */
      root.style.height = (sticky.clientHeight + distance) + 'px';
    }

    function onScroll() {
      var rect = root.getBoundingClientRect();
      var total = root.offsetHeight - sticky.clientHeight;
      if (total <= 0) { return; }
      var p = MZ.clamp(-rect.top / total, 0, 1);
      track.style.transform = 'translate3d(' + (-p * distance).toFixed(1) + 'px,0,0)';
    }

    measure();
    MZ.onScrollFrame(onScroll);
    window.addEventListener('resize', function () { measure(); MZ.invalidate(); }, { passive: true });
    document.addEventListener('mz:lang', function () {
      window.setTimeout(function () { measure(); MZ.invalidate(); }, 0);
    });
  }

  /* ==================================================================== Старт */
  function boot() {
    MZ.i18n.init();

    initNav();
    initAnchors();
    initWave();
    initAccordions();
    MZ.observeReveal();
    MZ.observeCounters();

    /* Модули страниц объявляют себя в MZ.pages и запускаются здесь, после
       того как язык уже применён — иначе они отрисуют пустые строки. */
    var page = document.body.getAttribute('data-page');
    if (MZ.pages && MZ.pages[page]) { MZ.pages[page](); }

    initTilt();
    initTimeline();
  }

  MZ.ui = { accordions: initAccordions, tilt: initTilt };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
