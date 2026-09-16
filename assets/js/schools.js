/* ============================================================================
   ЗОНА ПОЛУНОЧИ — страница для школ
   ----------------------------------------------------------------------------
   Эта страница намеренно спокойная: ни погружения, ни свечения, ни наклонов.
   Учителю нужны возраст, длительность, цена и форма заявки — а не аттракцион.
   Контраст подачи здесь такая же часть замысла, как темнота на главной.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;
  var DATA = window.EXHIBITION;

  function renderPrograms() {
    var body = MZ.$('[data-programs]');
    if (!body) { return; }
    var t = MZ.i18n.t;

    body.textContent = '';
    DATA.programs.forEach(function (p) {
      var tr = document.createElement('tr');

      var name = document.createElement('td');
      var strong = document.createElement('strong');
      strong.textContent = t('schools.programs.' + p.slug + '.title');
      var desc = document.createElement('div');
      desc.style.color = 'var(--c-day-dim)';
      desc.style.marginTop = '4px';
      desc.textContent = t('schools.programs.' + p.slug + '.desc');
      name.appendChild(strong);
      name.appendChild(desc);

      var age = document.createElement('td');
      age.className = 'num';
      age.textContent = p.ageFrom + '–' + p.ageTo;

      var dur = document.createElement('td');
      dur.className = 'num';
      dur.textContent = p.minutes + ' ' + t('common.min');

      var price = document.createElement('td');
      price.className = 'num';
      price.textContent = p.price + ' ' + t('common.currency');

      tr.appendChild(name);
      tr.appendChild(age);
      tr.appendChild(dur);
      tr.appendChild(price);
      body.appendChild(tr);
    });
  }

  function renderList(selector, key) {
    var list = MZ.$(selector);
    if (!list) { return; }
    list.textContent = '';
    (MZ.i18n.t(key) || []).forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function renderFiles() {
    var box = MZ.$('[data-files]');
    if (!box) { return; }
    var t = MZ.i18n.t;

    box.textContent = '';
    (t('schools.files') || []).forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'file';

      var info = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'file__name';
      name.textContent = f.name;
      var meta = document.createElement('div');
      meta.className = 'file__meta';
      meta.textContent = f.meta;
      info.appendChild(name);
      info.appendChild(meta);

      /* Файла нет — значит, и ссылки нет. Ссылка в никуда хуже честной
         подписи: человек нажмёт и получит ошибку. */
      var stub = document.createElement('div');
      stub.className = 'file__stub';
      stub.textContent = t('schools.fileStub');

      row.appendChild(info);
      row.appendChild(stub);
      box.appendChild(row);
    });
  }

  function renderProgramOptions() {
    var select = MZ.$('[data-program-select]');
    if (!select) { return; }
    var t = MZ.i18n.t;
    var chosen = select.value;

    select.textContent = '';
    DATA.programs.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.slug;
      opt.textContent = t('schools.programs.' + p.slug + '.title') +
                        ' (' + p.ageFrom + '–' + p.ageTo + ' ' + t('schools.years') + ')';
      select.appendChild(opt);
    });
    if (chosen) { select.value = chosen; }
  }

  function renderAll() {
    renderPrograms();
    renderList('[data-bring]', 'schools.bring');
    renderFiles();
    renderProgramOptions();
  }

  MZ.pages = MZ.pages || {};
  MZ.pages.schools = function () {
    renderAll();

    var form = MZ.$('[data-form="school"]');
    if (form) {
      MZ.form.init(form, { successKey: 'forms.successSchool' });
    }

    document.addEventListener('mz:lang', renderAll);
  };
})(window, document);
