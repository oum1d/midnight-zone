/* ============================================================================
   ЗОНА ПОЛУНОЧИ — движок трёх языков
   ----------------------------------------------------------------------------
   В разметке стоят только ключи:
       <h1 data-i18n="halls.h1"></h1>
       <input data-i18n-attr="placeholder:forms.namePh">
       <button data-i18n-attr="aria-label:nav.close"></button>

   Порядок определения языка:
       1) ?lang= в адресе   2) сохранённый выбор   3) язык браузера   4) pl

   Переключение происходит без перезагрузки: динамические блоки (залы,
   календарь, формы) слушают событие mz:lang и перерисовывают себя сами.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;
  var DICT = window.MZ_LANG || {};
  var ORDER = ['pl', 'ru', 'en'];
  var STORE_KEY = 'mz-lang';
  var FALLBACK = 'pl';

  var current = FALLBACK;

  /* ------------------------------------------------- Достать по пути ----- */
  function dig(obj, path) {
    var parts = path.split('.');
    var node = obj;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) { return undefined; }
      node = node[parts[i]];
    }
    return node;
  }

  /* Значение по ключу с откатом на польский, если перевод потерян */
  function t(path) {
    var v = dig(DICT[current], path);
    if (v === undefined) { v = dig(DICT[FALLBACK], path); }
    return v === undefined ? '' : v;
  }

  /* --------------------------------------------------- Выбор языка ------- */
  function detect() {
    var byUrl = null;
    try {
      byUrl = new URLSearchParams(window.location.search).get('lang');
    } catch (e) { byUrl = null; }
    if (byUrl && DICT[byUrl]) { return byUrl; }

    var saved = MZ.store.get(STORE_KEY);
    if (saved && DICT[saved]) { return saved; }

    /* Языки системы целиком, а не только первый: в Польше обычна настройка
       «uk, pl, en», и второй язык списка подходит лучше запасного. */
    var nav = window.navigator;
    var list = (nav.languages && nav.languages.length) ? nav.languages : [nav.language || ''];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i] || '').slice(0, 2).toLowerCase();
      /* Украиноязычным и белорусскоязычным посетителям ближе русский интерфейс */
      if ((code === 'uk' || code === 'be') && DICT.ru) { return 'ru'; }
      if (DICT[code]) { return code; }
    }

    return FALLBACK;
  }

  /* ------------------------------------------------------- Применить ---- */
  function applyText(root) {
    MZ.$$('[data-i18n]', root).forEach(function (el) {
      var value = t(el.getAttribute('data-i18n'));
      if (typeof value === 'string') { el.textContent = value; }
    });

    MZ.$$('[data-i18n-attr]', root).forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var idx = pair.indexOf(':');
        if (idx < 0) { return; }
        var attr = pair.slice(0, idx).trim();
        var value = t(pair.slice(idx + 1).trim());
        if (typeof value === 'string' && attr) { el.setAttribute(attr, value); }
      });
    });
  }

  function applyMeta() {
    var page = document.body.getAttribute('data-page') || 'home';
    var title = t('pages.' + page + 'Title');
    var desc = t('pages.' + page + 'Desc');

    if (title) { document.title = title; }

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:locale', localeTag(current));
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
  }

  function localeTag(code) {
    return code === 'pl' ? 'pl_PL' : (code === 'ru' ? 'ru_RU' : 'en_GB');
  }

  function setMeta(kind, key, value) {
    if (!value) { return; }
    var el = document.head.querySelector('meta[' + kind + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(kind, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  function syncButtons() {
    MZ.$$('[data-lang-btn]').forEach(function (btn) {
      var on = btn.getAttribute('data-lang-btn') === current;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* Адрес обновляем только на http(s): на file:// history.replaceState
     с изменённым query-параметром браузеры отклоняют. */
  function syncUrl() {
    if (window.location.protocol === 'file:') { return; }
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', current);
      window.history.replaceState({}, '', url);
    } catch (e) { /* не критично */ }
  }

  function set(code, save) {
    if (!DICT[code]) { return; }
    current = code;

    var meta = DICT[code]._meta || {};
    document.documentElement.lang = meta.htmlLang || code;

    applyText(document);
    applyMeta();
    syncButtons();

    if (save) {
      MZ.store.set(STORE_KEY, code);
      syncUrl();
    }

    document.dispatchEvent(new CustomEvent('mz:lang', { detail: { lang: code } }));
  }

  /* ------------------------------------------------------------ Старт --- */
  function init() {
    MZ.$$('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        set(btn.getAttribute('data-lang-btn'), true);
      });
    });

    set(detect(), false);
    document.documentElement.classList.remove('mz-boot');
  }

  MZ.i18n = {
    t: t,
    set: set,
    apply: applyText,
    get lang() { return current; },
    order: ORDER,
    init: init
  };
})(window, document);
