import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Główna nawigacja">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center -ml-2">
            <a href="/" className="group">
              <div className="relative z-10">
                <img
                  src="/bieszczadyplus1.png"
                  alt="Bieszczady.plus"
                  className="h-28 w-auto transition-all duration-300 group-hover:scale-110 drop-shadow-2xl"
                  style={{ marginTop: '-1.5rem', marginBottom: '-1.5rem' }}
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <a
              href="/"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors border-b-2 border-blue-600"
              aria-current="page"
            >
              Wydarzenia
            </a>
            <a
              href="/produkty"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-blue-600"
            >
              Lokalni Producenci
            </a>
            <a
              href="/mapa"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-blue-600"
            >
              Mapa
            </a>
            <a
              href="/o-nas"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-blue-600"
            >
              O nas
            </a>
          </div>

          {/* Language Selector - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              aria-label="Język polski"
            >
              PL
            </button>
            <button
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="English language"
            >
              EN
            </button>
            <button
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
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
              <span className="sr-only">Otwórz menu główne</span>
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
              <a
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600"
                aria-current="page"
              >
                Wydarzenia
              </a>
              <a
                href="/produkty"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Lokalni Producenci
              </a>
              <a
                href="/mapa"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Mapa
              </a>
              <a
                href="/o-nas"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                O nas
              </a>
            </div>

            {/* Language Selector - Mobile */}
            <div className="px-2 pt-2 pb-4 border-t border-gray-200">
              <p className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Język
              </p>
              <div className="flex space-x-2 px-3">
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  aria-label="Język polski"
                >
                  Polski
                </button>
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  aria-label="English language"
                >
                  English
                </button>
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  aria-label="Українська мова"
                >
                  Українська
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
