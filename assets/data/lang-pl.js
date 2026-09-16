/* STREFA PÓŁNOCY — słownik polski.
   Teksty pisane od nowa w tej samej intonacji co rosyjskie, a nie tłumaczone
   dosłownie. Przed pokazaniem klientowi warto dać je do korekty native
   speakerowi — patrz README, sekcja «Ograniczenia». */
window.MZ_LANG = window.MZ_LANG || {};
window.MZ_LANG.pl = {
  _meta: { code: 'pl', name: 'PL', htmlLang: 'pl', label: 'Polski' },

  nav: {
    dive: 'Zanurzenie', halls: 'Sale', tickets: 'Bilety',
    schools: 'Dla szkół', visit: 'Dojazd', buy: 'Kup bilet',
    buyShort: 'Bilet',
    menu: 'Menu', close: 'Zamknij', lang: 'Język', main: 'Nawigacja główna',
    skip: 'Przejdź do treści'
  },

  brand: { name: 'STREFA PÓŁNOCY', sub: 'Wystawa o życiu w głębinach' },

  common: {
    min: 'min', metres: 'm', currency: 'zł', from: 'od', of: 'z',
    more: 'Więcej', less: 'Zwiń', back: 'Strona główna',
    required: 'Pole wymagane', total: 'Razem'
  },

  pages: {
    homeTitle: 'STREFA PÓŁNOCY — wystawa o głębinach oceanu w Gdyni',
    homeDesc: 'Poniżej 200 metrów nie ma słońca. Wystawa o czterech kilometrach wody, pod którymi wciąż jest życie: 12 sal, makiety batyskafów, świecące modele stworzeń i sala całkowitej ciemności. Gdynia, 3 października — 7 lutego.',
    hallsTitle: 'Sale i eksponaty — STREFA PÓŁNOCY',
    hallsDesc: 'Dwanaście sal wystawy: od granicy światła na 200 metrach po mapę niezbadanego dna. Batyskaf w skali 1:2, żywa kolonia bakterii pod ciśnieniem, osiem minut całkowitej ciemności.',
    ticketsTitle: 'Bilety i godziny — STREFA PÓŁNOCY',
    ticketsDesc: 'Normalny 45 zł, ulgowy 28 zł, rodzinny 130 zł. Kalendarz obłożenia, wejścia co półtorej godziny, zwiedzanie około 90 minut.',
    schoolsTitle: 'Dla szkół i grup — STREFA PÓŁNOCY',
    schoolsDesc: 'Trzy programy dla wieku od 8 do 18 lat, od 18 zł za ucznia. Opiekunowie bezpłatnie, karta pracy i materiały dla nauczyciela.',
    visitTitle: 'Dojazd i pytania — STREFA PÓŁNOCY',
    visitDesc: 'Adres, komunikacja, parking i odpowiedzi na częste pytania: dostępność dla wózków, wiek dzieci, czas zwiedzania, sala całkowitej ciemności.',
    privacyTitle: 'Polityka prywatności — STREFA PÓŁNOCY',
    notfoundTitle: 'Nie znaleziono strony — STREFA PÓŁNOCY'
  },

  preloader: { label: 'Zanurzanie', skip: 'Pomiń' },

  dive: {
    aria: 'Zanurzenie: strona zmienia się w miarę przewijania',
    scaleLabel: 'Skala głębokości',
    hint: 'Przewiń w dół',
    facts: { depth: 'Głębokość', temp: 'Temperatura', pressure: 'Ciśnienie', light: 'Światło' },
    lightNone: 'brak',
    lightOne: '1% powierzchni',
    lightFull: 'pełne',

    surface: {
      label: 'Powierzchnia',
      h1: 'PONIŻEJ 200 METRÓW NIE MA SŁOŃCA',
      sub: 'Wystawa o czterech kilometrach wody, pod którymi wciąż jest życie. 12 sal. Jedna z nich w całkowitej ciemności.',
      dates: '3 października 2026 — 7 lutego 2027',
      place: 'Muzeum Morskie, Gdynia',
      cta: 'Rozpocznij zanurzenie'
    },
    epi: {
      label: 'Epipelagial',
      h2: 'Tu jeszcze rosną glony. Niżej już nie.',
      text: 'Pierwsze dwieście metrów to całe znane nam życie oceanu. Niżej fotosynteza jest niemożliwa: światła nie starcza nawet dla glonów.'
    },
    twilight: {
      label: 'Strefa zmierzchu',
      h2: 'Światło jeszcze dociera. Wyrosnąć na nim już nie sposób.',
      text: 'Oczy tutejszych ryb są w stosunku do ciała cztery razy większe od naszych. Potrzebują każdego ocalałego fotonu.'
    },
    midnight: {
      label: 'Strefa północy',
      h2: 'Stąd do dna — 11 kilometrów wiecznej nocy',
      text: 'Jedyne światło poniżej kilometra wytwarzają same stworzenia. Dziewięć na dziesięć tutejszych gatunków świeci.',
      quote: 'Ludzie boją się głębin nie dlatego, że są tam potwory. Dlatego, że nie ma tam nikogo.',
      quoteAuthor: 'Kuratorka wystawy, oceanolog'
    },
    abyssal: {
      label: 'Abisal',
      h2: 'Muł, kraby, cisza.',
      text: 'Połowa powierzchni planety to właśnie ta równina. Temperatura nie zmienia się tu od tysiącleci.',
      highlights: 'Co zobaczysz'
    },
    hadal: {
      label: 'Hadal',
      h2: 'Dno oceanu znamy gorzej niż powierzchnię Marsa.',
      text: 'Przyjdź zobaczyć to niewiele, co wiemy.',
      cta: 'Kup bilet',
      ctaSchools: 'Zgłoszenie dla klasy'
    },
    surfaced: { label: 'Wynurzenie', note: 'Dalej zwykłe informacje, w świetle dnia.' }
  },

  halls: {
    h1: 'Dwanaście sal',
    lead: 'Zwiedzanie zajmuje około 90 minut. Kolejność sal to kolejność schodzenia: od granicy światła po mapę tego, czego nie wiemy.',
    hall: 'Sala',
    duration: 'Zwiedzanie',
    photoStub: 'Zdjęcie sali — do podmiany',
    photoBy: 'Fot.',
    creditsTitle: 'Autorzy zdjęć',
    imagesTitle: 'O ilustracjach sal',
    generatedNote: 'Wystawa jeszcze się nie otworzyła, więc nie ma zdjęć jej sal. Ilustracje na tej stronie to wizualizacja stworzona przez sieć neuronową: tak będą wyglądać sale. Po otwarciu zastąpią je prawdziwe zdjęcia.',
    creditsNote: 'Wystawa jest fikcyjna, więc nie ma własnych zdjęć sal. Tutaj są wolne zdjęcia prawdziwych ekspozycji głębinowych, akwariów i eksponatów muzealnych z Wikimedia Commons, połączone w jedną serię wspólną tonacją.',
    warnTitle: 'Sala 7: nie dla tych, którzy boją się ciemności',
    warnText: 'Osiem minut bez żadnego źródła światła. Wejście pojedynczo, drzwi nie są zamykane, wyjść można w każdej chwili. Dzieci poniżej 8 lat tylko z dorosłym.',
    warnList: [
      'Wejście pojedynczo, co dwie minuty',
      'W środku tylko dźwięk: bez ekranów i podświetleń',
      'Przy wyjściu dyżuruje pracownik',
      'Salę można ominąć krótkim korytarzem'
    ],
    items: {
      edge:       { title: 'Granica światła', desc: 'Na dwustu metrach kończy się fotosynteza. W sali widać to dosłownie: podłogę dzieli linia, za którą nic już nie rośnie.' },
      pressure:   { title: 'Ciśnienie', desc: 'Prasa hydrauliczna ściska styropianowy kubek do rozmiaru naparstka. Co pół godziny, przy widzach.' },
      anglerfish: { title: 'Żabnica głębinowa', desc: 'Model naturalnej wielkości. Jest mniejsza, niż myślisz — 20 cm. Straszniejsza wychodzi na zdjęciach.' },
      glow:       { title: 'Bioluminescencja', desc: 'Ciemna sala, w której świecą wyłącznie eksponaty. Czterdzieści modeli stworzeń, każde z własnym typem świecenia.' },
      snow:       { title: 'Morski śnieg', desc: 'Sześciometrowa kolumna, w której nieprzerwanie opada zawiesina. To pokarm wszystkiego, co żyje niżej.' },
      voices:     { title: 'Głosy głębin', desc: 'Nagrania z hydrofonów: kliknięcia kaszalotów, trzeszczenie lodu i dudnienie, którego pochodzenia wciąż nie ustalono.' },
      blackout:   { title: 'Całkowita ciemność', desc: 'Osiem minut bez żadnego źródła światła, tylko dźwięk. Wejście pojedynczo.' },
      squid:      { title: 'Kałamarnica olbrzymia', desc: 'Dwunastometrowy model pod sufitem. Żywą sfilmowano po raz pierwszy dopiero w 2004 roku.' },
      trieste:    { title: 'Batyskaf Trieste', desc: 'Kopia w skali 1:2, można wejść do środka. Dwóch ludzi spędziło w takiej kuli dziewięć godzin.' },
      smokers:    { title: 'Czarne kominy', desc: 'Kominy hydrotermalne: woda +400 °C, a wokół życie, któremu słońce nie jest do niczego potrzebne.' },
      colony:     { title: 'Żywa kolonia', desc: 'Bakterie głębinowe pod prawdziwym ciśnieniem, w komorze z iluminatorem. Jedyne żywe eksponaty wystawy.' },
      unknown:    { title: 'Czego nie wiemy', desc: 'Mapa zbadania dna: dokładnie zmierzono mniej niż jedną trzecią oceanu. Reszta to biała plama na całą ścianę.' }
    }
  },

  timeline: {
    h2: 'Kalendarium zanurzeń',
    hint: 'Przewijaj w dół — ruch idzie w bok',
    crewLabel: 'Załoga',
    depthLabel: 'Głębokość',
    items: {
      trieste: { name: 'Trieste', crew: 'Jacques Piccard i Don Walsh', note: 'Pierwsze zejście człowieka na dno Rowu Mariańskiego. Iluminator pękł w połowie drogi — zeszli mimo to.' },
      kaiko:   { name: 'Kaikō', crew: 'zdalnie', note: 'Japoński pojazd bez załogi. Zrobił to samo i przywiózł pierwsze próbki osadu.' },
      cameron: { name: 'Deepsea Challenger', crew: 'James Cameron', note: 'Sam, w pionowej kapsule szerokości fotela. Na dnie spędził około trzech godzin.' },
      vescovo: { name: 'Limiting Factor', crew: 'Victor Vescovo', note: 'Schodził pięć razy. Na dnie znalazł plastikową torbę.' }
    }
  },

  tickets: {
    h1: 'Bilety',
    lead: 'Wejścia co półtorej godziny. Zwiedzanie zajmuje około 90 minut, w środku można zostać dłużej.',
    tariffsTitle: 'Cennik',
    weekday: 'Dni powszednie', weekend: 'Weekend',
    priceMode: 'Rodzaj dnia',
    names: { adult: 'Normalny', reduced: 'Ulgowy', family: 'Rodzinny' },
    notes: {
      adult: 'Od 19 lat, bez limitu czasu w środku',
      reduced: 'Uczniowie, studenci, emeryci — za okazaniem dokumentu',
      family: 'Dwoje dorosłych i dwoje dzieci do 18 lat'
    },
    calendarTitle: 'Wybierz dzień',
    monthPrev: 'Poprzedni miesiąc', monthNext: 'Następny miesiąc',
    occupancy: { free: 'Wolne', few: 'Mało miejsc', none: 'Brak miejsc', closed: 'Zamknięte' },
    occupancyLegend: 'Obłożenie',
    closedNote: 'W poniedziałki wystawa jest nieczynna.',
    sessionsTitle: 'Wejścia',
    sessionsHint: 'Najpierw wybierz dzień w kalendarzu.',
    seatsLeft: 'miejsc',
    soldOut: 'brak miejsc',
    calcTitle: 'Bilety',
    nothingSelected: 'Nie wybrano żadnego biletu',
    plus: 'Dodaj', minus: 'Usuń',
    rulesTitle: 'Czego nie wolno',
    rules: [
      'Fotografować z lampą błyskową: rozbija światło eksponatów',
      'Jeść i pić w salach',
      'Wchodzić do sali 7 grupą i tam rozmawiać',
      'Wnosić plecaki większe niż bagaż podręczny — jest przechowalnia'
    ],
    monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
    weekdayShort: ['Pn','Wt','Śr','Cz','Pt','So','Nd'],
    weekdayFull: ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'],
    outOfRange: 'Tego dnia wystawa jest nieczynna'
  },

  schools: {
    h1: 'Dla szkół i grup',
    lead: 'Dni powszednie, przed południem. Grupa od 10 do 30 uczniów, opiekunowie bezpłatnie — jeden dorosły na dziesięcioro dzieci.',
    programsTitle: 'Programy',
    age: 'Wiek', duration: 'Czas trwania', price: 'Cena za ucznia',
    years: 'lat',
    programs: {
      kids:  { title: 'Kto mieszka w ciemności', desc: 'Zwiedzanie przeglądowe bez trudnych terminów. Salę całkowitej ciemności zastępuje krótki korytarz — decyduje nauczyciel.' },
      mid:   { title: 'Ciśnienie i życie', desc: 'Fizyka głębin na doświadczeniach: prasa hydrauliczna, gęstość, pojemność cieplna wody. Karta pracy wypełniana w salach.' },
      teens: { title: 'Jak bada się dno', desc: 'Batyskafy, sonary, próbki osadu. Rozmowa o tym, dlaczego większość dna wciąż nie została dokładnie zmierzona.' }
    },
    bringTitle: 'Co zabrać',
    bring: [
      'Listę uczniów z nazwiskami — potrzebna przy wejściu',
      'Ołówki: w salach jest ciemno, długopisu na karcie pracy prawie nie widać',
      'Ciepłą bluzę — w sali 11 utrzymujemy +14 °C',
      'Potwierdzenie rezerwacji w telefonie lub na wydruku'
    ],
    filesTitle: 'Materiały dla nauczyciela',
    files: [
      { name: 'Karta pracy, 11–14 lat', meta: 'PDF · 2 strony' },
      { name: 'Materiały do programu', meta: 'PDF · 9 stron' }
    ],
    fileStub: 'Plik zastępczy: podmienić przed startem',
    formTitle: 'Zgłoszenie grupy',
    formLead: 'Odpowiemy w ciągu dnia roboczego i potwierdzimy godzinę. Płatność na miejscu, na fakturę dla szkoły.'
  },

  visit: {
    h1: 'Dojazd',
    address: 'Muzeum Morskie, ul. Portowa 12, Gdynia',
    addressNote: 'Wejście od strony nabrzeża, osobna klatka z czarną tablicą.',
    hoursTitle: 'Godziny otwarcia',
    hours: 'Wtorek — niedziela, 10:00 — 20:00. Ostatnie wejście o 19:00. Poniedziałek nieczynne.',
    transportTitle: 'Komunikacja',
    transport: [
      { name: 'SKM', text: 'Stacja Gdynia Główna, dalej 15 minut pieszo wzdłuż nabrzeża' },
      { name: 'Autobus', text: 'Przystanek Muzeum Morskie, linie 109, 119, 133' },
      { name: 'Samochód', text: 'Płatny parking przy muzeum, 40 miejsc. W weekendy zapełnia się do południa' },
      { name: 'Pieszo', text: 'Od skweru Kościuszki — 10 minut wzdłuż wody' }
    ],
    mapTitle: 'Schemat dojścia',
    mapNote: 'Schemat jest narysowany, a nie osadzony z mapy: zewnętrzne mapy ciągną za sobą trackery i nie działają bez internetu.',
    faqTitle: 'Częste pytania',
    faq: [
      { q: 'Czy można z wózkiem?', a: 'Tak, wszystkie sale są na jednym poziomie, przy wejściu jest winda i podjazd. Do sali 7 z wózkiem się nie wchodzi — obok jest miejsce, gdzie można go zostawić.' },
      { q: 'Od jakiego wieku warto?', a: 'Od ośmiu lat. Młodsze dzieci bywają przestraszone w salach 4 i 7, ale obie da się ominąć krótkim korytarzem bez gubienia trasy.' },
      { q: 'Ile trwa zwiedzanie?', a: 'Około 90 minut w normalnym tempie. Z czytaniem wszystkich podpisów i pokazem prasy hydraulicznej — do dwóch i pół godziny. Czas w środku nie jest ograniczony.' },
      { q: 'Czy w sali 7 naprawdę jest strasznie?', a: 'Jest ciemno i cicho, ale nic się nie dzieje: żadnych hałasów, dotknięć ani ruchomych elementów. Drzwi nie są zamykane, wyjść można w każdej chwili.' },
      { q: 'Czy można fotografować?', a: 'Tak, bez lampy błyskowej. Błysk rozbija światło świecących modeli i przeszkadza innym: oczy potrzebują około trzech minut, żeby przywyknąć do ciemności.' },
      { q: 'Czy jest szatnia i przechowalnia?', a: 'Tak, obie bezpłatne, przy wejściu. Dużych plecaków nie wnosimy do sal — przejścia między gablotami są wąskie.' },
      { q: 'Co jeśli spóźnię się na wejście?', a: 'Wpuścimy na najbliższe wolne. Bilet jest przypisany do dnia, nie do minuty, ale w weekend czekanie może sięgnąć półtorej godziny.' },
      { q: 'Czy wystawa jest dostępna dla osób niesłyszących?', a: 'Wszystkie materiały dźwiękowe sali 6 mają wersję tekstową. Oprowadzanie w polskim języku migowym — po wcześniejszym zgłoszeniu przez formularz na tej stronie.' }
    ],
    questionTitle: 'Masz pytanie?',
    questionLead: 'Napisz — odpowiadamy w godzinach pracy, zwykle tego samego dnia.'
  },

  forms: {
    name: 'Imię', namePh: 'Jak się do Ciebie zwracać',
    email: 'E-mail', emailPh: 'name@example.com',
    phone: 'Telefon', phonePh: '+48 000 000 000',
    school: 'Szkoła', schoolPh: 'Numer i miasto',
    teacher: 'Nauczyciel', teacherPh: 'Imię i nazwisko',
    grade: 'Klasa', gradePh: 'Na przykład 7-B',
    kids: 'Liczba uczniów',
    date: 'Preferowana data',
    program: 'Program',
    message: 'Wiadomość', messagePh: 'Krótko o tym, czego potrzebujesz',
    consent: 'Zgadzam się na przetwarzanie danych osobowych w celu odpowiedzi na zgłoszenie',
    consentLink: 'Polityka prywatności',
    submitTickets: 'Kup bilety',
    submitSchool: 'Wyślij zgłoszenie',
    submitQuestion: 'Wyślij pytanie',
    errors: {
      required: 'Wypełnij to pole',
      email: 'Sprawdź adres: potrzebny format name@example.com',
      phone: 'Telefon w formacie +48 000 000 000',
      number: 'Wpisz liczbę',
      range: 'Wartość poza dozwolonym zakresem',
      consent: 'Bez zgody nie możemy odpowiedzieć na zgłoszenie',
      date: 'Wybierz datę z okresu trwania wystawy',
      session: 'Wybierz dzień i godzinę wejścia',
      empty: 'Dodaj przynajmniej jeden bilet',
      tooFast: 'Za szybko. Odczekaj pół minuty i spróbuj ponownie.',
      summary: 'Sprawdź zaznaczone pola'
    },
    successTitle: 'Zgłoszenie przyjęte',
    successTickets: 'W wersji produkcyjnej potwierdzenie poszłoby na podany adres. Tutaj żaden e-mail nie został wysłany i żadne dane nie zostały zapisane: strona działa bez backendu.',
    successSchool: 'W wersji produkcyjnej zgłoszenie trafiłoby do koordynatora grup. Tutaj nie zostało nigdzie wysłane: strona działa bez backendu.',
    successQuestion: 'W wersji produkcyjnej pytanie trafiłoby na skrzynkę muzeum. Tutaj nie zostało wysłane.',
    successAgain: 'Wypełnij jeszcze raz',
    demoNote: 'Formularz demonstracyjny: dane nie są wysyłane ani zapisywane.'
  },

  privacy: {
    h1: 'Polityka prywatności',
    template: 'To wzór, a nie dokument prawny. Przed publikacją musi go sprawdzić prawnik: zakres danych, okresy przechowywania i dane administratora zależą od tego, jak muzeum faktycznie obsługuje zgłoszenia.',
    updated: 'Wersja z 4 września 2026',
    sections: [
      { h: 'Kto przetwarza dane', p: 'Administratorem danych jest organizator wystawy STREFA PÓŁNOCY. Pełna nazwa, adres rejestrowy i kontakt do inspektora ochrony danych zostaną uzupełnione przed startem.' },
      { h: 'Jakie dane zbieramy', p: 'Wyłącznie to, co sam wpiszesz w formularze: imię, adres e-mail, telefon, a przy zgłoszeniach szkolnych także nazwę szkoły, klasę, liczbę uczniów i preferowaną datę. Na stronie nie ma ukrytych zbieraczy danych, liczników ani zewnętrznych skryptów.' },
      { h: 'Po co', p: 'Żeby odpowiedzieć na zgłoszenie, potwierdzić rezerwację i ustalić godzinę wizyty. Do wysyłek marketingowych te dane nie są używane.' },
      { h: 'Jak długo przechowujemy', p: 'Do końca wystawy i trzy miesiące po niej — na wypadek zwrotów i sytuacji spornych. Potem usuwamy.' },
      { h: 'Twoje prawa', p: 'Możesz poprosić o kopię swoich danych, sprostować je, żądać usunięcia, ograniczyć przetwarzanie lub wycofać zgodę. Wycofanie zgody nie wpływa na to, co wydarzyło się wcześniej. Skargę można złożyć do organu nadzorczego ds. ochrony danych.' },
      { h: 'Pliki cookie', p: 'Strona nie używa plików cookie i nie ma podłączonej analityki. W pamięci lokalnej przeglądarki zapisuje się wyłącznie wybrany język interfejsu — te dane nie opuszczają Twojego urządzenia.' },
      { h: 'Przekazywanie danych', p: 'Danych ze zgłoszeń nie przekazujemy nikomu poza pracownikami, którzy je obsługują. Danych płatniczych strona w ogóle nie zbiera: płatność, kiedy się pojawi, pójdzie przez osobnego operatora, po jego stronie.' }
    ]
  },

  notfound: {
    h1: 'Wyszedłeś poza mapę',
    text: 'Dokładnie zmierzono mniej niż jedną trzecią dna oceanu. Tej strony nie ma na żadnym z pomiarów.',
    cta: 'Wróć na powierzchnię'
  },

  footer: {
    nav: 'Sekcje', contacts: 'Kontakt', hours: 'Godziny',
    legal: 'Dokumenty',
    rights: 'Organizator wystawy',
    demo: 'Projekt demonstracyjny. Daty, adres, godziny i obłożenie są fikcyjne.'
  }
};
