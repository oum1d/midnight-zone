/* ============================================================================
   ЗОНА ПОЛУНОЧИ — формы
   ----------------------------------------------------------------------------
   Бэкенда у сайта нет, поэтому отправлять данные некуда — и форма честно
   об этом говорит вместо того, чтобы изображать успешную отправку.

   Что здесь всё-таки сделано по-настоящему:
     · валидация с понятными сообщениями и переводом ошибок;
     · aria-invalid, aria-describedby и перевод фокуса на первое битое поле;
     · honeypot-поле, невидимое человеку, — дешёвый фильтр простых ботов;
     · ограничение частоты отправки;
     · никакой вставки пользовательского текста через innerHTML.

   Когда появится сервер: заменить sendDemo() на fetch к своему эндпоинту,
   продублировать ВСЮ валидацию на сервере, добавить CSRF-токен и лимит
   запросов по IP. Клиентская проверка — это удобство, а не защита.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;
  var RATE_MS = 30000;
  var lastSent = 0;

  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var RE_PHONE = /^[+\d][\d\s()\-]{6,20}$/;

  function errorNode(field) {
    return field.parentNode.querySelector('.field__error');
  }

  function setError(input, message) {
    var wrap = input.closest('.field') || input.parentNode;
    var box = wrap.querySelector('.field__error');
    if (box) { box.textContent = message || ''; }
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (box && box.id) { input.setAttribute('aria-describedby', box.id); }
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function validateField(input) {
    var t = MZ.i18n.t;
    var value = (input.value || '').trim();
    var type = input.getAttribute('type');

    if (input.hasAttribute('required')) {
      if (input.type === 'checkbox' && !input.checked) {
        return input.name === 'consent' ? t('forms.errors.consent') : t('forms.errors.required');
      }
      if (input.type !== 'checkbox' && !value) { return t('forms.errors.required'); }
    }

    if (!value) { return ''; }

    if (type === 'email' && !RE_EMAIL.test(value)) { return t('forms.errors.email'); }
    if (type === 'tel' && !RE_PHONE.test(value)) { return t('forms.errors.phone'); }

    if (type === 'number') {
      var num = Number(value);
      if (isNaN(num)) { return t('forms.errors.number'); }
      var min = input.getAttribute('min');
      var max = input.getAttribute('max');
      if ((min !== null && num < Number(min)) || (max !== null && num > Number(max))) {
        return t('forms.errors.range');
      }
    }

    if (type === 'date') {
      var meta = window.EXHIBITION.meta;
      if (value < meta.dateFrom || value > meta.dateTo) { return t('forms.errors.date'); }
    }

    return '';
  }

  function showSuccess(form, key) {
    var box = form.parentNode.querySelector('[data-success]');
    if (!box) { return; }

    var title = box.querySelector('[data-success-title]');
    var text = box.querySelector('[data-success-text]');
    if (title) { title.textContent = MZ.i18n.t('forms.successTitle'); }
    if (text) { text.textContent = MZ.i18n.t(key); }

    form.hidden = true;
    box.hidden = false;
    box.setAttribute('tabindex', '-1');
    box.focus({ preventScroll: false });

    var again = box.querySelector('[data-success-again]');
    if (again) {
      again.textContent = MZ.i18n.t('forms.successAgain');
      again.onclick = function () {
        box.hidden = true;
        form.hidden = false;
        form.reset();
        MZ.$$('[aria-invalid]', form).forEach(function (el) { setError(el, ''); });
        var alertBox = form.querySelector('[data-form-alert]');
        if (alertBox) { alertBox.hidden = true; }
        if (typeof form.mzReset === 'function') { form.mzReset(); }
        form.querySelector('input, select, textarea').focus();
      };
    }
  }

  /* --------------------------------------------------------------- Инит --- */
  function init(form, options) {
    if (!form) { return; }
    var opts = options || {};

    /* Мгновенная проверка только после первой неудачной отправки: ругаться
       на поле, которое человек ещё заполняет, — плохой тон. */
    var touched = false;

    MZ.$$('input, select, textarea', form).forEach(function (input) {
      input.addEventListener('blur', function () {
        if (!touched) { return; }
        setError(input, validateField(input));
      });
      input.addEventListener('input', function () {
        if (!touched) { return; }
        if (input.getAttribute('aria-invalid') === 'true') { setError(input, validateField(input)); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      touched = true;

      var alertBox = form.querySelector('[data-form-alert]');
      if (alertBox) { alertBox.hidden = true; }

      /* Honeypot: настоящий человек это поле не видит и не заполняет */
      var trap = form.querySelector('.hp input');
      if (trap && trap.value) { return; }

      var now = Date.now();
      if (now - lastSent < RATE_MS) {
        if (alertBox) { alertBox.textContent = MZ.i18n.t('forms.errors.tooFast'); alertBox.hidden = false; }
        return;
      }

      var first = null;
      MZ.$$('input, select, textarea', form).forEach(function (input) {
        if (input.closest('.hp')) { return; }
        var message = validateField(input);
        setError(input, message);
        if (message && !first) { first = input; }
      });

      /* Дополнительная проверка страницы: например, выбран ли сеанс */
      if (!first && typeof opts.validate === 'function') {
        var extra = opts.validate();
        if (extra) {
          if (alertBox) { alertBox.textContent = extra; alertBox.hidden = false; }
          return;
        }
      }

      if (first) {
        if (alertBox) { alertBox.textContent = MZ.i18n.t('forms.errors.summary'); alertBox.hidden = false; }
        first.focus();
        return;
      }

      lastSent = now;
      showSuccess(form, opts.successKey || 'forms.successQuestion');
    });

    /* При смене языка уже показанные ошибки нужно перевести */
    document.addEventListener('mz:lang', function () {
      if (!touched) { return; }
      MZ.$$('[aria-invalid="true"]', form).forEach(function (input) {
        setError(input, validateField(input));
      });
    });
  }

  MZ.form = { init: init, validateField: validateField, setError: setError, errorNode: errorNode };
})(window, document);
