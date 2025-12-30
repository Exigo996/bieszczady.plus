import type { Event } from '../types/event';

export const mockEvents: Event[] = [
  // DECEMBER 2025 EVENTS
  {
    id: 100,
    title: {
      pl: "AVATAR: OGIEŃ I POPIÓŁ (3D, NAPISY PL)",
      en: "AVATAR: THE FIRE AND ASH (3D, SUBTITLES)"
    },
    description: {
      pl: "Jake Sully (Sam Worthington) i Neytiri (Zoe Saldaña), stojąc na czele zjednoczonych klanów Na'vi, muszą zmierzyć się z nowym, jeszcze bardziej bezwzględnym zagrożeniem, które przybywa z Ziemi - ogniem, który spopiela wszystko na swojej drodze. Tym razem historia prowadzi nas do wulkanicznych krain Pandory, gdzie żyje tajemniczy klan Zaran - wojownicy żyjący w harmonii z ogniem i popiołem. Sojusze zostaną poddane próbie, granice wytrzymałości przekroczone, a walka o przyszłość Pandory stanie się bardziej osobista niż kiedykolwiek.",
      en: "Jake Sully (Sam Worthington) and Neytiri (Zoe Saldaña), leading the united Na'vi clans, must face a new, even more ruthless threat from Earth - fire that scorches everything in its path. This time, the story takes us to the volcanic lands of Pandora, home to the mysterious Zaran clan - warriors living in harmony with fire and ash. Alliances will be tested, limits pushed, and the fight for Pandora's future will become more personal than ever."
    },
    slug: "avatar-ogien-i-popiol",
    category: "CINEMA",
    event_type: "EVENT",
    start_date: "2025-12-27T18:00:00Z",
    duration_minutes: 197,
    age_restriction: 13,
    location: {
      id: 10,
      name: "Dom Kultury w Lesku",
      coordinates: { lat: 49.4700, lng: 22.3300 },
      distance: 23.5,
    },
    price_type: "PAID",
    price_amount: 35,
    price_currency: "PLN",
    image: "/AVATAR.jpeg",
    ticket_url: "https://bdk.systembiletowy.pl/index.php/repertoire.html?id=1118",
    created_at: "2025-12-19T10:00:00Z",
    updated_at: "2025-12-19T10:00:00Z",
  },
  {
    id: 1,
    title: {
      pl: '„André Rieu. Wesołych Świąt!"',
      en: "André Rieu. Merry Christmas!",
    },
    description: {
      pl: "Zobacz z najbliższymi nowy bożonarodzeniowo-noworoczny koncert André Rieu i jego Orkiestry Johanna Straussa! Najnowsze kinowe widowisko króla walca przeniesie Was w prawdziwie magiczny świat świątecznej muzyki i radości. Usłyszycie najpiękniejsze kolędy, cudowne walce i polki.",
      en: "See the new Christmas and New Year concert by André Rieu and his Johann Strauss Orchestra! The latest cinema show by the king of waltz will transport you to a truly magical world of festive music and joy.",
    },
    slug: "andre-rieu-wesolych-swiat",
    category: "CONCERT",
    event_type: "EVENT",
    start_date: "2025-12-28T19:30:00Z",
    location: {
      id: 1,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 30,
    price_currency: "PLN",
    image: "/koncert.jpg",
    ticket_url: "https://udk.systembiletowy.pl/index.php/repertoire.html?id=984",
    created_at: "2025-12-15T20:00:00Z",
    updated_at: "2025-12-15T20:00:00Z",
  },
  {
    id: 103,
    title: {
      pl: "Kolęda bez granic",
      en: "Carol Without Borders"
    },
    description: {
      pl: "Świąteczne wydarzenie składające się z dwóch części: korowodu ulicami miasta ze śpiewaniem kolęd oraz transmisji na żywo koncertu \"Kolęda bez Granic\" z Ustrzyckiego Domu Kultury. Śląska kolędna gastronomia z ciepłym napojem i rodzinnem. Weź ze sobą lampę ognia - latarkę lub inny dowolny lampion!",
      en: "Christmas event consisting of two parts: a procession through the city streets with carol singing and a live broadcast of the 'Carol Without Borders' concert from the Ustrzycki Cultural Center. Silesian carol gastronomy with warm drinks and family atmosphere."
    },
    slug: "koleda-bez-granic",
    category: "CULTURAL",
    event_type: "EVENT",
    start_date: "2025-12-29T16:00:00Z",
    duration_minutes: 120,
    location: {
      id: 1,
      name: "Ustrzyki Dolne - Rynek Centrum",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "FREE",
    price_currency: "PLN",
    image: "/koleda.jpeg",
    created_at: "2025-12-19T13:00:00Z",
    updated_at: "2025-12-19T13:00:00Z",
  },

  {
    id: 101,
    title: {
      pl: "ZWIERZOGRÓD 2 - Film 2D dubbing",
      en: "Zootopia 2 - 2D Dubbed"
    },
    description: {
      pl: "Detektywi Judy Hops i Nick Bajer depczą po piętach pewnemu nieuchwytnemu gadowi, który zjawia się w mieście ssaków i wywraca je do góry nogami.",
      en: "Detectives Judy Hopps and Nick Wilde are on the trail of an elusive reptile who shows up in the city of mammals and turns it upside down."
    },
    slug: "zwierzogrod-2",
    category: "CINEMA",
    event_type: "EVENT",
    start_date: "2025-12-30T17:00:00Z",
    duration_minutes: 105,
    location: {
      id: 1,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 25,
    price_currency: "PLN",
    image: "/zwier.jpg",
    ticket_url: "https://udk.systembiletowy.pl/index.php/repertoire.html?id=993",
    created_at: "2025-12-19T12:00:00Z",
    updated_at: "2025-12-19T12:00:00Z",
  },
  {
    id: 102,
    title: {
      pl: "MINISTRANCI - FILM 2D",
      en: "Altar Boys - 2D Film"
    },
    description: {
      pl: "Grupa nastoletnich ministrantów, sfrustrowana obojętną postawą dorosłych i instytucji Kościoła wobec niesprawiedliwości społecznej, postanawia wdrożyć własny, nietypowy plan odnowy moralnej.",
      en: "A group of teenage altar boys, frustrated by adults' indifferent attitude and the Church's stance on social injustice, decide to implement their own unconventional plan for moral renewal."
    },
    slug: "ministranci",
    category: "CINEMA",
    event_type: "EVENT",
    start_date: "2025-12-31T19:00:00Z",
    duration_minutes: 110,
    age_restriction: 13,
    location: {
      id: 1,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "PAID",
    price_amount: 25,
    price_currency: "PLN",
    image: "/film.jpg",
    ticket_url: "https://udk.systembiletowy.pl/index.php/repertoire.html?id=996",
    created_at: "2025-12-19T12:30:00Z",
    updated_at: "2025-12-19T12:30:00Z",
  },

  // JANUARY 2026 EVENTS
  {
    id: 104,
    title: {
      pl: "XXXIX BIESZCZADZKI BIEG LOTNIKÓW",
      en: "XXXIX Bieszczady Airmen's Run"
    },
    description: {
      pl: "Jedna z najbardziej kultowych zimowych imprez sportowych w Polsce. Bieg odbędzie się na Trasach Biegowych pod Żukowem.",
      en: "One of the most iconic winter sports events in Poland."
    },
    slug: "bieg-lotnikow",
    category: "FESTIVAL",
    event_type: "EVENT",
    start_date: "2026-01-04T08:00:00Z",
    duration_minutes: 390,
    location: {
      id: 11,
      name: "Ustjanowa Górna - Trasy pod Żukowem",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 5.2,
    },
    price_type: "PAID",
    price_currency: "PLN",
    image: "/bieg.jpg",
    external_url: "https://kepasport.pl/wydarzenie/xxxix-bieszczadzki-bieg-lotnikow/",
    ticket_url: "https://kepasport.pl/wydarzenie/xxxix-bieszczadzki-bieg-lotnikow/",
    created_at: "2025-12-19T13:30:00Z",
    updated_at: "2025-12-19T13:30:00Z",
  },
  {
    id: 105,
    title: {
      pl: "XVII Przegląd Filmów Górskich",
      en: "XVII Mountain Film Review"
    },
    description: {
      pl: "Wyjątkowe, zimowe spotkanie ludzi gór, kina i przygody w ramach Zimowego Weekendu w Ustrzykach Dolnych.",
      en: "A unique winter gathering of mountain people, cinema and adventure."
    },
    slug: "przeglad-filmow-gorskich",
    category: "CULTURAL",
    event_type: "EVENT",
    start_date: "2026-01-10T17:00:00Z",
    duration_minutes: 180,
    location: {
      id: 1,
      name: "Ustrzycki Dom Kultury",
      coordinates: { lat: 49.4302, lng: 22.5965 },
      distance: 0.5,
    },
    price_type: "FREE",
    price_currency: "PLN",
    image: "/gorskie.jpg",
    created_at: "2025-12-19T13:30:00Z",
    updated_at: "2025-12-19T13:30:00Z",
  },
];
