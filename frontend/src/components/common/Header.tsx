import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslations } from '../../translations';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const t = getTranslations(language);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Główna nawigacja">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center -ml-2">
            <Link to="/" className="group">
              <div className="relative z-10">
                <img
                  src="/bieszczadyplus1.png"
                  alt="Bieszczady.plus"
                  className="h-28 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-2xl"
                  style={{ marginTop: '-1.5rem', marginBottom: '-1.5rem' }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive('/')
                  ? 'text-gray-900 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              {t.events}
            </Link>
            <Link
              to="/produkty"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive('/produkty')
                  ? 'text-gray-900 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600'
              }`}
            >
              {t.localProducers}
            </Link>
            <Link
              to="/mapa"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive('/mapa')
                  ? 'text-gray-900 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600'
              }`}
            >
              {t.map}
            </Link>
            <Link
              to="/o-nas"
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive('/o-nas')
                  ? 'text-gray-900 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-600'
              }`}
            >
              {t.aboutUs}
            </Link>
          </div>

          {/* Language Selector - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setLanguage('pl')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                language === 'pl'
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Język polski"
            >
              PL
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                language === 'en'
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="English language"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('uk')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                language === 'uk'
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Українська мова"
            >
              UA
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">{t.openMainMenu}</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/')
                    ? 'text-white bg-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                } transition-colors`}
                aria-current={isActive('/') ? 'page' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.events}
              </Link>
              <Link
                to="/produkty"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/produkty')
                    ? 'text-white bg-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.localProducers}
              </Link>
              <Link
                to="/mapa"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/mapa')
                    ? 'text-white bg-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.map}
              </Link>
              <Link
                to="/o-nas"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/o-nas')
                    ? 'text-white bg-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.aboutUs}
              </Link>
            </div>

            {/* Language Selector - Mobile */}
            <div className="px-2 pt-2 pb-4 border-t border-gray-200">
              <p className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t.language}
              </p>
              <div className="flex space-x-2 px-3">
                <button
                  onClick={() => setLanguage('pl')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    language === 'pl'
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label="Język polski"
                >
                  {t.polish}
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    language === 'en'
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label="English language"
                >
                  {t.english}
                </button>
                <button
                  onClick={() => setLanguage('uk')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    language === 'uk'
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label="Українська мова"
                >
                  {t.ukrainian}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
