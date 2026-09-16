/* ============================================================================
   ЗОНА ПОЛУНОЧИ — структурные данные выставки
   ----------------------------------------------------------------------------
   Здесь лежат только числа и структура: номера залов, минуты, цены, сеансы,
   даты, координаты хронологии. Весь ТЕКСТ живёт в assets/data/i18n-dict.js
   и берётся по ключу — иначе три языка невозможно держать в синхроне.

   ПОЧЕМУ .js, А НЕ .json
   Сайт открывается двойным кликом по index.html, то есть по протоколу file://.
   Браузер запрещает fetch() локальных файлов с такого адреса — JSON просто не
   загрузится. Обычный <script> ограничением не задет, поэтому данные лежат в
   глобальной переменной. Структура при этом ровно та, что была бы в JSON:
   если проект переедет на сервер, замена делается в одном месте.
   ============================================================================ */

window.EXHIBITION = {

  /* --- Общее. Всё вымышленное, перед запуском заменить на реальное --------- */
  meta: {
    dateFrom: '2026-10-03',
    dateTo:   '2027-02-07',
    /* Понедельник — выходной. 1 = пн ... 7 = вс (ISO) */
    closedWeekdays: [1],
    openHour: 10,
    lastEntryHour: 19,
    durationMin: 90,
    hallCount: 12,
    coords: { lat: 54.5189, lon: 18.5305 }
  },

  /* --- Тарифы. Выходной дороже: наценка уже посчитана, а не в процентах,
         чтобы в кассе и на сайте совпадали копейки ------------------------- */
  tickets: [
    { id: 'adult',   weekday: 45,  weekend: 52,  max: 10, seats: 1 },
    { id: 'reduced', weekday: 28,  weekend: 32,  max: 10, seats: 1 },
    { id: 'family',  weekday: 130, weekend: 149, max: 4,  seats: 4 }
  ],

  /* --- Сеансы: час начала. Последний вход в 19:00 ------------------------- */
  sessions: ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],

  /* --- Залы. dark: true — зал 7, требует отдельного предупреждения --------
         slug совпадает с ключом в словаре: halls.items.<slug> --------------- */
  halls: [
    { n: 1,  slug: 'edge' },
    { n: 2,  slug: 'pressure' },
    { n: 3,  slug: 'anglerfish' },
    { n: 4,  slug: 'glow' },
    { n: 5,  slug: 'snow' },
    { n: 6,  slug: 'voices' },
    { n: 7,  slug: 'blackout', dark: true },
    { n: 8,  slug: 'squid' },
    { n: 9,  slug: 'trieste' },
    { n: 10, slug: 'smokers' },
    { n: 11, slug: 'colony' },
    { n: 12, slug: 'unknown' }
  ],

  /* --- Хронология погружений человека на дно Марианской впадины ----------- */
  timeline: [
    { year: 1960, slug: 'trieste',  depth: 10916, crew: 2 },
    { year: 1995, slug: 'kaiko',    depth: 10911, crew: 0 },
    { year: 2012, slug: 'cameron',  depth: 10908, crew: 1 },
    { year: 2019, slug: 'vescovo',  depth: 10928, crew: 1 }
  ],

  /* --- Зоны погружения. Цвет — фон сцены, к нему интерполируется страница.
         light — процент солнечного света от поверхности ------------------- */
  zones: [
    { slug: 'surface',  depth: 0,     color: '#BFD9E0', temp: 18, pressure: 1,    light: 100 },
    { slug: 'epi',      depth: 200,   color: '#2E6B7A', temp: 12, pressure: 21,   light: 1 },
    { slug: 'twilight', depth: 1000,  color: '#123A4D', temp: 4,  pressure: 101,  light: 0 },
    { slug: 'midnight', depth: 4000,  color: '#08192B', temp: 2,  pressure: 401,  light: 0 },
    { slug: 'abyssal',  depth: 6000,  color: '#040A12', temp: 2,  pressure: 601,  light: 0 },
    { slug: 'hadal',    depth: 11000, color: '#000000', temp: 1,  pressure: 1100, light: 0 }
  ],

  /* --- Школьные программы. Цена за ученика, сопровождающие бесплатно ------ */
  programs: [
    { slug: 'kids',  ageFrom: 8,  ageTo: 10, minutes: 60, price: 18 },
    { slug: 'mid',   ageFrom: 11, ageTo: 14, minutes: 90, price: 22 },
    { slug: 'teens', ageFrom: 15, ageTo: 18, minutes: 90, price: 25 }
  ],
  schoolRules: { freeAdultPer: 10, minGroup: 10, maxGroup: 30 },

  /* --- Три главных экспоната для блока «Что вы увидите» на глубине 6000 --- */
  highlights: ['trieste', 'blackout', 'colony'],

  /* --- Авторы фотографий залов. Ключ — slug зала, фото лежат в
         assets/img/halls/<slug>-sm.jpg и -lg.jpg. Блок между метками
         пересобирает tools/prepare-photos.ps1 — руками не править ---------- */
  // photoCredits:begin
  photoSource: 'generated',
  photoCredits: {},
  // photoCredits:end
};
