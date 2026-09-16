/* Карта проезда к музею.
   ============================================================================
   Раньше здесь была нарисованная схема: причина была в том, что готовый кадр
   с сайта карт тянет за собой чужие счётчики и рекламную полосу. Карта на
   Leaflet этой платы не требует — библиотека лежит в assets/vendor, со
   стороны грузятся только плитки OpenStreetMap.

   Подпись «© OpenStreetMap» — условие лицензии на данные, её не убираем.

   Плитки запрашиваются, только когда человек долистал до блока: до этого
   наружу не уходит ни одного запроса. Если библиотека не загрузилась или
   JavaScript отключён, внутри блока остаётся адрес и ссылка на карту. */
(function (global) {
  'use strict';

  var TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  function build(box) {
    if (box.dataset.ready) { return; }
    box.dataset.ready = '1';

    var lat = parseFloat(box.getAttribute('data-lat'));
    var lon = parseFloat(box.getAttribute('data-lon'));
    var zoom = parseInt(box.getAttribute('data-zoom'), 10) || 16;
    if (isNaN(lat) || isNaN(lon) || typeof L === 'undefined') { return; }

    box.innerHTML = '';

    var map = L.map(box, {
      center: [lat, lon],
      zoom: zoom,
      /* Колесо мыши масштабирует карту только после клика: иначе человек,
         листающий страницу, застревает внутри карты. */
      scrollWheelZoom: false
    });

    map.attributionControl.setPrefix('');

    L.tileLayer(TILES, {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    /* Метка цветом биолюминесценции, как всё интерактивное на сайте */
    L.circleMarker([lat, lon], {
      radius: 9,
      color: '#040A12',
      weight: 3,
      fillColor: '#5FF2E4',
      fillOpacity: 1
    }).addTo(map);

    map.on('focus', function () { map.scrollWheelZoom.enable(); });
    map.on('blur', function () { map.scrollWheelZoom.disable(); });
  }

  function start() {
    var boxes = document.querySelectorAll('[data-map]');
    if (!boxes.length) { return; }

    if (!('IntersectionObserver' in global)) {
      Array.prototype.forEach.call(boxes, build);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { build(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '200px' });

    Array.prototype.forEach.call(boxes, function (box) { io.observe(box); });
  }

  document.addEventListener('DOMContentLoaded', start);
}(window));
