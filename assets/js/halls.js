/* ============================================================================
   ЗОНА ПОЛУНОЧИ — страница залов
   ----------------------------------------------------------------------------
   Карточки и хронология собираются из данных, а не пишутся руками в разметке:
   двенадцать залов на трёх языках — это 36 блоков, которые иначе разъедутся
   при первой же правке.

   Весь текст вставляется через textContent. innerHTML используется только для
   собственных SVG-иконок — то есть никогда для данных, которые могут прийти
   извне. Это осознанная граница, а не случайность.
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;

  function two(n) { return n < 10 ? '0' + n : String(n); }

  /* Заглушка на случай, если файла фото нет: номер зала на приборной сетке */
  function photoStub(hall) {
    var stub = document.createElement('div');
    stub.className = 'stub';
    var num = document.createElement('span');
    num.className = 'stub__num';
    num.textContent = two(hall.n);
    var note = document.createElement('span');
    note.className = 'stub__note';
    note.textContent = MZ.i18n.t('halls.photoStub');
    stub.appendChild(num);
    stub.appendChild(note);
    return stub;
  }

  /* Ссылка наружу. Адреса берутся из собственного файла данных, но проверка
     протокола всё равно стоит: javascript: в href не должен пройти никогда. */
  function externalLink(href, text) {
    if (!/^https:\/\//i.test(href || '')) {
      var span = document.createElement('span');
      span.textContent = text;
      return span;
    }
    var a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = text;
    return a;
  }

  /* «Фото: автор · лицензия» — обязательная подпись для CC BY и CC BY-SA */
  function creditLine(slug, className) {
    var cr = (window.EXHIBITION.photoCredits || {})[slug];
    if (!cr) { return null; }
    var line = document.createElement('p');
    line.className = className;
    line.appendChild(document.createTextNode(MZ.i18n.t('halls.photoBy') + ': '));
    line.appendChild(externalLink(cr.source, cr.author || 'Wikimedia Commons'));
    line.appendChild(document.createTextNode(' · '));
    line.appendChild(externalLink(cr.licenseUrl, cr.license));
    return line;
  }

  /* ------------------------------------------------------- Карточка зала -- */
  function hallCard(hall) {
    var t = MZ.i18n.t;
    var slug = hall.slug;

    var card = document.createElement('article');
    card.className = 'hall reveal' + (hall.dark ? ' hall--dark' : '');
    card.setAttribute('data-tilt', '');

    /* Фото зала. Два размера: 600 px для обычных экранов, 1200 px для ретины
       и широкой сетки — браузер выбирает сам по srcset. Пропорция 4:3 задана
       и атрибутами, и в CSS, поэтому ленивая подгрузка ничего не сдвигает.
       Если файла нет, вместо пустой рамки встаёт заглушка с номером зала. */
    var media = document.createElement('div');
    media.className = 'hall__media';
    var base = 'assets/img/halls/' + slug;
    var img = document.createElement('img');
    img.className = 'hall__photo';
    img.src = base + '-sm.jpg';
    img.srcset = base + '-sm.jpg 600w, ' + base + '-lg.jpg 1200w';
    img.sizes = '(min-width: 1000px) 360px, (min-width: 640px) 46vw, 92vw';
    img.width = 600;
    img.height = 450;
    img.loading = 'lazy';
    img.decoding = 'async';
    /* Название зала стоит прямо под снимком, повторять его в alt незачем:
       скринридер прочитал бы одно и то же дважды */
    img.alt = '';
    img.addEventListener('error', function () {
      media.replaceChild(photoStub(hall), img);
    });
    media.appendChild(img);

    var head = document.createElement('div');
    head.className = 'hall__head';
    var num = document.createElement('span');
    num.className = 'hall__num';
    num.textContent = t('halls.hall') + ' ' + two(hall.n);
    head.appendChild(num);

    var title = document.createElement('h3');
    title.className = 'hall__title';
    title.textContent = t('halls.items.' + slug + '.title');

    var panelId = 'hall-panel-' + slug;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hall__toggle';
    toggle.setAttribute('data-acc', '');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', panelId);
    var toggleLabel = document.createElement('span');
    toggleLabel.setAttribute('data-acc-label', '');
    toggleLabel.textContent = t('common.more');
    toggle.appendChild(toggleLabel);

    var panel = document.createElement('div');
    panel.className = 'hall__panel';
    panel.id = panelId;
    var inner = document.createElement('div');
    inner.className = 'hall__panel-inner';
    var p = document.createElement('p');
    p.textContent = t('halls.items.' + slug + '.desc');
    inner.appendChild(p);
    var credit = creditLine(slug, 'hall__credit');
    if (credit) { inner.appendChild(credit); }
    panel.appendChild(inner);

    card.appendChild(media);
    card.appendChild(head);
    card.appendChild(title);
    card.appendChild(toggle);
    card.appendChild(panel);
    return card;
  }

  function renderHalls() {
    var grid = MZ.$('[data-halls]');
    if (!grid) { return; }
    grid.textContent = '';
    window.EXHIBITION.halls.forEach(function (hall) {
      grid.appendChild(hallCard(hall));
    });
    MZ.ui.accordions(grid);
    MZ.observeReveal(grid);
  }

  /* ------------------------------------------------- Список правил зала 7 -- */
  function renderWarnList() {
    var list = MZ.$('[data-warn-list]');
    if (!list) { return; }
    list.textContent = '';
    (MZ.i18n.t('halls.warnList') || []).forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
  }

  /* ---------------------------------------------------------- Хронология -- */
  function renderTimeline() {
    var track = MZ.$('[data-timeline-track]');
    if (!track) { return; }
    var t = MZ.i18n.t;

    track.textContent = '';
    window.EXHIBITION.timeline.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'timeline__card';

      var year = document.createElement('div');
      year.className = 'timeline__year mono';
      year.textContent = String(item.year);

      var name = document.createElement('h3');
      name.className = 'timeline__name';
      name.textContent = t('timeline.items.' + item.slug + '.name');

      var meta = document.createElement('div');
      meta.className = 'timeline__meta';
      meta.textContent = t('timeline.depthLabel') + ' ' + MZ.formatInt(item.depth) + ' ' +
                         t('common.metres') + ' · ' + t('timeline.crewLabel') + ': ' +
                         t('timeline.items.' + item.slug + '.crew');

      var note = document.createElement('p');
      note.className = 'timeline__note';
      note.textContent = t('timeline.items.' + item.slug + '.note');

      card.appendChild(year);
      card.appendChild(name);
      card.appendChild(meta);
      card.appendChild(note);
      track.appendChild(card);
    });
  }

  /* ------------------------------------------------- Список авторов фото -- */
  function renderCredits() {
    var box = MZ.$('[data-credits]');
    if (!box) { return; }
    var credits = window.EXHIBITION.photoCredits || {};
    var source = window.EXHIBITION.photoSource || 'none';
    var section = box.closest('section');
    var title = MZ.$('[data-credits-title]', section);
    var note = MZ.$('[data-credits-note]', section);

    box.textContent = '';

    /* Три случая, их решает prepare-photos.ps1:
       commons   — чужие свободные фото, список авторов обязателен;
       generated — визуализация нейросетью, об этом сказано прямо, чтобы
                   никто не принял картинки за фото настоящих залов;
       none      — в карточках заглушки, раздел не нужен. */
    if (section) { section.hidden = (source === 'none'); }
    if (title) { title.textContent = MZ.i18n.t(source === 'generated' ? 'halls.imagesTitle' : 'halls.creditsTitle'); }
    if (note) { note.textContent = MZ.i18n.t(source === 'generated' ? 'halls.generatedNote' : 'halls.creditsNote'); }
    if (source !== 'commons') { return; }
    window.EXHIBITION.halls.forEach(function (hall) {
      var line = creditLine(hall.slug, 'credits__row');
      if (!line) { return; }
      var label = document.createElement('span');
      label.className = 'credits__hall';
      label.textContent = MZ.i18n.t('halls.hall') + ' ' + two(hall.n) + ' · ' +
                          MZ.i18n.t('halls.items.' + hall.slug + '.title');
      line.insertBefore(label, line.firstChild);
      box.appendChild(line);
    });
  }

  function renderAll() {
    renderHalls();
    renderWarnList();
    renderTimeline();
    renderCredits();
  }

  MZ.pages = MZ.pages || {};
  MZ.pages.halls = function () {
    renderAll();
    document.addEventListener('mz:lang', renderAll);
  };
})(window, document);
