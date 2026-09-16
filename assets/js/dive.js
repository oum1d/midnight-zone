/* ============================================================================
   ЗОНА ПОЛУНОЧИ — погружение
   ----------------------------------------------------------------------------
   Что здесь происходит:

   1. Глубина считается не от «процента страницы», а от положения самих сцен.
      Центр экрана попадает в сцену «4000 м» — на счётчике ровно 4000, а фон
      ровно #08192B. Если сцены поменяют высоту, синхронность не сломается.
   2. Все обновления идут одной функцией в одном кадре: фон, счётчик, шкала,
      трос, существа, фонарь. Пишутся только цвет, opacity и transform.
   3. Частицы живут в отдельном постоянном цикле на canvas: их число зависит
      от ширины экрана и от того, разрешено ли движение.

   Прелоадер не задерживает контент дольше 600 мс — это верхняя граница,
   а не «сколько получится».
   ============================================================================ */
(function (window, document) {
  'use strict';

  var MZ = window.MZ;

  /* ==========================================================================
     Прелоадер: трос уходит вниз, проценты моноширинными цифрами
     ========================================================================== */
  function initPreloader() {
    var pre = MZ.$('.preloader');
    if (!pre) { return; }

    if (MZ.reduced) { pre.remove(); return; }

    var num = MZ.$('.preloader__num', pre);
    var skip = MZ.$('.preloader__skip', pre);
    var LIMIT = 600;
    var start = performance.now();
    var done = false;

    function finish() {
      if (done) { return; }
      done = true;
      pre.classList.add('is-done');
      window.setTimeout(function () { if (pre.parentNode) { pre.remove(); } }, 460);
    }

    function tick(now) {
      var p = MZ.clamp((now - start) / LIMIT, 0, 1);
      if (num) { num.textContent = String(Math.round(p * 100)) + '%'; }
      if (p < 1 && !done) { window.requestAnimationFrame(tick); }
      else { finish(); }
    }

    window.requestAnimationFrame(tick);
    if (skip) { skip.addEventListener('click', finish); }
    /* Страховка: что бы ни случилось со шрифтами или картинками, экран
       освобождается по таймеру. Прелоадер не должен уметь «залипнуть». */
    window.setTimeout(finish, LIMIT + 120);
  }

  /* ==========================================================================
     Существа в фоне погружения — линейные иллюстрации в PNG.

     Исходники 2048 px на белом фоне готовит скрипт tools/prepare-creatures.ps1:
     срезает фон, перекрашивает линии в циан сайта и уменьшает до 520 px.
     Свечение добавляется через CSS, а не запекается в картинку — так оно
     одинаковое у всех. Ширина и высота нужны, чтобы браузер заранее знал
     пропорции и ничего не прыгало при подгрузке.
     ========================================================================== */
  var IMAGES = {
    fish:      { src: 'assets/img/creatures/fish.png',      w: 520, h: 168 },
    jellyfish: { src: 'assets/img/creatures/jellyfish.png', w: 502, h: 520 },
    seahorse:  { src: 'assets/img/creatures/seahorse.png',  w: 265, h: 520 },
    manta:     { src: 'assets/img/creatures/manta.png',     w: 519, h: 520 },
    crab:      { src: 'assets/img/creatures/crab.png',      w: 520, h: 499 },
    octopus:   { src: 'assets/img/creatures/octopus.png',   w: 520, h: 518 }
  };

  /* Кто на какой глубине живёт. x и y — доля экрана, size — доля ширины.
     Существо видно в пределах ±1600 м от своей глубины, поэтому соседей по
     глубине разнесли по экрану, чтобы они не наезжали друг на друга.
     m: 1 — оставлять на телефоне: там существ вдвое меньше. */
  var CREATURES = [
    { shape: 'fish',      depth: 100,   x: 8,  y: 26, size: 15,  glow: false, dur: 30, delay: 0,   m: 1 },
    { shape: 'seahorse',  depth: 180,   x: 80, y: 34, size: 4.4, glow: true,  dur: 34, delay: 1.2 },
    { shape: 'fish',      depth: 320,   x: 36, y: 76, size: 10,  glow: false, dur: 28, delay: 2.4, flip: true },
    { shape: 'manta',     depth: 650,   x: 58, y: 12, size: 15,  glow: true,  dur: 40, delay: 0.8, m: 1 },
    { shape: 'jellyfish', depth: 900,   x: 12, y: 50, size: 8,   glow: true,  dur: 26, delay: 1.4, m: 1 },
    { shape: 'octopus',   depth: 1600,  x: 64, y: 56, size: 12,  glow: true,  dur: 30, delay: 0.6, m: 1 },
    { shape: 'jellyfish', depth: 2400,  x: 84, y: 16, size: 5,   glow: true,  dur: 36, delay: 2.2 },
    { shape: 'jellyfish', depth: 3200,  x: 24, y: 18, size: 6.5, glow: true,  dur: 24, delay: 3.1, m: 1 },
    { shape: 'octopus',   depth: 4200,  x: 30, y: 58, size: 10,  glow: true,  dur: 32, delay: 2.6, m: 1 },
    { shape: 'jellyfish', depth: 5000,  x: 54, y: 76, size: 3.5, glow: true,  dur: 30, delay: 0.9 },
    { shape: 'crab',      depth: 6200,  x: 10, y: 58, size: 10,  glow: false, dur: 38, delay: 0.4, m: 1 },
    { shape: 'jellyfish', depth: 8000,  x: 76, y: 20, size: 4,   glow: true,  dur: 34, delay: 1.8 },
    { shape: 'crab',      depth: 10200, x: 60, y: 66, size: 8,   glow: false, dur: 40, delay: 2.9, flip: true }
  ];

  function buildCreatures(layer) {
    if (!layer) { return []; }
    /* На узком экране — только отмеченные: и по батарее дешевле,
       и композиция не превращается в кашу */
    var list = MZ.isNarrow() ? CREATURES.filter(function (c) { return c.m; }) : CREATURES;

    return list.map(function (c) {
      var art = IMAGES[c.shape];

      var el = document.createElement('div');
      el.className = 'creature' + (c.glow ? ' creature--glow' : '') + (c.flip ? ' creature--flip' : '');
      el.style.left = c.x + '%';
      el.style.top = c.y + '%';
      el.style.width = c.size + 'vw';
      el.style.setProperty('--dur', c.dur + 's');
      el.style.setProperty('--delay', c.delay + 's');
      el.style.setProperty('--pulse', (3.4 + (c.delay % 2)) + 's');

      /* Картинку не грузим сразу: src проставится, когда до существа
         останется меньше 1600 м погружения. На первом экране скачиваются
         только ближайшие к поверхности, а краб на дне — лишь если до него
         долистали. */
      var img = document.createElement('img');
      img.alt = '';
      img.width = art.w;
      img.height = art.h;
      img.decoding = 'async';
      img.draggable = false;
      img.setAttribute('data-src', art.src);
      el.appendChild(img);

      layer.appendChild(el);
      return { el: el, depth: c.depth, max: c.glow ? 1 : 0.72, pending: img };
    });
  }

  /* ==========================================================================
     Частицы: три слоя взвеси. Верхние быстрее и светлее.
     ========================================================================== */
  function initParticles(canvas) {
    if (!canvas || MZ.reduced) { return null; }

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) { return null; }

    var dpr = Math.min(window.devicePixelRatio || 1, MZ.isNarrow() ? 1.5 : 2);
    var w = 0, h = 0;
    var layers = [];
    var depthFactor = 0;

    function build() {
      var base = MZ.isNarrow() ? 10 : 22;
      layers = [
        { count: base,          speed: 26, size: 1.8, alpha: 0.55, items: [] },
        { count: Math.round(base * 0.8), speed: 15, size: 1.2, alpha: 0.34, items: [] },
        { count: Math.round(base * 0.6), speed: 8,  size: 0.9, alpha: 0.2,  items: [] }
      ];
      layers.forEach(function (layer) {
        for (var i = 0; i < layer.count; i++) {
          layer.items.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: layer.size * (0.6 + Math.random() * 0.8),
            drift: (Math.random() - 0.5) * 6
          });
        }
      });
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    var last = 0;
    function draw(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      if (!w || !h) { return; }

      ctx.clearRect(0, 0, w, h);

      for (var l = 0; l < layers.length; l++) {
        var layer = layers[l];
        /* Ближе ко дну взвесь становится реже и холоднее по цвету */
        var alpha = layer.alpha * (1 - depthFactor * 0.45);
        ctx.fillStyle = depthFactor > 0.5
          ? 'rgba(150, 230, 226,' + alpha.toFixed(3) + ')'
          : 'rgba(230, 244, 246,' + alpha.toFixed(3) + ')';

        for (var i = 0; i < layer.items.length; i++) {
          var p = layer.items[i];
          /* Частицы всплывают вверх — значит, мы опускаемся */
          p.y += layer.speed * dt;
          p.x += p.drift * dt;
          if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; }
          if (p.x < -4) { p.x = w + 4; } else if (p.x > w + 4) { p.x = -4; }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    MZ.addLoop(draw);

    return { setDepth: function (v) { depthFactor = v; } };
  }

  /* ==========================================================================
     Само погружение
     ========================================================================== */
  function initDive() {
    var dive = MZ.$('.dive');
    if (!dive) { return; }

    var bg = MZ.$('.dive__bg', dive);
    var beam = MZ.$('.dive__beam', dive);
    var dark = MZ.$('.dive__dark', dive);
    var scenes = MZ.$$('.scene', dive);
    var scale = MZ.$('.scale');
    var marker = scale ? MZ.$('.scale__marker', scale) : null;
    var rope = scale ? MZ.$('.scale__rope-line', scale) : null;
    var rail = scale ? MZ.$('.scale__ticks', scale) : null;
    var depthOut = scale ? MZ.$('.scale__depth', scale) : null;
    var zoneOut = scale ? MZ.$('.scale__zone', scale) : null;

    if (!scenes.length) { return; }

    var zones = window.EXHIBITION.zones;
    var colors = zones.map(function (z) { return MZ.hexToRgb(z.color); });
    var depths = scenes.map(function (s) { return parseFloat(s.getAttribute('data-depth')) || 0; });

    var particles = initParticles(MZ.$('.dive__particles', dive));
    var creatures = MZ.reduced ? [] : buildCreatures(MZ.$('.dive__creatures', dive));

    var anchors = [];
    var railH = 0;
    var lastDepthText = '';
    var lastZone = -1;

    function measure() {
      anchors = scenes.map(function (s) {
        var r = s.getBoundingClientRect();
        return r.top + (window.pageYOffset || 0) + r.height / 2;
      });
      if (rail) { railH = rail.clientHeight; }
    }

    /* Ставим шкале засечки: по одной на зону, подписи моноширинные */
    function buildTicks() {
      if (!rail) { return; }
      rail.innerHTML = '';
      var n = zones.length - 1;
      zones.forEach(function (z, i) {
        var tick = document.createElement('div');
        tick.className = 'scale__tick scale__tick--major';
        tick.style.top = ((i / n) * 100).toFixed(2) + '%';
        rail.appendChild(tick);

        var label = document.createElement('span');
        label.className = 'scale__tick-label mono';
        label.textContent = z.depth === 0 ? '0' : MZ.formatInt(z.depth);
        label.style.top = 'calc(' + ((i / n) * 100).toFixed(2) + '% - 0.55em)';
        rail.appendChild(label);
      });

      /* Бегунок живёт в той же колонке, что и засечки, поэтому его нужно
         вернуть обратно после очистки — иначе он остаётся оторванным от
         документа, и вся шкала выглядит неподвижной. */
      if (marker) { rail.appendChild(marker); }
    }

    function update() {
      if (!anchors.length) { return; }

      var mid = (window.pageYOffset || 0) + window.innerHeight / 2;

      /* Ищем отрезок между центрами двух соседних сцен */
      var i = 0;
      while (i < anchors.length - 2 && mid > anchors[i + 1]) { i++; }

      var span = anchors[i + 1] - anchors[i];
      var t = span > 0 ? MZ.clamp((mid - anchors[i]) / span, 0, 1) : 0;

      var depth = MZ.lerp(depths[i], depths[i + 1], t);
      var total = anchors[anchors.length - 1] - anchors[0];
      var p = total > 0 ? MZ.clamp((mid - anchors[0]) / total, 0, 1) : 0;

      /* --- Фон: цвет ровно между цветами двух зон --- */
      if (bg) { bg.style.backgroundColor = MZ.mixRgb(colors[i], colors[i + 1], t); }

      /* --- Свет у поверхности гаснет к 400 метрам --- */
      if (beam) { beam.style.opacity = MZ.clamp(1 - depth / 400, 0, 1).toFixed(3); }

      /* --- Темнота: полностью вступает в силу ниже 2500 м --- */
      /* Пока фон светлый, приборы переключаются на тёмные чернила */
      if (scale) { scale.classList.toggle("is-light", depth < 260); }

      var darkness = MZ.clamp((depth - 800) / 1700, 0, 1);
      if (dark) { dark.style.opacity = darkness.toFixed(3); }
      if (particles) { particles.setDepth(MZ.clamp(depth / 6000, 0, 1)); }

      /* --- Шкала: бегунок, трос, показания --- */
      if (marker) { marker.style.transform = 'translate3d(0,' + (p * railH).toFixed(1) + 'px,0)'; }
      if (rope) { rope.style.strokeDashoffset = (1 - p).toFixed(4); }

      if (depthOut) {
        var text = MZ.formatDepth(depth) + ' м';
        if (text !== lastDepthText) { depthOut.textContent = text; lastDepthText = text; }
      }
      if (zoneOut && i !== lastZone) {
        zoneOut.textContent = MZ.i18n.t('dive.' + zones[Math.min(i + (t > 0.5 ? 1 : 0), zones.length - 1)].slug + '.label');
        lastZone = i;
      }

      /* --- Существа: видны рядом со своей глубиной --- */
      for (var c = 0; c < creatures.length; c++) {
        var cr = creatures[c];
        var near = 1 - Math.abs(depth - cr.depth) / 1600;
        if (near > 0 && cr.pending) {
          cr.pending.src = cr.pending.getAttribute('data-src');
          cr.pending.removeAttribute('data-src');
          cr.pending = null;
        }
        cr.el.style.opacity = MZ.clamp(near, 0, 1) * cr.max;
      }
    }

    buildTicks();
    measure();
    MZ.onScrollFrame(update);

    /* Первый расчёт делаем сразу, не дожидаясь кадра: если страницу открыли
       в фоновой вкладке, requestAnimationFrame там не выполняется, и до
       первого показа шкала с фоном остались бы в исходном состоянии. */
    update();
    window.addEventListener('resize', function () { measure(); MZ.invalidate(); }, { passive: true });
    window.addEventListener('load', function () { measure(); MZ.invalidate(); });
    document.addEventListener('mz:lang', function () { lastZone = -1; MZ.invalidate(); });

    /* --- Шкала появляется только на время погружения --- */
    if (scale && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        scale.classList.toggle('is-on', entries[0].isIntersecting);
      }, { threshold: 0 }).observe(dive);
    } else if (scale) {
      scale.classList.add('is-on');
    }

    /* --- Подсказка «прокрутите вниз» исчезает после первого движения --- */
    var hint = MZ.$('.scroll-hint');
    if (hint) {
      var hideHint = function () {
        hint.classList.add('is-gone');
        window.removeEventListener('scroll', hideHint);
      };
      window.addEventListener('scroll', hideHint, { passive: true, once: true });
    }

    /* --- Название собирается из букв --- */
    var title = MZ.$('.dive__title');
    if (title) {
      var render = function () {
        var text = MZ.i18n.t('brand.name');
        title.textContent = '';
        text.split(' ').forEach(function (word, wi, arr) {
          var w = document.createElement('span');
          w.className = 'word';
          word.split('').forEach(function (ch, ci) {
            var s = document.createElement('span');
            s.className = 'ch';
            s.style.setProperty('--i', String(wi * 6 + ci));
            s.textContent = ch;
            w.appendChild(s);
          });
          title.appendChild(w);
          if (wi < arr.length - 1) { title.appendChild(document.createTextNode(' ')); }
        });
        title.setAttribute('aria-label', text);
      };
      render();
      document.addEventListener('mz:lang', function () {
        var wasOn = title.classList.contains('is-on');
        render();
        if (wasOn) { title.classList.add('is-on'); }
      });

      if (MZ.reduced || !('IntersectionObserver' in window)) {
        title.classList.add('is-on');
      } else {
        new IntersectionObserver(function (entries, obs) {
          if (entries[0].isIntersecting) {
            title.classList.add('is-on');
            obs.disconnect();
          }
        }, { threshold: 0.35 }).observe(title);
      }
    }

    /* ------------------------------------------------------------ Фонарь --
       На мыши пятно следует за курсором. На тач-устройствах — неподвижное
       пятно по центру: гоняться за пальцем незачем, а атмосфера остаётся. */
    if (dark) {
      if (MZ.heavyOk()) {
        MZ.onPointer(function (pt) {
          if (!pt.inside) { return; }
          dark.style.setProperty('--fx', pt.x.toFixed(0) + 'px');
          dark.style.setProperty('--fy', pt.y.toFixed(0) + 'px');
        });
        dark.style.setProperty('--flash-r', '270px');
      } else {
        dark.style.setProperty('--fx', '50%');
        dark.style.setProperty('--fy', '46%');
        dark.style.setProperty('--flash-r', '38vmin');
      }
    }
  }

  /* ==========================================================================
     Три главных экспоната на 6000 м — берём из данных, чтобы не дублировать
     тексты между страницами
     ========================================================================== */
  function renderHighlights() {
    var box = MZ.$('[data-highlights]');
    if (!box) { return; }

    function render() {
      box.textContent = '';
      window.EXHIBITION.highlights.forEach(function (slug) {
        var hall = window.EXHIBITION.halls.filter(function (h) { return h.slug === slug; })[0];
        if (!hall) { return; }

        var card = document.createElement('article');
        card.className = 'highlight';

        var num = document.createElement('div');
        num.className = 'highlight__num';
        num.textContent = MZ.i18n.t('halls.hall') + ' ' + hall.n;

        var h3 = document.createElement('h3');
        h3.textContent = MZ.i18n.t('halls.items.' + slug + '.title');

        var p = document.createElement('p');
        p.textContent = MZ.i18n.t('halls.items.' + slug + '.desc');

        card.appendChild(num);
        card.appendChild(h3);
        card.appendChild(p);
        box.appendChild(card);
      });
    }

    render();
    document.addEventListener('mz:lang', render);
  }

  MZ.pages = MZ.pages || {};
  MZ.pages.home = function () {
    initPreloader();
    renderHighlights();
    initDive();
  };
})(window, document);
