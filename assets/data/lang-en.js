/* THE MIDNIGHT ZONE — English dictionary.
   Written in the same voice as the Russian original rather than translated
   literally. Worth a native proofread before launch — see README, "Limits". */
window.MZ_LANG = window.MZ_LANG || {};
window.MZ_LANG.en = {
  _meta: { code: 'en', name: 'EN', htmlLang: 'en', label: 'English' },

  nav: {
    dive: 'The dive', halls: 'Halls', tickets: 'Tickets',
    schools: 'Schools', visit: 'Getting here', buy: 'Buy a ticket',
    buyShort: 'Ticket',
    menu: 'Menu', close: 'Close', lang: 'Language', main: 'Main navigation',
    skip: 'Skip to content'
  },

  brand: { name: 'THE MIDNIGHT ZONE', sub: 'An exhibition about life in the deep' },

  common: {
    min: 'min', metres: 'm', currency: 'zł', from: 'from', of: 'of',
    more: 'Details', less: 'Collapse', back: 'Home',
    required: 'Required field', total: 'Total'
  },

  pages: {
    homeTitle: 'THE MIDNIGHT ZONE — a deep sea exhibition in Gdynia',
    homeDesc: 'Below 200 metres there is no sun. An exhibition about four kilometres of water that still holds life: 12 halls, submersible models, glowing creatures at full size and one hall in total darkness. Gdynia, 3 October to 7 February.',
    hallsTitle: 'Halls and exhibits — THE MIDNIGHT ZONE',
    hallsDesc: 'Twelve halls: from the edge of light at 200 metres to a map of the seafloor nobody has surveyed. A bathyscaphe at 1:2 scale, a living bacterial colony under pressure, eight minutes of total darkness.',
    ticketsTitle: 'Tickets and times — THE MIDNIGHT ZONE',
    ticketsDesc: 'Adult 45 zł, reduced 28 zł, family 130 zł. Availability calendar, entry every 90 minutes, a visit takes about 90 minutes.',
    schoolsTitle: 'Schools and groups — THE MIDNIGHT ZONE',
    schoolsDesc: 'Three programmes for ages 8 to 18, from 18 zł per student. Accompanying adults free, worksheet and teacher notes included.',
    visitTitle: 'Getting here and FAQ — THE MIDNIGHT ZONE',
    visitDesc: 'Address, transport, parking and answers to common questions: wheelchair access, age guidance, visit length, the hall in total darkness.',
    privacyTitle: 'Privacy policy — THE MIDNIGHT ZONE',
    notfoundTitle: 'Page not found — THE MIDNIGHT ZONE'
  },

  preloader: { label: 'Descending', skip: 'Skip' },

  dive: {
    aria: 'The dive: the page changes as you scroll',
    scaleLabel: 'Depth scale',
    hint: 'Scroll down',
    facts: { depth: 'Depth', temp: 'Temperature', pressure: 'Pressure', light: 'Light' },
    lightNone: 'none',
    lightOne: '1% of surface',
    lightFull: 'full',

    surface: {
      label: 'Surface',
      h1: 'BELOW 200 METRES THERE IS NO SUN',
      sub: 'An exhibition about four kilometres of water that still holds life. 12 halls. One of them in total darkness.',
      dates: '3 October 2026 — 7 February 2027',
      place: 'Maritime Museum, Gdynia',
      cta: 'Begin the dive'
    },
    epi: {
      label: 'Epipelagic',
      h2: 'Algae still grow here. Below, they do not.',
      text: 'The first two hundred metres hold every part of the ocean we recognise. Deeper down photosynthesis stops: there is not enough light even for algae.'
    },
    twilight: {
      label: 'Twilight zone',
      h2: 'Light still reaches. Nothing can grow on it.',
      text: 'Relative to their bodies, the eyes of fish down here are four times larger than ours. They need every surviving photon.'
    },
    midnight: {
      label: 'Midnight zone',
      h2: 'From here to the bottom: 11 kilometres of permanent night',
      text: 'Below one kilometre the only light is made by the animals themselves. Nine in ten species here glow.',
      quote: 'People fear the deep not because there are monsters down there. Because there is nobody down there.',
      quoteAuthor: 'Curator, oceanographer'
    },
    abyssal: {
      label: 'Abyssal',
      h2: 'Silt, crabs, silence.',
      text: 'Half of the planet surface is this plain. The temperature here has not changed in thousands of years.',
      highlights: 'What you will see'
    },
    hadal: {
      label: 'Hadal',
      h2: 'We have surveyed the ocean floor less than the surface of Mars.',
      text: 'Come and look at the little we know.',
      cta: 'Buy a ticket',
      ctaSchools: 'Book for a class'
    },
    surfaced: { label: 'Surfacing', note: 'From here on: ordinary information, in daylight.' }
  },

  halls: {
    h1: 'Twelve halls',
    lead: 'A visit takes about 90 minutes. The order of the halls is the order of the descent: from the edge of light to a map of what we do not know.',
    hall: 'Hall',
    duration: 'Time',
    photoStub: 'Hall photo — to be replaced',
    photoBy: 'Photo',
    creditsTitle: 'Photo credits',
    imagesTitle: 'About the hall images',
    generatedNote: 'The exhibition has not opened yet, so there are no photographs of its halls. The images on this page are AI-generated visualisations of how the halls will look. They will be replaced with real photographs after the opening.',
    creditsNote: 'The exhibition is fictional, so it has no photographs of its own halls. These are freely licensed photos of real deep sea exhibits, aquariums and museum objects from Wikimedia Commons, toned into a single series.',
    warnTitle: 'Hall 7: not for anyone afraid of the dark',
    warnText: 'Eight minutes without a single source of light. One visitor at a time, the door is never locked, you can leave whenever you want. Under 8s only with an adult.',
    warnList: [
      'One person at a time, two minutes apart',
      'Sound only inside: no screens, no glow strips',
      'A member of staff waits at the exit',
      'The hall can be bypassed through a short corridor'
    ],
    items: {
      edge:       { title: 'The edge of light', desc: 'Photosynthesis ends at two hundred metres. The hall shows it literally: a line across the floor, past which nothing grows.' },
      pressure:   { title: 'Pressure', desc: 'A hydraulic press crushes a foam cup down to the size of a thimble. Every half hour, in front of visitors.' },
      anglerfish: { title: 'Anglerfish', desc: 'A model at true scale. It is smaller than you think — 20 cm. It looks worse in photographs.' },
      glow:       { title: 'Bioluminescence', desc: 'A dark hall where the exhibits are the only light. Forty models, each with its own kind of glow.' },
      snow:       { title: 'Marine snow', desc: 'A six-metre column with debris falling through it without pause. This is what everything below feeds on.' },
      voices:     { title: 'Voices of the deep', desc: 'Hydrophone recordings: sperm whale clicks, cracking ice, and a low rumble nobody has explained yet.' },
      blackout:   { title: 'Total darkness', desc: 'Eight minutes without a single source of light, sound only. One visitor at a time.' },
      squid:      { title: 'Giant squid', desc: 'A twelve-metre model overhead. A living one was first filmed only in 2004.' },
      trieste:    { title: 'Bathyscaphe Trieste', desc: 'A 1:2 replica you can step inside. Two men spent nine hours in a sphere this size.' },
      smokers:    { title: 'Black smokers', desc: 'Hydrothermal vents: water at +400 °C, surrounded by life that has no use for the sun at all.' },
      colony:     { title: 'A living colony', desc: 'Deep sea bacteria under real pressure, in a chamber with a viewport. The only living exhibits here.' },
      unknown:    { title: 'What we do not know', desc: 'A map of what has been surveyed: less than a third of the ocean floor in detail. The rest is a blank wall.' }
    }
  },

  timeline: {
    h2: 'A history of the descent',
    hint: 'Keep scrolling down — the movement runs sideways',
    crewLabel: 'Crew',
    depthLabel: 'Depth',
    items: {
      trieste: { name: 'Trieste', crew: 'Jacques Piccard and Don Walsh', note: 'The first people on the floor of the Mariana Trench. A window cracked halfway down and they carried on.' },
      kaiko:   { name: 'Kaikō', crew: 'remote', note: 'A Japanese uncrewed vehicle. It did the same trip and brought back the first sediment samples.' },
      cameron: { name: 'Deepsea Challenger', crew: 'James Cameron', note: 'Alone, in a vertical capsule about as wide as a chair. He spent roughly three hours on the bottom.' },
      vescovo: { name: 'Limiting Factor', crew: 'Victor Vescovo', note: 'Five separate descents. On the floor he found a plastic bag.' }
    }
  },

  tickets: {
    h1: 'Tickets',
    lead: 'Timed entry every 90 minutes. A visit takes about 90 minutes and you are welcome to stay longer.',
    tariffsTitle: 'Prices',
    weekday: 'Weekdays', weekend: 'Weekends',
    priceMode: 'Day type',
    names: { adult: 'Adult', reduced: 'Reduced', family: 'Family' },
    notes: {
      adult: 'Age 19 and over, no time limit inside',
      reduced: 'School pupils, students, pensioners — with ID',
      family: 'Two adults and two children under 18'
    },
    calendarTitle: 'Pick a day',
    monthPrev: 'Previous month', monthNext: 'Next month',
    occupancy: { free: 'Available', few: 'Few left', none: 'Sold out', closed: 'Closed' },
    occupancyLegend: 'Availability',
    closedNote: 'The exhibition is closed on Mondays.',
    sessionsTitle: 'Entry times',
    sessionsHint: 'Pick a day in the calendar first.',
    seatsLeft: 'places',
    soldOut: 'sold out',
    calcTitle: 'Tickets',
    nothingSelected: 'No tickets selected',
    plus: 'Add', minus: 'Remove',
    rulesTitle: 'What is not allowed',
    rules: [
      'Flash photography: it washes out the lit exhibits',
      'Food and drink in the halls',
      'Entering hall 7 as a group, or talking inside it',
      'Backpacks larger than hand luggage — there is a left luggage desk'
    ],
    monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekdayShort: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    weekdayFull: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    outOfRange: 'The exhibition is not open on this day'
  },

  schools: {
    h1: 'Schools and groups',
    lead: 'Weekday mornings. Groups of 10 to 30 students, accompanying adults free — one adult per ten children.',
    programsTitle: 'Programmes',
    age: 'Age', duration: 'Length', price: 'Per student',
    years: 'years',
    programs: {
      kids:  { title: 'Who lives in the dark', desc: 'A guided walk without difficult terms. The total darkness hall is swapped for a short corridor, at the teacher discretion.' },
      mid:   { title: 'Pressure and life', desc: 'The physics of depth through experiments: the hydraulic press, density, the heat capacity of water. The worksheet is filled in as you go.' },
      teens: { title: 'How the seafloor is surveyed', desc: 'Submersibles, sonar, sediment sampling. A conversation about why most of the floor is still unmapped in detail.' }
    },
    bringTitle: 'What to bring',
    bring: [
      'A list of students with surnames — needed at the entrance',
      'Pencils: the halls are dark and pen is hard to see on the worksheet',
      'A warm layer — hall 11 is kept at +14 °C',
      'Your booking confirmation, on a phone or printed'
    ],
    filesTitle: 'Teacher materials',
    files: [
      { name: 'Worksheet, ages 11–14', meta: 'PDF · 2 pages' },
      { name: 'Programme notes', meta: 'PDF · 9 pages' }
    ],
    fileStub: 'Placeholder file: replace before launch',
    formTitle: 'Group booking request',
    formLead: 'We reply within one working day and confirm the time. Payment on site, invoiced to the school.'
  },

  visit: {
    h1: 'Getting here',
    address: 'Maritime Museum, Portowa 12, Gdynia',
    addressNote: 'Entrance from the waterfront side, a separate door with a black sign.',
    hoursTitle: 'Opening hours',
    hours: 'Tuesday to Sunday, 10:00 — 20:00. Last entry 19:00. Closed Mondays.',
    transportTitle: 'Transport',
    transport: [
      { name: 'SKM train', text: 'Gdynia Główna station, then 15 minutes on foot along the waterfront' },
      { name: 'Bus', text: 'Muzeum Morskie stop, routes 109, 119, 133' },
      { name: 'Car', text: 'Paid parking at the museum, 40 spaces. Full by midday at weekends' },
      { name: 'On foot', text: 'Ten minutes along the water from Kościuszko Square' }
    ],
    mapTitle: 'Approach map',
    mapNote: 'This map is drawn, not embedded: third party maps bring trackers with them and do not work offline.',
    faqTitle: 'Common questions',
    faq: [
      { q: 'Can I come with a pushchair?', a: 'Yes. Every hall is on one level and there is a lift and a ramp at the entrance. Pushchairs cannot go into hall 7, but there is a place to leave one right next to it.' },
      { q: 'What age is this for?', a: 'From about eight. Younger children sometimes find halls 4 and 7 frightening, but both can be bypassed through a short corridor without losing the route.' },
      { q: 'How long does a visit take?', a: 'Around 90 minutes at a normal pace. Reading every label and waiting for the hydraulic press demonstration takes up to two and a half hours. There is no time limit inside.' },
      { q: 'Is hall 7 actually frightening?', a: 'It is dark and quiet, but nothing happens: no loud noises, nothing touches you, nothing moves. The door is not locked and you can leave at any moment.' },
      { q: 'Can I take photos?', a: 'Yes, without flash. Flash washes out the lit models and disturbs other visitors, whose eyes need about three minutes to adjust.' },
      { q: 'Is there a cloakroom?', a: 'Yes, and left luggage, both free, by the entrance. Large backpacks are not allowed in the halls: the gaps between cases are narrow.' },
      { q: 'What if I miss my entry time?', a: 'You will be let in at the next available slot. The ticket is tied to the day, not the minute, though at weekends the wait can reach 90 minutes.' },
      { q: 'Is the exhibition accessible for deaf visitors?', a: 'Every audio piece in hall 6 has a text version. Tours in Polish Sign Language can be arranged in advance through the form on this page.' }
    ],
    questionTitle: 'Still have a question?',
    questionLead: 'Write to us — we answer during opening hours, usually the same day.'
  },

  forms: {
    name: 'Name', namePh: 'What should we call you',
    email: 'Email', emailPh: 'name@example.com',
    phone: 'Phone', phonePh: '+48 000 000 000',
    school: 'School', schoolPh: 'Number and city',
    teacher: 'Teacher', teacherPh: 'First and last name',
    grade: 'Class', gradePh: 'For example, 7B',
    kids: 'Number of students',
    date: 'Preferred date',
    program: 'Programme',
    message: 'Message', messagePh: 'Briefly, what you need',
    consent: 'I agree to my personal data being processed so you can answer this request',
    consentLink: 'Privacy policy',
    submitTickets: 'Buy tickets',
    submitSchool: 'Send request',
    submitQuestion: 'Send question',
    errors: {
      required: 'Please fill in this field',
      email: 'Check the address: the format is name@example.com',
      phone: 'Phone in the format +48 000 000 000',
      number: 'Enter a number',
      range: 'Value outside the allowed range',
      consent: 'Without consent we cannot answer your request',
      date: 'Pick a date within the run of the exhibition',
      session: 'Pick a day and an entry time',
      empty: 'Add at least one ticket',
      tooFast: 'Too quick. Wait half a minute and try again.',
      summary: 'Check the highlighted fields'
    },
    successTitle: 'Request received',
    successTickets: 'In the live version a confirmation would go to the address you gave. Here no email was sent and nothing was stored: this site runs without a backend.',
    successSchool: 'In the live version this would reach the group coordinator. Here it was not sent anywhere: this site runs without a backend.',
    successQuestion: 'In the live version this would reach the museum inbox. Here it was not sent.',
    successAgain: 'Fill it in again',
    demoNote: 'Demo form: nothing is sent and nothing is stored.'
  },

  privacy: {
    h1: 'Privacy policy',
    template: 'This is a template, not a legal document. A lawyer has to review it before publication: the data collected, retention periods and controller details depend on how the museum actually handles requests.',
    updated: 'Revision of 4 September 2026',
    sections: [
      { h: 'Who processes the data', p: 'The data controller is the organiser of THE MIDNIGHT ZONE. Full legal name, registered address and the data protection contact are filled in before launch.' },
      { h: 'What we collect', p: 'Only what you type into the forms: name, email, phone, and for school requests the school name, class, number of students and preferred date. There are no hidden collectors, counters or third party scripts on this site.' },
      { h: 'Why', p: 'To answer your request, confirm a booking and agree a time for your visit. This data is not used for marketing.' },
      { h: 'How long we keep it', p: 'Until the exhibition closes plus three months, in case of refunds or disputes. After that it is deleted.' },
      { h: 'Your rights', p: 'You can request a copy of your data, correct it, ask for deletion, restrict processing or withdraw consent. Withdrawing consent does not affect what was done before. You can complain to the data protection authority.' },
      { h: 'Cookies', p: 'This site sets no cookies and loads no analytics. Local browser storage holds only your chosen interface language, and that never leaves your device.' },
      { h: 'Sharing', p: 'Request data is not shared with anyone beyond the staff handling that request. The site collects no payment data at all: when payment is added it will run through a separate provider, on their side.' }
    ]
  },

  notfound: {
    h1: 'You have gone off the map',
    text: 'Less than a third of the ocean floor has been surveyed in detail. This page is not on any of those surveys.',
    cta: 'Return to the surface'
  },

  footer: {
    nav: 'Sections', contacts: 'Contact', hours: 'Hours',
    legal: 'Documents',
    rights: 'Exhibition organiser',
    demo: 'Demo project. Dates, address, times and availability are invented.'
  }
};
