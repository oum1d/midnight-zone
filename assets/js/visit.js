/* ============================================================================
   ЗОНА ПОЛУНОЧИ — как добраться и частые вопросы
   ----------------------------------------------------------------------------
   FAQ собирается из словаря: восемь вопросов на трёх языках руками в разметке
   превратились бы в 24 блока, которые невозможно держать в синхроне.
   Аккордеон — кнопка + панель с aria-expanded, а не <details>: нужна
   анимация высоты и одинаковое поведение во всех браузерах.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;

  function renderTransport() {
    var list = MZ.$('[data-transport]');
    if (!list) { return; }
    list.textContent = '';
    (MZ.i18n.t('visit.transport') || []).forEach(function (item) {
      var li = document.createElement('li');
      var name = document.createElement('b');
      name.textContent = item.name;
      var text = document.createElement('span');
      text.textContent = item.text;
      li.appendChild(name);
      li.appendChild(text);
      list.appendChild(li);
    });
  }

  function renderFaq() {
    var box = MZ.$('[data-faq]');
    if (!box) { return; }

    box.textContent = '';
    (MZ.i18n.t('visit.faq') || []).forEach(function (item, i) {
      var wrap = document.createElement('div');
      wrap.className = 'acc__item';

      var id = 'faq-panel-' + i;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'acc__btn';
      btn.setAttribute('data-acc', '');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', id);
      btn.textContent = item.q;

      var panel = document.createElement('div');
      panel.className = 'acc__panel';
      panel.id = id;
      var inner = document.createElement('div');
      inner.className = 'acc__panel-inner';
      var p = document.createElement('p');
      p.textContent = item.a;
      inner.appendChild(p);
      panel.appendChild(inner);

      wrap.appendChild(btn);
      wrap.appendChild(panel);
      box.appendChild(wrap);
    });

    MZ.ui.accordions(box);
  }

  function renderAll() {
    renderTransport();
    renderFaq();
  }

  MZ.pages = MZ.pages || {};
  MZ.pages.visit = function () {
    renderAll();

    var form = MZ.$('[data-form="question"]');
    if (form) {
      MZ.form.init(form, { successKey: 'forms.successQuestion' });
    }

    document.addEventListener('mz:lang', renderAll);
  };

  /* ------------------------------------------------------------ Политика -- */
  MZ.pages.privacy = function () {
    function render() {
      var box = MZ.$('[data-privacy]');
      if (!box) { return; }
      box.textContent = '';
      (MZ.i18n.t('privacy.sections') || []).forEach(function (s) {
        var h = document.createElement('h2');
        h.textContent = s.h;
        var p = document.createElement('p');
        p.textContent = s.p;
        box.appendChild(h);
        box.appendChild(p);
      });
    }
    render();
    document.addEventListener('mz:lang', render);
  };
})(window, document);
