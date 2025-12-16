export type Language = 'pl' | 'en' | 'uk';

interface Translations {
  // Header
  events: string;
  localProducers: string;
  map: string;
  aboutUs: string;
  language: string;
  polish: string;
  english: string;
  ukrainian: string;
  openMainMenu: string;

  // Map Page
  seeAllEventsOnMap: string;
  eventCategories: string;
  event: string;
  events_plural: string;

  // Categories
  concerts: string;
  festivals: string;
  theatre: string;
  cinema: string;
  workshops: string;
  food: string;
  cultural: string;
  other: string;

  // Footer
  discoverEvents: string;
  quickLinks: string;
  categories: string;
  contact: string;
  allRightsReserved: string;
  privacyPolicy: string;
  terms: string;
}

const translations: Record<Language, Translations> = {
  pl: {
    // Header
    events: 'Wydarzenia',
    localProducers: 'Lokalni Producenci',
    map: 'Mapa',
    aboutUs: 'O nas',
    language: 'Język',
    polish: 'Polski',
    english: 'English',
    ukrainian: 'Українська',
    openMainMenu: 'Otwórz menu główne',

    // Map Page
    seeAllEventsOnMap: 'Zobacz wszystkie wydarzenia w Bieszczadach na mapie',
    eventCategories: 'Kategorie wydarzeń:',
    event: 'wydarzenie',
    events_plural: 'wydarzenia',

    // Categories
    concerts: 'Koncerty',
    festivals: 'Festiwale',
    theatre: 'Teatr',
    cinema: 'Kino',
    workshops: 'Warsztaty',
    food: 'Gastronomia',
    cultural: 'Kultura',
    other: 'Inne',

    // Footer
    discoverEvents: 'Odkrywaj wydarzenia, kulturę i lokalnych producentów w sercu Podkarpacia.',
    quickLinks: 'Szybkie linki',
    categories: 'Kategorie',
    contact: 'Kontakt',
    allRightsReserved: 'Wszelkie prawa zastrzeżone.',
    privacyPolicy: 'Polityka prywatności',
    terms: 'Regulamin',
  },
  en: {
    // Header
    events: 'Events',
    localProducers: 'Local Producers',
    map: 'Map',
    aboutUs: 'About Us',
    language: 'Language',
    polish: 'Polski',
    english: 'English',
    ukrainian: 'Українська',
    openMainMenu: 'Open main menu',

    // Map Page
    seeAllEventsOnMap: 'See all events in Bieszczady on the map',
    eventCategories: 'Event categories:',
    event: 'event',
    events_plural: 'events',

    // Categories
    concerts: 'Concerts',
    festivals: 'Festivals',
    theatre: 'Theatre',
    cinema: 'Cinema',
    workshops: 'Workshops',
    food: 'Food',
    cultural: 'Cultural',
    other: 'Other',

    // Footer
    discoverEvents: 'Discover events, culture and local producers in the heart of Podkarpacie.',
    quickLinks: 'Quick Links',
    categories: 'Categories',
    contact: 'Contact',
    allRightsReserved: 'All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms of Service',
  },
  uk: {
    // Header
    events: 'Події',
    localProducers: 'Місцеві Виробники',
    map: 'Карта',
    aboutUs: 'Про нас',
    language: 'Мова',
    polish: 'Polski',
    english: 'English',
    ukrainian: 'Українська',
    openMainMenu: 'Відкрити головне меню',

    // Map Page
    seeAllEventsOnMap: 'Переглянути всі події в Бещадах на карті',
    eventCategories: 'Категорії подій:',
    event: 'подія',
    events_plural: 'події',

    // Categories
    concerts: 'Концерти',
    festivals: 'Фестивалі',
    theatre: 'Театр',
    cinema: 'Кіно',
    workshops: 'Майстер-класи',
    food: 'Гастрономія',
    cultural: 'Культура',
    other: 'Інше',

    // Footer
    discoverEvents: 'Відкривайте події, культуру та місцевих виробників у серці Підкарпаття.',
    quickLinks: 'Швидкі посилання',
    categories: 'Категорії',
    contact: 'Контакт',
    allRightsReserved: 'Всі права захищені.',
    privacyPolicy: 'Політика конфіденційності',
    terms: 'Умови використання',
  },
};

export const getTranslations = (lang: Language): Translations => {
  return translations[lang];
};

export default translations;
